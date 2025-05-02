// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Services\Interfaces\ISupportTicketService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface ISupportTicketService
    {
        Task<IEnumerable<SupportTicketDto>> GetAllTicketsAsync();
        Task<IEnumerable<SupportTicketDto>> GetTicketsByUserIdAsync(string userId);
        Task<SupportTicketDto?> GetTicketByIdAsync(int id, string userId);
        Task<SupportTicketDto> CreateTicketAsync(string userId, CreateSupportTicketDto ticketDto);
        Task<SupportTicketReplyDto> AddReplyAsync(int ticketId, string userId, CreateTicketReplyDto replyDto);
        Task<bool> UpdateTicketStatusAsync(int id, string status);
        Task<bool> DeleteTicketAsync(int id);
    }
}
