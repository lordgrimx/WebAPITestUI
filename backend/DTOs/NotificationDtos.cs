using System;
using System.Collections.Generic;

namespace WebTestUI.Backend.DTOs
{
    // DTO for notification list item
    public class NotificationDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public string RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // DTO for notification preferences
    public class NotificationPreferenceDto
    {
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
        public string SlackWebhookUrl { get; set; }
        public string SlackChannel { get; set; }

        // Discord Integration Config
        public string DiscordWebhookUrl { get; set; }
    }

    // DTO for updating notification preferences
    public class UpdateNotificationPreferenceDto
    {
        // Push Notifications
        public bool? ApiUpdatesEnabled { get; set; }
        public bool? RequestErrorsEnabled { get; set; }
        public bool? TestFailuresEnabled { get; set; }
        public bool? MentionsEnabled { get; set; }

        // Email Notifications
        public bool? EmailCommentsEnabled { get; set; }
        public bool? EmailSharedApisEnabled { get; set; }
        public bool? EmailSecurityAlertsEnabled { get; set; }
        public bool? NewsletterEnabled { get; set; }

        // Integration Notifications
        public bool? SlackEnabled { get; set; }
        public bool? DiscordEnabled { get; set; }

        // Slack Integration Config
        public string SlackWebhookUrl { get; set; }
        public string SlackChannel { get; set; }

        // Discord Integration Config
        public string DiscordWebhookUrl { get; set; }
    }

    // DTO for creating a new notification
    public class CreateNotificationDto
    {
        public string UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public string RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
    }

    // DTO for notification statistics
    public class NotificationStatsDto
    {
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
    }
}