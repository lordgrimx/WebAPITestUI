using System.ComponentModel.DataAnnotations;

namespace WebTestUI.Backend.DTOs
{
    public class RequestDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } // Added UserId
        public int? CollectionId { get; set; }
        public string CollectionName { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Method { get; set; }
        public string Url { get; set; }
        public Dictionary<string, string> Headers { get; set; }
        public string AuthType { get; set; }
        public object AuthConfig { get; set; }
        public Dictionary<string, string> Params { get; set; }
        public string Body { get; set; }
        public string Tests { get; set; }
        public bool IsFavorite { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateRequestDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public string Description { get; set; }

        [Required]
        public string Method { get; set; }

        [Required]
        public string Url { get; set; }

        public Dictionary<string, string> Headers { get; set; }

        public string AuthType { get; set; }

        public string AuthConfig { get; set; }

        public Dictionary<string, string> Params { get; set; }

        public string Body { get; set; }

        public string Tests { get; set; }

        public bool IsFavorite { get; set; }

        public int? CollectionId { get; set; }

        public int? EnvironmentId { get; set; } // Environment ID eklendi
    }

    public class UpdateRequestDto
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public string Method { get; set; }

        public string Url { get; set; }

        public Dictionary<string, string> Headers { get; set; }

        public string AuthType { get; set; }

        public string AuthConfig { get; set; }

        public Dictionary<string, string> Params { get; set; }

        public string Body { get; set; }

        public string Tests { get; set; }

        public bool? IsFavorite { get; set; }

        public int? CollectionId { get; set; }
    }

    public class ExecuteRequestDto
    {
        [Required]
        public string Method { get; set; }

        [Required]
        public string Url { get; set; }

        public Dictionary<string, string> Headers { get; set; }

        public Dictionary<string, string> Params { get; set; }

        public string Body { get; set; }

        public string AuthType { get; set; }

        public string AuthConfig { get; set; }
    }

    public class ExecuteRequestResultDto
    {
        public int? RequestId { get; set; }
        public int? HistoryId { get; set; }
        public int StatusCode { get; set; }
        public Dictionary<string, string> Headers { get; set; }
        public string Body { get; set; }
        public int Duration { get; set; }
        public int Size { get; set; }
    }

    // --- Added Auth DTOs ---
    public class BasicAuthDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class BearerAuthDto
    {
        public string Token { get; set; }
    }

    public class ApiKeyAuthDto
    {
        [Required]
        public string Key { get; set; }
        [Required]
        public string Value { get; set; }
        [Required]
        public string AddTo { get; set; } // "header" or "query"
    }
    // --- End Added Auth DTOs ---
}
