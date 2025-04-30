// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Data\Entities\HelpDocument.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace WebTestUI.Backend.Data.Entities
{
    public class HelpDocument
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        [MaxLength(50)]
        public string Category { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        public string IconName { get; set; } = "FileText";

        public int SortOrder { get; set; }

        public bool IsPublished { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
