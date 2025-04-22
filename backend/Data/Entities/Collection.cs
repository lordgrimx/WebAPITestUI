// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Data\Entities\Collection.cs
using System;
using System.Collections.Generic;

namespace WebTestUI.Backend.Data.Entities
{
    public class Collection
    {
        public Collection()
        {
            // Initialize collections
            Requests = new HashSet<Request>();
        }

        public int Id { get; set; }
        public string? UserId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? EnvironmentId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ApplicationUser? User { get; set; }
        public virtual ICollection<Request> Requests { get; set; }
        public virtual EnvironmentConfig? Environment { get; set; }
    }
}
