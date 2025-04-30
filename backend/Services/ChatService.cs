// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Services\ChatService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace WebTestUI.Backend.Services
{
    public class ChatService : IChatService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public ChatService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        public async Task<ChatMessageDto> CreateMessageAsync(string userId, CreateChatMessageDto messageDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return null;

            var message = new ChatMessage
            {
                UserId = userId,
                Content = messageDto.Content,
                IsFromUser = true,
                CreatedAt = DateTime.UtcNow,
                SessionId = messageDto.SessionId,
                ModelType = messageDto.ModelType
            };

            await _context.ChatMessages.AddAsync(message);
            await _context.SaveChangesAsync();

            // Get AI response
            var aiRequest = new AiCompletionRequest
            {
                Prompt = messageDto.Content,
                ModelType = messageDto.ModelType,
                PreviousMessages = await GetPreviousMessagesForContext(messageDto.SessionId, userId)
            };

            var aiResponse = await GetAiCompletionAsync(userId, aiRequest);

            // Save AI response
            if (aiResponse.Success)
            {
                var aiMessage = new ChatMessage
                {
                    UserId = userId,
                    Content = aiResponse.Response,
                    IsFromUser = false,
                    CreatedAt = DateTime.UtcNow,
                    SessionId = messageDto.SessionId,
                    ModelType = messageDto.ModelType,
                    ModelResponse = aiResponse.Response
                };

                await _context.ChatMessages.AddAsync(aiMessage);
                await _context.SaveChangesAsync();

                // Update user message with AI response
                message.ModelResponse = aiResponse.Response;
                _context.ChatMessages.Update(message);
                await _context.SaveChangesAsync();
            }

            return new ChatMessageDto
            {
                Id = message.Id,
                Content = message.Content,
                UserId = message.UserId,
                UserName = user.Name ?? user.UserName,
                IsFromUser = message.IsFromUser,
                CreatedAt = message.CreatedAt,
                SessionId = message.SessionId,
                ModelResponse = aiResponse.Success ? aiResponse.Response : "Failed to get AI response"
            };
        }

        private async Task<List<ChatMessageDto>> GetPreviousMessagesForContext(string sessionId, string userId)
        {
            // Get up to last 10 messages from this session for context
            return await _context.ChatMessages
                .Where(m => m.SessionId == sessionId && m.UserId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(10)
                .Select(m => new ChatMessageDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    UserId = m.UserId,
                    IsFromUser = m.IsFromUser,
                    CreatedAt = m.CreatedAt,
                    SessionId = m.SessionId
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<ChatMessageDto>> GetMessagesBySessionIdAsync(string sessionId, string userId)
        {
            var messages = await _context.ChatMessages
                .Include(m => m.User)
                .Where(m => m.SessionId == sessionId && m.UserId == userId)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new ChatMessageDto
                {
                    Id = m.Id,
                    Content = m.Content,
                    UserId = m.UserId,
                    UserName = m.User.Name ?? m.User.UserName,
                    IsFromUser = m.IsFromUser,
                    CreatedAt = m.CreatedAt,
                    SessionId = m.SessionId,
                    ModelResponse = m.ModelResponse
                })
                .ToListAsync();

            return messages;
        }

        public async Task<IEnumerable<ChatSessionDto>> GetAllSessionsByUserIdAsync(string userId)
        {
            // Get distinct session IDs for user
            var sessionIds = await _context.ChatMessages
                .Where(m => m.UserId == userId)
                .Select(m => m.SessionId)
                .Distinct()
                .ToListAsync();

            var sessions = new List<ChatSessionDto>();

            foreach (var sessionId in sessionIds)
            {
                // Get first and last message dates for each session
                var firstMessage = await _context.ChatMessages
                    .Where(m => m.SessionId == sessionId && m.UserId == userId)
                    .OrderBy(m => m.CreatedAt)
                    .FirstOrDefaultAsync();

                var lastMessage = await _context.ChatMessages
                    .Where(m => m.SessionId == sessionId && m.UserId == userId)
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefaultAsync();

                if (firstMessage != null)
                {
                    var sessionMessages = await _context.ChatMessages
                        .Where(m => m.SessionId == sessionId && m.UserId == userId)
                        .OrderBy(m => m.CreatedAt)
                        .Take(3) // Just get first 3 messages for preview
                        .Select(m => new ChatMessageDto
                        {
                            Id = m.Id,
                            Content = m.Content,
                            UserId = m.UserId,
                            IsFromUser = m.IsFromUser,
                            CreatedAt = m.CreatedAt,
                            SessionId = m.SessionId
                        })
                        .ToListAsync();

                    sessions.Add(new ChatSessionDto
                    {
                        SessionId = sessionId,
                        Messages = sessionMessages,
                        CreatedAt = firstMessage.CreatedAt,
                        LastMessageAt = lastMessage?.CreatedAt
                    });
                }
            }

            return sessions.OrderByDescending(s => s.LastMessageAt);
        }

        public async Task<AiCompletionResponse> GetAiCompletionAsync(string userId, AiCompletionRequest request)
        {
            var apiKey = _configuration["AIService:GeminiApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                return new AiCompletionResponse
                {
                    Success = false,
                    Error = "Gemini API key is not configured."
                };
            }

            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{request.ModelType}:generateContent?key={apiKey}";

            var messages = new List<object>();

            // Add previous messages for context
            foreach (var msg in request.PreviousMessages)
            {
                messages.Add(new { role = msg.IsFromUser ? "user" : "model", parts = new[] { new { text = msg.Content } } });
            }

            // Add the current user prompt
            messages.Add(new { role = "user", parts = new[] { new { text = request.Prompt } } });

            var geminiRequest = new
            {
                contents = messages,
                generationConfig = new
                {
                    temperature = request.Temperature
                }
            };

            try
            {
                var jsonRequest = JsonSerializer.Serialize(geminiRequest);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                var httpResponse = await _httpClient.PostAsync(apiUrl, content);

                if (httpResponse.IsSuccessStatusCode)
                {
                    var jsonResponse = await httpResponse.Content.ReadAsStringAsync();
                    var geminiResponse = JsonSerializer.Deserialize<JsonDocument>(jsonResponse);

                    // Extract the text from the response
                    var responseText = geminiResponse.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString();

                    return new AiCompletionResponse
                    {
                        Response = responseText,
                        Success = true
                    };
                }
                else
                {
                    var errorContent = await httpResponse.Content.ReadAsStringAsync();
                    return new AiCompletionResponse
                    {
                        Success = false,
                        Error = $"Gemini API error: {httpResponse.StatusCode} - {errorContent}"
                    };
                }
            }
            catch (Exception ex)
            {
                return new AiCompletionResponse
                {
                    Success = false,
                    Error = $"Failed to call Gemini API: {ex.Message}"
                };
            }
        }

        public async Task<bool> DeleteSessionAsync(string sessionId, string userId)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.SessionId == sessionId && m.UserId == userId)
                .ToListAsync();

            if (!messages.Any())
                return false;

            _context.ChatMessages.RemoveRange(messages);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
