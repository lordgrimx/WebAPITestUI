using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebTestUI.Backend.Data.Entities
{
    public class NotificationPreference
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? UserId { get; set; }

        // Push Notifications
        public bool ApiUpdatesEnabled { get; set; } = true;
        public bool RequestErrorsEnabled { get; set; } = true;
        public bool TestFailuresEnabled { get; set; } = true;
        public bool MentionsEnabled { get; set; } = true;

        // Email Notifications
        public bool EmailCommentsEnabled { get; set; } = false;
        public bool EmailSharedApisEnabled { get; set; } = true;
        public bool EmailSecurityAlertsEnabled { get; set; } = true;
        public bool NewsletterEnabled { get; set; } = false;

        // Integration Notifications
        public bool SlackEnabled { get; set; } = false;
        public bool DiscordEnabled { get; set; } = false;

        // Slack Integration Config
        public string? SlackWebhookUrl { get; set; }
        public string? SlackChannel { get; set; }

        // Discord Integration Config
        public string? DiscordWebhookUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser? User { get; set; }
    }
}