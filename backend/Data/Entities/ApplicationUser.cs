using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace WebTestUI.Backend.Data.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }
        // public string? ProfileImage { get; set; } // Replaced with Base64
        public string? ProfileImageBase64 { get; set; } // Store image as Base64 string
        public string? Phone { get; set; } // Made Phone nullable
        public string? Address { get; set; }
        public string? Website { get; set; }
        public bool TwoFactorEnabled { get; set; } // This is likely the standard Identity property
        public string? TwoFactorCode { get; set; } // Made TwoFactorCode nullable
        public DateTime? TwoFactorCodeExpiry { get; set; } // Add nullable DateTime for expiry
        public string? Language { get; set; } // Add Language preference

        // Account Settings - General
        public string? Timezone { get; set; }
        public string? DateFormat { get; set; }
        public bool? AutoLogoutEnabled { get; set; }
        public int? SessionTimeoutMinutes { get; set; }

        // Account Settings - Appearance
        public string? Theme { get; set; } // "light", "dark", "system"
        public bool? CompactViewEnabled { get; set; }
        public bool? ShowSidebarEnabled { get; set; }

        // Account Settings - Privacy
        public bool? UsageAnalyticsEnabled { get; set; }
        public bool? CrashReportsEnabled { get; set; }
        public bool? MarketingEmailsEnabled { get; set; }


        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }        // Navigation properties
        public virtual ICollection<Collection> Collections { get; set; }
        public virtual ICollection<Request> Requests { get; set; }
        public virtual ICollection<History> HistoryEntries { get; set; }
        public virtual ICollection<EnvironmentVariable> Environments { get; set; }
    }
}
