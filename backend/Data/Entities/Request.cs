// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Data\Entities\Request.cs
using System;
using System.Collections.Generic;

namespace WebTestUI.Backend.Data.Entities
{
    public class Request
    {
        public Request()
        {
            // Initialize collections
            HistoryEntries = new HashSet<History>();
        }

        public int Id { get; set; }
        public string? UserId { get; set; }
        public int? CollectionId { get; set; }
        public int? EnvironmentId { get; set; } // Varsayılan değeri kaldırıyoruz
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Method { get; set; } // GET, POST, PUT, DELETE, etc.
        public string? Url { get; set; }
        public string? Headers { get; set; } // JSON stringified headers
        public string? AuthType { get; set; } // none, basic, bearer, apiKey, oauth2
        public string? AuthConfig { get; set; } // JSON stringified auth config
        public string? Params { get; set; } // JSON stringified params
        public string? Body { get; set; }
        public string? Tests { get; set; } // JSON stringified test scripts
        public bool IsFavorite { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ApplicationUser? User { get; set; }
        public virtual Collection? Collection { get; set; }
        public virtual EnvironmentConfig? Environment { get; set; }
        public virtual ICollection<History> HistoryEntries { get; set; }
    }
}
