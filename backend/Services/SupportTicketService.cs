// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Services\SupportTicketService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class SupportTicketService : ISupportTicketService
    {
        private readonly ApplicationDbContext _context;

        public SupportTicketService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SupportTicketDto>> GetAllTicketsAsync()
        {
            var tickets = await _context.SupportTickets
                .Include(st => st.User)
                .Include(st => st.Replies)
                .ThenInclude(r => r.User)
                .OrderByDescending(st => st.CreatedAt)
                .Select(st => new SupportTicketDto
                {
                    Id = st.Id,
                    Subject = st.Subject,
                    Message = st.Message,
                    Status = st.Status,
                    Priority = st.Priority,
                    CreatedAt = st.CreatedAt,
                    UpdatedAt = st.UpdatedAt,
                    UserEmail = st.User.Email,
                    Replies = st.Replies.Select(r => new SupportTicketReplyDto
                    {
                        Id = r.Id,
                        Message = r.Message,
                        IsFromSupport = r.IsFromSupport,
                        CreatedAt = r.CreatedAt,
                        UserName = r.User.Name ?? r.User.UserName,
                        UserEmail = r.User.Email
                    }).OrderBy(r => r.CreatedAt).ToList()
                })
                .ToListAsync();

            return tickets;
        }

        public async Task<IEnumerable<SupportTicketDto>> GetTicketsByUserIdAsync(string userId)
        {
            var tickets = await _context.SupportTickets
                .Include(st => st.User)
                .Include(st => st.Replies)
                .ThenInclude(r => r.User)
                .Where(st => st.UserId == userId)
                .OrderByDescending(st => st.CreatedAt)
                .Select(st => new SupportTicketDto
                {
                    Id = st.Id,
                    Subject = st.Subject,
                    Message = st.Message,
                    Status = st.Status,
                    Priority = st.Priority,
                    CreatedAt = st.CreatedAt,
                    UpdatedAt = st.UpdatedAt,
                    UserEmail = st.User.Email,
                    Replies = st.Replies.Select(r => new SupportTicketReplyDto
                    {
                        Id = r.Id,
                        Message = r.Message,
                        IsFromSupport = r.IsFromSupport,
                        CreatedAt = r.CreatedAt,
                        UserName = r.User.Name ?? r.User.UserName,
                        UserEmail = r.User.Email
                    }).OrderBy(r => r.CreatedAt).ToList()
                })
                .ToListAsync();

            return tickets;
        }

        public async Task<SupportTicketDto?> GetTicketByIdAsync(int id, string userId)
        {
            var ticket = await _context.SupportTickets
                .Include(st => st.User)
                .Include(st => st.Replies)
                .ThenInclude(r => r.User)
                .Where(st => st.Id == id && (st.UserId == userId || userId == null))
                .Select(st => new SupportTicketDto
                {
                    Id = st.Id,
                    Subject = st.Subject,
                    Message = st.Message,
                    Status = st.Status,
                    Priority = st.Priority,
                    CreatedAt = st.CreatedAt,
                    UpdatedAt = st.UpdatedAt,
                    UserEmail = st.User.Email,
                    Replies = st.Replies.Select(r => new SupportTicketReplyDto
                    {
                        Id = r.Id,
                        Message = r.Message,
                        IsFromSupport = r.IsFromSupport,
                        CreatedAt = r.CreatedAt,
                        UserName = r.User.Name ?? r.User.UserName,
                        UserEmail = r.User.Email
                    }).OrderBy(r => r.CreatedAt).ToList()
                })
                .FirstOrDefaultAsync();

            return ticket;
        }

        public async Task<SupportTicketDto> CreateTicketAsync(string userId, CreateSupportTicketDto ticketDto)
        {
            var ticket = new SupportTicket
            {
                UserId = userId,
                Subject = ticketDto.Subject,
                Message = ticketDto.Message,
                Priority = ticketDto.Priority,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            await _context.SupportTickets.AddAsync(ticket);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);

            return new SupportTicketDto
            {
                Id = ticket.Id,
                Subject = ticket.Subject,
                Message = ticket.Message,
                Status = ticket.Status,
                Priority = ticket.Priority,
                CreatedAt = ticket.CreatedAt,
                UserEmail = user.Email,
                Replies = new List<SupportTicketReplyDto>()
            };
        }

        public async Task<SupportTicketReplyDto> AddReplyAsync(int ticketId, string userId, CreateTicketReplyDto replyDto)
        {
            var ticket = await _context.SupportTickets.FindAsync(ticketId);

            if (ticket == null)
                return null;

            // Update ticket status if this is a reply from support
            if (replyDto.IsFromSupport && ticket.Status == "Open")
            {
                ticket.Status = "In Progress";
                ticket.UpdatedAt = DateTime.UtcNow;
                _context.SupportTickets.Update(ticket);
            }

            var reply = new SupportTicketReply
            {
                TicketId = ticketId,
                UserId = userId,
                Message = replyDto.Message,
                IsFromSupport = replyDto.IsFromSupport,
                CreatedAt = DateTime.UtcNow
            };

            await _context.SupportTicketReplies.AddAsync(reply);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);

            return new SupportTicketReplyDto
            {
                Id = reply.Id,
                Message = reply.Message,
                IsFromSupport = reply.IsFromSupport,
                CreatedAt = reply.CreatedAt,
                UserName = user.Name ?? user.UserName,
                UserEmail = user.Email
            };
        }

        public async Task<bool> UpdateTicketStatusAsync(int id, string status)
        {
            var ticket = await _context.SupportTickets.FindAsync(id);

            if (ticket == null)
                return false;

            ticket.Status = status;
            ticket.UpdatedAt = DateTime.UtcNow;

            _context.SupportTickets.Update(ticket);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteTicketAsync(int id)
        {
            var ticket = await _context.SupportTickets.FindAsync(id);

            if (ticket == null)
                return false;

            _context.SupportTickets.Remove(ticket);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
