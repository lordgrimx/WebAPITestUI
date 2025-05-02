using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                await base.OnConnectedAsync();
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendNotification(NotificationDto notification)
        {
            if (!string.IsNullOrEmpty(notification.UserId))
            {
                await Clients.Group(notification.UserId).SendAsync("ReceiveNotification", notification);
            }
        }

        public async Task MarkAsRead(int notificationId)
        {
            // This will be used by clients to mark notifications as read
            await Clients.Caller.SendAsync("NotificationRead", notificationId);
        }
    }
}