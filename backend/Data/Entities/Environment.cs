using System;
using System.Collections.Generic;

namespace WebTestUI.Backend.Data.Entities
{
    public class Environment
    {
        public Environment()
        {
            // Initialize collections
            Collections = new HashSet<Collection>();
            Requests = new HashSet<Request>();
            HistoryEntries = new HashSet<History>();
        }

        public int Id { get; set; }
        public string? UserId { get; set; }
        public string? Name { get; set; }
        public bool IsActive { get; set; }
        public string? Variables { get; set; } // JSON stringified environment variables
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ApplicationUser? User { get; set; }
        public virtual ICollection<Collection> Collections { get; set; }
        public virtual ICollection<Request> Requests { get; set; }
        public virtual ICollection<History> HistoryEntries { get; set; }
    }
}
