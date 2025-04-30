// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Data\Entities\ChatMessage.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebTestUI.Backend.Data.Entities
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Content { get; set; }

        [ForeignKey("User")]
        public string UserId { get; set; }

        public virtual ApplicationUser User { get; set; }

        public bool IsFromUser { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("Session")]
        public string SessionId { get; set; }

        public string? ModelResponse { get; set; }

        [MaxLength(50)]
        public string? ModelType { get; set; } = "gemini-2.0-flash";
    }
}
