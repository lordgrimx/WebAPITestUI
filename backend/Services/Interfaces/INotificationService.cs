using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface INotificationService
    {
        // Notification operations
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto);
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId, int page = 1, int pageSize = 10);
        Task<IEnumerable<NotificationDto>> GetUnreadNotificationsAsync(string userId);
        Task<NotificationDto> GetNotificationByIdAsync(int id);
        Task<bool> MarkAsReadAsync(int id);
        Task<bool> MarkAllAsReadAsync(string userId);
        Task<bool> DeleteNotificationAsync(int id);
        Task<NotificationStatsDto> GetNotificationStatsAsync(string userId);

        // Notification preferences operations
        Task<NotificationPreferenceDto> GetUserPreferencesAsync(string userId);
        Task<NotificationPreferenceDto> UpdateUserPreferencesAsync(string userId, UpdateNotificationPreferenceDto updateDto);
        
        // Helper methods for different notification types
        Task CreateApiUpdateNotificationAsync(string userId, string apiName, int apiId);
        Task CreateRequestErrorNotificationAsync(string userId, string errorMessage, int requestId);
        Task CreateTestFailureNotificationAsync(string userId, string testName, int testId);
        Task CreateMentionNotificationAsync(string userId, string mentionedBy, string content);
        Task CreateCommentNotificationAsync(string userId, string commentedBy, string content, string entityType, int entityId);
        Task CreateSharedApiNotificationAsync(string userId, string sharedBy, string apiName, int apiId);
        Task CreateSecurityAlertNotificationAsync(string userId, string alertType, string message);
    }
}