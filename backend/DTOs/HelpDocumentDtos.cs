// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\DTOs\HelpDocumentDtos.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace WebTestUI.Backend.DTOs
{
    public class HelpDocumentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string IconName { get; set; } = "FileText";
    }

    public class CreateHelpDocumentDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Category { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public string IconName { get; set; } = "FileText";

        public int SortOrder { get; set; } = 0;

        public bool IsPublished { get; set; } = true;
    }
}
