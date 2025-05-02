using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebTestUI.Backend.Data.Entities
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? UserId { get; set; }

        [Required]
        public string? Title { get; set; }

        [Required]
        public string? Message { get; set; }

        [Required]
        public string? Type { get; set; } // "api_update", "request_error", "test_failure", "mention", "comment", "shared_api", "security", etc.

        public string? RelatedEntityType { get; set; } // "request", "collection", "environment", etc.
        public int? RelatedEntityId { get; set; } // ID of the related entity

        public bool IsRead { get; set; } = false;
        public bool IsArchived { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser? User { get; set; }
    }
}