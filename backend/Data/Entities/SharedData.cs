using System;
using System.ComponentModel.DataAnnotations;

namespace WebTestUI.Backend.Data.Entities
{
    public class SharedData
    {
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string ShareId { get; set; } = string.Empty;

        [Required]
        public string DataJson { get; set; } = string.Empty; // Store SharedDataDto as JSON

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        // Optional: Add an expiration date/time
        public DateTime? ExpiresAt { get; set; }
    }
}