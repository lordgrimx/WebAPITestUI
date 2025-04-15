using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace WebTestUI.Backend.Data.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }
        public string ProfileImage { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string Website { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }        // Navigation properties
        public virtual ICollection<Collection> Collections { get; set; }
        public virtual ICollection<Request> Requests { get; set; }
        public virtual ICollection<History> HistoryEntries { get; set; }
        public virtual ICollection<EnvironmentVariable> Environments { get; set; }
    }
}
