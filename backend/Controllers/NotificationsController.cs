using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly UserManager<ApplicationUser> _userManager;

        public NotificationsController(INotificationService notificationService, UserManager<ApplicationUser> userManager)
        {
            _notificationService = notificationService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var notifications = await _notificationService.GetUserNotificationsAsync(currentUser.Id, page, pageSize);
            return Ok(notifications);
        }

        [HttpGet("unread")]
        public async Task<IActionResult> GetUnreadNotifications()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var notifications = await _notificationService.GetUnreadNotificationsAsync(currentUser.Id);
            return Ok(notifications);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetNotificationStats()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var stats = await _notificationService.GetNotificationStatsAsync(currentUser.Id);
            return Ok(stats);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            // Get notification to verify ownership
            var notification = await _notificationService.GetNotificationByIdAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            // Only allow the user to mark their own notifications as read
            if (!currentUser.Id.Equals(notification.UserId))
            {
                return Forbid();
            }

            var result = await _notificationService.MarkAsReadAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return Ok(new { message = "Notification marked as read" });
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var result = await _notificationService.MarkAllAsReadAsync(currentUser.Id);
            return Ok(new { message = "All notifications marked as read" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            // Get notification to verify ownership
            var notification = await _notificationService.GetNotificationByIdAsync(id);
            if (notification == null)
            {
                return NotFound();
            }

            // Only allow the user to delete their own notifications
            if (!currentUser.Id.Equals(notification.UserId))
            {
                return Forbid();
            }

            var result = await _notificationService.DeleteNotificationAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return Ok(new { message = "Notification deleted successfully" });
        }

        [HttpGet("preferences")]
        public async Task<IActionResult> GetNotificationPreferences()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var preferences = await _notificationService.GetUserPreferencesAsync(currentUser.Id);
            return Ok(preferences);
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> UpdateNotificationPreferences([FromBody] UpdateNotificationPreferenceDto updateDto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var updatedPreferences = await _notificationService.UpdateUserPreferencesAsync(currentUser.Id, updateDto);
            return Ok(updatedPreferences);
        }

        // This is a test endpoint that can be used to create a test notification
        // Should be removed or secured in production
        [HttpPost("test")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateTestNotification([FromBody] CreateNotificationDto createDto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            // Override the user ID to ensure only the current user gets the test notification
            createDto.UserId = currentUser.Id;
            
            var notification = await _notificationService.CreateNotificationAsync(createDto);
            return Ok(notification);
        }

        // Test amaçlı bildirim gönderme endpoint'i
        [HttpPost("test-notification")]
        public async Task<IActionResult> SendTestNotification()
        {
            // Oturum açmış kullanıcının ID'sini al
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Kullanıcı oturum açmış olmalıdır.");
            }

            // Test bildirimi oluştur
            var notification = await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = "Test Bildirimi",
                Message = "Bu bir test bildirimidir. Gerçek zamanlı bildirim sistemi çalışıyor!",
                Type = "api_update",  // Bildirim türü
                RelatedEntityType = "test"
            });

            return Ok(new { message = "Test bildirimi gönderildi", notification });
        }
    }
}