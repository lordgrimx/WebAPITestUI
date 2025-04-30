// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\DTOs\ChatDtos.cs
using System;
using System.ComponentModel.DataAnnotations;
using WebTestUI.Backend.Data.Entities;

namespace WebTestUI.Backend.DTOs
{
    public class ChatMessageDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public bool IsFromUser { get; set; }
        public DateTime CreatedAt { get; set; }
        public string SessionId { get; set; }
        public string ModelResponse { get; set; }
    }

    public class CreateChatMessageDto
    {
        [Required]
        public string Content { get; set; }

        [Required]
        public string SessionId { get; set; }

        public string ModelType { get; set; } = "gemini-2.0-flash";
    }

    public class ChatSessionDto
    {
        public string SessionId { get; set; }
        public List<ChatMessageDto> Messages { get; set; } = new List<ChatMessageDto>();
        public DateTime CreatedAt { get; set; }
        public DateTime? LastMessageAt { get; set; }
    }

    public class AiCompletionRequest
    {
        [Required]
        public string Prompt { get; set; }

        public List<ChatMessageDto> PreviousMessages { get; set; } = new List<ChatMessageDto>();

        public string ModelType { get; set; } = "gemini-2.0-flash";

        public double Temperature { get; set; } = 0.7;
    }

    public class AiCompletionResponse
    {
        public string Response { get; set; }
        public bool Success { get; set; }
        public string Error { get; set; }
    }
}
