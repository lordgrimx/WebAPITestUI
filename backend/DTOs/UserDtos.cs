using System.ComponentModel.DataAnnotations;

namespace WebTestUI.Backend.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string? Name { get; set; }

        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        [MinLength(8)]
        public string? Password { get; set; }
    }

    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        public string? Password { get; set; }
    }

    public class TwoFactorVerifyDto
    {
        [Required]
        public string? UserId { get; set; }

        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string? Code { get; set; }
    }

    public class UpdateProfileDto
    {
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Website { get; set; }
        public bool? TwoFactorEnabled { get; set; }
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
    }

    public class ChangePasswordDto
    {
        [Required]
        public string? CurrentPassword { get; set; }

        [Required]
        [MinLength(8)]
        public string? NewPassword { get; set; }
    }

    public class AuthResultDto
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? Token { get; set; }
        public bool TwoFactorRequired { get; set; }
        public string? UserId { get; set; }
        public UserDto? User { get; set; }
    }

    public class UserDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        // public string ProfileImage { get; set; } // Removed old property
        public string? ProfileImageBase64 { get; set; } // Added Base64 property (nullable)
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Website { get; set; }
        public bool TwoFactorEnabled { get; set; }
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
    }

    public class UploadImageDto
    {
        [Required]
        public string? ImageBase64 { get; set; }
    }
}
