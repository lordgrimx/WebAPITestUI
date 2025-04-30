// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Data\Entities\SupportTicketReply.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebTestUI.Backend.Data.Entities
{
    public class SupportTicketReply
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Message { get; set; }

        [ForeignKey("Ticket")]
        public int TicketId { get; set; }

        public virtual SupportTicket Ticket { get; set; }

        [ForeignKey("User")]
        public string UserId { get; set; }

        public virtual ApplicationUser User { get; set; }

        public bool IsFromSupport { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
