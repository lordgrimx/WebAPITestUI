using System;

namespace WebTestUI.Backend.Data.Entities
{
    public class EnvironmentVariable
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public string Variables { get; set; } // JSON stringified environment variables
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ApplicationUser User { get; set; }
    }
}
