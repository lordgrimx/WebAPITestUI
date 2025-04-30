// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Data\Entities\SupportTicket.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebTestUI.Backend.Data.Entities
{
    public class SupportTicket
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Subject { get; set; }

        [Required]
        public string Message { get; set; }

        [ForeignKey("User")]
        public string UserId { get; set; }

        public virtual ApplicationUser User { get; set; }

        [Required]
        public string Status { get; set; } = "Open"; // Open, In Progress, Resolved, Closed

        public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Collection to store replies
        public virtual ICollection<SupportTicketReply> Replies { get; set; } = new HashSet<SupportTicketReply>();
    }
}
