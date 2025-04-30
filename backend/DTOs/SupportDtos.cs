// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\DTOs\SupportDtos.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebTestUI.Backend.DTOs
{
    public class SupportTicketDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = "Open";
        public string Priority { get; set; } = "Medium";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UserEmail { get; set; }
        public ICollection<SupportTicketReplyDto> Replies { get; set; } = new List<SupportTicketReplyDto>();
    }

    public class SupportTicketReplyDto
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsFromSupport { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
    }

    public class CreateSupportTicketDto
    {
        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public string Priority { get; set; } = "Medium";
    }

    public class CreateTicketReplyDto
    {
        [Required]
        public string Message { get; set; } = string.Empty;

        public bool IsFromSupport { get; set; } = false;
    }
}
