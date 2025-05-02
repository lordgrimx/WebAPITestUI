// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Controllers\ChatController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpPost("message")]
        public async Task<ActionResult<ChatMessageDto>> CreateMessage(CreateChatMessageDto messageDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // If no session ID is provided, generate one
            if (string.IsNullOrEmpty(messageDto.SessionId))
            {
                messageDto.SessionId = Guid.NewGuid().ToString();
            }

            var message = await _chatService.CreateMessageAsync(userId, messageDto);

            if (message == null)
                return BadRequest("Failed to create message");

            return Ok(message);
        }

        [HttpGet("sessions")]
        public async Task<ActionResult<IEnumerable<ChatSessionDto>>> GetAllSessions()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var sessions = await _chatService.GetAllSessionsByUserIdAsync(userId);
            return Ok(sessions);
        }

        [HttpGet("sessions/{sessionId}")]
        public async Task<ActionResult<IEnumerable<ChatMessageDto>>> GetSessionMessages(string sessionId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var messages = await _chatService.GetMessagesBySessionIdAsync(sessionId, userId);
            return Ok(messages);
        }

        [HttpPost("completion")]
        public async Task<ActionResult<AiCompletionResponse>> GetAiCompletion(AiCompletionRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _chatService.GetAiCompletionAsync(userId, request);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpDelete("sessions/{sessionId}")]
        public async Task<ActionResult> DeleteSession(string sessionId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _chatService.DeleteSessionAsync(sessionId, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
