// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Data\Entities\Faq.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace WebTestUI.Backend.Data.Entities
{
    public class Faq
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(250)]
        public string Question { get; set; }

        [Required]
        public string Answer { get; set; }

        [MaxLength(50)]
        public string Category { get; set; }

        public int SortOrder { get; set; }

        public bool IsPublished { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
