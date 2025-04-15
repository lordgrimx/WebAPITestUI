using System;

namespace WebTestUI.Backend.Data.Entities
{
    public class History
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int? RequestId { get; set; }
        public string Method { get; set; }
        public string Url { get; set; }
        public int? Status { get; set; }
        public int? Duration { get; set; }  // in milliseconds
        public int? ResponseSize { get; set; }  // in bytes
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Response { get; set; }  // JSON stringified response

        // Navigation properties
        public virtual ApplicationUser User { get; set; }
        public virtual Request Request { get; set; }
    }
}
