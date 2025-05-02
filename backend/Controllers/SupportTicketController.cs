// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Controllers\SupportTicketController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SupportTicketController : ControllerBase
    {
        private readonly ISupportTicketService _supportTicketService;

        public SupportTicketController(ISupportTicketService supportTicketService)
        {
            _supportTicketService = supportTicketService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Support")]
        public async Task<ActionResult<IEnumerable<SupportTicketDto>>> GetAllTickets()
        {
            var tickets = await _supportTicketService.GetAllTicketsAsync();
            return Ok(tickets);
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<SupportTicketDto>>> GetMyTickets()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tickets = await _supportTicketService.GetTicketsByUserIdAsync(userId);
            return Ok(tickets);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SupportTicketDto>> GetTicketById(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // If user is admin or support, allow them to view any ticket
            if (User.IsInRole("Admin") || User.IsInRole("Support"))
                userId = null;

            var ticket = await _supportTicketService.GetTicketByIdAsync(id, userId);

            if (ticket == null)
                return NotFound();

            return Ok(ticket);
        }

        [HttpPost]
        public async Task<ActionResult<SupportTicketDto>> CreateTicket(CreateSupportTicketDto ticketDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var createdTicket = await _supportTicketService.CreateTicketAsync(userId, ticketDto);
            return CreatedAtAction(nameof(GetTicketById), new { id = createdTicket.Id }, createdTicket);
        }

        [HttpPost("{id}/reply")]
        public async Task<ActionResult<SupportTicketReplyDto>> AddReply(int id, CreateTicketReplyDto replyDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // If user is admin or support, mark the reply as coming from support
            if (User.IsInRole("Admin") || User.IsInRole("Support"))
                replyDto.IsFromSupport = true;

            var reply = await _supportTicketService.AddReplyAsync(id, userId, replyDto);

            if (reply == null)
                return NotFound();

            return Ok(reply);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<ActionResult> UpdateTicketStatus(int id, [FromBody] string status)
        {
            // Validate status
            if (string.IsNullOrEmpty(status) || !new[] { "Open", "In Progress", "Resolved", "Closed" }.Contains(status))
                return BadRequest("Invalid status");

            var result = await _supportTicketService.UpdateTicketStatusAsync(id, status);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteTicket(int id)
        {
            var result = await _supportTicketService.DeleteTicketAsync(id);

            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
