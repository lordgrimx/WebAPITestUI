using System.ComponentModel.DataAnnotations;

namespace WebTestUI.Backend.DTOs
{
    // History DTOs
    public class HistoryDto
    {
        public int Id { get; set; }
        public string? Method { get; set; }
        public string? Url { get; set; }
        public int StatusCode { get; set; }
        public int Duration { get; set; }
        public int Size { get; set; }
        public DateTime Timestamp { get; set; }
        public int? RequestId { get; set; }
        public string? RequestName { get; set; }
        public string? ResponseBody { get; set; } // Added ResponseBody
        public Dictionary<string, string>? RequestHeaders { get; set; } // Added RequestHeaders
        public string? RequestBody { get; set; } // Added RequestBody
    }

    public class RecordHistoryDto
    {
        [Required]
        public string? Method { get; set; }

        [Required]
        public string? Url { get; set; }

        [Required]
        public int StatusCode { get; set; }

        public int Duration { get; set; }

        public int Size { get; set; }

        public Dictionary<string, string>? RequestHeaders { get; set; }

        public Dictionary<string, string>? ResponseHeaders { get; set; }

        public string? RequestBody { get; set; }

        public string? ResponseBody { get; set; }

        public int? RequestId { get; set; }

        public int? EnvironmentId { get; set; } // Add EnvironmentId
    }

    // Environment DTOs
    public class EnvironmentDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public bool IsActive { get; set; }
        public Dictionary<string, string>? Variables { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateEnvironmentDto
    {
        [Required]
        [StringLength(100)]
        public string? Name { get; set; }

        public Dictionary<string, string>? Variables { get; set; }

        public bool IsActive { get; set; }
    }

    public class UpdateEnvironmentDto
    {
        public string? Name { get; set; }

        // Change Variables type from Dictionary<string, string> to string
        public string? Variables { get; set; }

        public bool? IsActive { get; set; }
    }
}
