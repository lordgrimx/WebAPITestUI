// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\DTOs\FaqDtos.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace WebTestUI.Backend.DTOs
{
    public class FaqDto
    {
        public int Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public string? Category { get; set; }
        public int SortOrder { get; set; }
    }

    public class CreateFaqDto
    {
        [Required]
        [MaxLength(250)]
        public string Question { get; set; }

        [Required]
        public string Answer { get; set; }

        [MaxLength(50)]
        public string Category { get; set; }

        public int SortOrder { get; set; } = 0;

        public bool IsPublished { get; set; } = true;
    }

    public class UpdateFaqDto
    {
        [Required]
        [MaxLength(250)]
        public string Question { get; set; }

        [Required]
        public string Answer { get; set; }

        [MaxLength(50)]
        public string Category { get; set; }

        public int SortOrder { get; set; } = 0;

        public bool IsPublished { get; set; } = true;
    }
}
