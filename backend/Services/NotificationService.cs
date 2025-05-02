using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Hubs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IHubContext<NotificationHub> _notificationHubContext;

        public NotificationService(
            ApplicationDbContext context, 
            IEmailService emailService,
            IHubContext<NotificationHub> notificationHubContext)
        {
            _context = context;
            _emailService = emailService;
            _notificationHubContext = notificationHubContext;
        }

        #region Notification Operations

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto)
        {
            if (string.IsNullOrEmpty(createDto.UserId))
            {
                throw new ArgumentException("UserId cannot be null or empty");
            }

            // Check if user exists
            var user = await _context.Users.FindAsync(createDto.UserId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            // Check user preferences for this type of notification
            var preferences = await GetOrCreateUserPreferencesAsync(createDto.UserId);
            
            // Convert string RelatedEntityId to int? if possible
            int? relatedEntityId = null;
            if (!string.IsNullOrEmpty(createDto.RelatedEntityId))
            {
                if (int.TryParse(createDto.RelatedEntityId, out int parsedId))
                {
                    relatedEntityId = parsedId;
                }
            }

            // Create notification
            var notification = new Notification
            {
                UserId = createDto.UserId,
                Title = createDto.Title,
                Message = createDto.Message,
                Type = createDto.Type,
                RelatedEntityType = createDto.RelatedEntityType,
                RelatedEntityId = relatedEntityId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Create DTO for the response
            var notificationDto = new NotificationDto
            {
                Id = notification.Id,
                UserId = notification.UserId,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                RelatedEntityType = notification.RelatedEntityType!,
                RelatedEntityId = notification.RelatedEntityId,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };

            // Send real-time notification via SignalR - Using Groups instead of specific user
            if (!string.IsNullOrEmpty(notification.UserId))
            {
                var userId = notification.UserId;
                if (!string.IsNullOrEmpty(userId))
                {
                    await _notificationHubContext.Clients.Group(userId)
                        .SendAsync("ReceiveNotification", notificationDto);
                }
            }

            // Handle email notifications based on preferences
            await HandleEmailNotificationAsync(notification, preferences);

            // Handle integration notifications
            await HandleIntegrationNotificationsAsync(notification, preferences);

            return notificationDto;
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId, int page = 1, int pageSize = 10)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsArchived)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    UserId = n.UserId, // Önemli: UserId alanını ekliyoruz
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    RelatedEntityType = n.RelatedEntityType!,
                    RelatedEntityId = n.RelatedEntityId,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead && !n.IsArchived)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    UserId = n.UserId, // Önemli: UserId alanını ekliyoruz
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    RelatedEntityType = n.RelatedEntityType!,
                    RelatedEntityId = n.RelatedEntityId,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<NotificationDto> GetNotificationByIdAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return null!;
            }

            return new NotificationDto
            {
                Id = notification.Id,
                UserId = notification.UserId, // UserId alanını ekliyoruz
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                RelatedEntityType = notification.RelatedEntityType!,
                RelatedEntityId = notification.RelatedEntityId,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };
        }

        public async Task<bool> MarkAsReadAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return false;
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            
            // Update clients in real-time - Use Group instead of User
            if (!string.IsNullOrEmpty(notification.UserId))
            {
                await _notificationHubContext.Clients.Group(notification.UserId)
                    .SendAsync("NotificationRead", id);
            }
                
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(string userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (!notifications.Any())
            {
                return false;
            }

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
            
            // Update clients in real-time - Use Group instead of User
            await _notificationHubContext.Clients.Group(userId)
                .SendAsync("AllNotificationsRead");
                
            return true;
        }

        public async Task<bool> DeleteNotificationAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return false;
            }

            notification.IsArchived = true;
            await _context.SaveChangesAsync();
            
            // Update clients in real-time - Use Group instead of User
            if (!string.IsNullOrEmpty(notification.UserId))
            {
                await _notificationHubContext.Clients.Group(notification.UserId)
                    .SendAsync("NotificationDeleted", id);
            }
            
                
            return true;
        }

        public async Task<NotificationStatsDto> GetNotificationStatsAsync(string userId)
        {
            var totalCount = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsArchived)
                .CountAsync();

            var unreadCount = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead && !n.IsArchived)
                .CountAsync();

            return new NotificationStatsDto
            {
                TotalCount = totalCount,
                UnreadCount = unreadCount
            };
        }

        #endregion

        #region Notification Preferences Operations

        public async Task<NotificationPreferenceDto> GetUserPreferencesAsync(string userId)
        {
            var preferences = await GetOrCreateUserPreferencesAsync(userId);

            return new NotificationPreferenceDto
            {
                // Push Notifications
                ApiUpdatesEnabled = preferences.ApiUpdatesEnabled,
                RequestErrorsEnabled = preferences.RequestErrorsEnabled,
                TestFailuresEnabled = preferences.TestFailuresEnabled,
                MentionsEnabled = preferences.MentionsEnabled,

                // Email Notifications
                EmailCommentsEnabled = preferences.EmailCommentsEnabled,
                EmailSharedApisEnabled = preferences.EmailSharedApisEnabled,
                EmailSecurityAlertsEnabled = preferences.EmailSecurityAlertsEnabled,
                NewsletterEnabled = preferences.NewsletterEnabled,

                // Integration Notifications
                SlackEnabled = preferences.SlackEnabled,
                DiscordEnabled = preferences.DiscordEnabled,

                // Slack Integration Config
                SlackWebhookUrl = preferences.SlackWebhookUrl!,
                SlackChannel = preferences.SlackChannel!,

                // Discord Integration Config
                DiscordWebhookUrl = preferences.DiscordWebhookUrl!
            };
        }

        public async Task<NotificationPreferenceDto> UpdateUserPreferencesAsync(string userId, UpdateNotificationPreferenceDto updateDto)
        {
            var preferences = await GetOrCreateUserPreferencesAsync(userId);

            // Update only the properties that are not null
            if (updateDto.ApiUpdatesEnabled.HasValue)
                preferences.ApiUpdatesEnabled = updateDto.ApiUpdatesEnabled.Value;
            
            if (updateDto.RequestErrorsEnabled.HasValue)
                preferences.RequestErrorsEnabled = updateDto.RequestErrorsEnabled.Value;
            
            if (updateDto.TestFailuresEnabled.HasValue)
                preferences.TestFailuresEnabled = updateDto.TestFailuresEnabled.Value;
            
            if (updateDto.MentionsEnabled.HasValue)
                preferences.MentionsEnabled = updateDto.MentionsEnabled.Value;
            
            if (updateDto.EmailCommentsEnabled.HasValue)
                preferences.EmailCommentsEnabled = updateDto.EmailCommentsEnabled.Value;
            
            if (updateDto.EmailSharedApisEnabled.HasValue)
                preferences.EmailSharedApisEnabled = updateDto.EmailSharedApisEnabled.Value;
            
            if (updateDto.EmailSecurityAlertsEnabled.HasValue)
                preferences.EmailSecurityAlertsEnabled = updateDto.EmailSecurityAlertsEnabled.Value;
            
            if (updateDto.NewsletterEnabled.HasValue)
                preferences.NewsletterEnabled = updateDto.NewsletterEnabled.Value;
            
            if (updateDto.SlackEnabled.HasValue)
                preferences.SlackEnabled = updateDto.SlackEnabled.Value;
            
            if (updateDto.DiscordEnabled.HasValue)
                preferences.DiscordEnabled = updateDto.DiscordEnabled.Value;

            // Update webhook URLs if they are provided
            if (!string.IsNullOrEmpty(updateDto.SlackWebhookUrl))
                preferences.SlackWebhookUrl = updateDto.SlackWebhookUrl;
            
            if (!string.IsNullOrEmpty(updateDto.SlackChannel))
                preferences.SlackChannel = updateDto.SlackChannel;
            
            if (!string.IsNullOrEmpty(updateDto.DiscordWebhookUrl))
                preferences.DiscordWebhookUrl = updateDto.DiscordWebhookUrl;

            preferences.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetUserPreferencesAsync(userId);
        }

        #endregion

        #region Helper Methods for Different Notification Types

        public async Task CreateApiUpdateNotificationAsync(string userId, string apiName, int apiId)
        {
            var preferences = await GetOrCreateUserPreferencesAsync(userId);
            if (!preferences.ApiUpdatesEnabled)
                return;

            await CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = "API Güncellemesi",
                Message = $"'{apiName}' API'si güncellendi.",
                Type = "api_update",
                RelatedEntityType = "request",
                RelatedEntityId = apiId.ToString()
            });
        }

        public async Task CreateRequestErrorNotificationAsync(string userId, string errorMessage, int requestId)
        {
            var preferences = await GetOrCreateUserPreferencesAsync(userId);
            if (!preferences.RequestErrorsEnabled)
                return;

            await CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = "İstek Hatası",
                Message = errorMessage,
                Type = "request_error",
                RelatedEntityType = "request",
                RelatedEntityId = requestId.ToString()
            });
        }

        public async Task CreateTestFailureNotificationAsync(string userId, string testName, int testId)
        {
            var preferences = await GetOrCreateUserPreferencesAsync(userId);
            if (!preferences.TestFailuresEnabled)
                return;

            await CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = "Test Başarısız",
                Message = $"'{testName}' testi başarısız oldu.",
                Type = "test_failure",
                RelatedEntityType = "test",
                RelatedEntityId = testId.ToString()
            });
        }

        public async Task CreateMentionNotificationAsync(string userId, string mentionedBy, string content)
        {
            var preferences = await GetOrCreateUserPreferencesAsync(userId);
            if (!preferences.MentionsEnabled)
                return;

            await CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = "Bahsetme",
                Message = $"{mentionedBy} sizden bahsetti: {content}",
                Type = "mention",
                RelatedEntityType = "mention"
            });
        }

        public async Task CreateCommentNotificationAsync(string userId, string commentedBy, string content, string entityType, int entityId)
        {
            var preferences = await GetOrCreateUserPreferencesAsync(userId);
            // Sadece uygulama içi bildirimleri kontrol etmiyoruz çünkü her zaman göndermek istiyoruz
            // Ancak email için kontrol etmemiz gerekiyor EmailCommentsEnabled ile

            await CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = "Yeni Yorum",
                Message = $"{commentedBy} yorum yaptı: {content}",
                Type = "comment",
                RelatedEntityType = entityType,
                RelatedEntityId = entityId.ToString()
            });
        }

        public async Task CreateSharedApiNotificationAsync(string userId, string sharedBy, string apiName, int apiId)
        {
            var preferences = await GetOrCreateUserPreferencesAsync(userId);
            
            await CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = "API Paylaşıldı",
                Message = $"{sharedBy}, '{apiName}' API'sini sizinle paylaştı.",
                Type = "shared_api",
                RelatedEntityType = "request",
                RelatedEntityId = apiId.ToString()
            });
        }

        public async Task CreateSecurityAlertNotificationAsync(string userId, string alertType, string message)
        {
            var preferences = await GetOrCreateUserPreferencesAsync(userId);
            // Güvenlik uyarıları önemli olduğu için her zaman uygulama içi bildirim gönderiyoruz
            // Email tercihleri EmailSecurityAlertsEnabled üzerinden kontrol ediliyor

            await CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = $"Güvenlik Uyarısı: {alertType}",
                Message = message,
                Type = "security",
                RelatedEntityType = "security"
            });
        }

        #endregion

        #region Private Helper Methods

        private async Task<NotificationPreference> GetOrCreateUserPreferencesAsync(string userId)
        {
            var preferences = await _context.NotificationPreferences
                .FirstOrDefaultAsync(np => np.UserId == userId);

            if (preferences != null)
                return preferences;

            // Create default preferences if they don't exist
            var newPreferences = new NotificationPreference
            {
                UserId = userId,
                // Push Notifications - enabled by default
                ApiUpdatesEnabled = true,
                RequestErrorsEnabled = true,
                TestFailuresEnabled = true,
                MentionsEnabled = true,

                // Email Notifications - some enabled by default
                EmailCommentsEnabled = false,
                EmailSharedApisEnabled = true,
                EmailSecurityAlertsEnabled = true,
                NewsletterEnabled = false,

                // Integration Notifications - disabled by default
                SlackEnabled = false,
                DiscordEnabled = false,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.NotificationPreferences.Add(newPreferences);
            await _context.SaveChangesAsync();

            return newPreferences;
        }

        private async Task HandleEmailNotificationAsync(Notification notification, NotificationPreference preferences)
        {
            var user = await _context.Users.FindAsync(notification.UserId);
            if (user == null) return;

            bool sendEmail = false;
            string emailSubject = string.Empty;
            string emailBody = string.Empty;

            // Determine if we should send an email based on notification type and user preferences
            switch (notification.Type)
            {
                case "comment":
                    sendEmail = preferences.EmailCommentsEnabled;
                    emailSubject = "New Comment on Your Item";
                    emailBody = $"<p>You have received a new comment:</p><p>{notification.Message}</p>";
                    break;
                case "shared_api":
                    sendEmail = preferences.EmailSharedApisEnabled;
                    emailSubject = "API Shared With You";
                    emailBody = $"<p>{notification.Message}</p><p>Login to view the shared API.</p>";
                    break;
                case "security":
                    sendEmail = preferences.EmailSecurityAlertsEnabled;
                    emailSubject = "Security Alert";
                    emailBody = $"<p>Important Security Alert:</p><p>{notification.Message}</p>";
                    break;
                // Add more cases for other notification types as needed
            }

            if (sendEmail && !string.IsNullOrEmpty(user.Email))
            {
                try
                {
                    await _emailService.SendEmailAsync(user.Email, emailSubject, emailBody);
                }
                catch (Exception ex)
                {
                    // Log the error but don't fail the notification creation
                    Console.WriteLine($"Failed to send email notification: {ex.Message}");
                }
            }
        }

        private async Task HandleIntegrationNotificationsAsync(Notification notification, NotificationPreference preferences)
        {
            // Handle Slack notifications
            if (preferences.SlackEnabled && !string.IsNullOrEmpty(preferences.SlackWebhookUrl) && !string.IsNullOrEmpty(preferences.SlackChannel))
            {
                await SendSlackNotificationAsync(notification, preferences.SlackWebhookUrl, preferences.SlackChannel);
            }

            // Handle Discord notifications
            if (preferences.DiscordEnabled && !string.IsNullOrEmpty(preferences.DiscordWebhookUrl))
            {
                await SendDiscordNotificationAsync(notification, preferences.DiscordWebhookUrl);
            }
        }

        private Task SendSlackNotificationAsync(Notification notification, string webhookUrl, string channel)
        {
            // Implementation would go here to send notification to Slack
            // You would use HttpClient to post a JSON payload to the Slack webhook URL
            // This is a placeholder for the actual implementation
            
            // For example:
            // var client = new HttpClient();
            // var payload = new { text = $"{notification.Title}: {notification.Message}", channel = channel };
            // var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            // return client.PostAsync(webhookUrl, content);
            
            return Task.CompletedTask;
        }

        private Task SendDiscordNotificationAsync(Notification notification, string webhookUrl)
        {
            // Implementation would go here to send notification to Discord
            // You would use HttpClient to post a JSON payload to the Discord webhook URL
            // This is a placeholder for the actual implementation
            
            // For example:
            // var client = new HttpClient();
            // var payload = new { content = $"**{notification.Title}**\n{notification.Message}" };
            // var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            // return client.PostAsync(webhookUrl, content);
            
            return Task.CompletedTask;
        }

        #endregion
    }
}