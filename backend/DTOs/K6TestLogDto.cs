using System;

namespace WebTestUI.Backend.DTOs
{
    public class K6TestLogDto
    {
        public Guid Id { get; set; }
        public Guid K6TestId { get; set; }
        public long Timestamp { get; set; }
        public string Level { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; } // JSON string olarak detaylar
    }
} 