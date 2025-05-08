using WebTestUI.Backend.Data.Entities;
using System.Text.Json.Serialization;

namespace WebTestUI.Backend.DTOs
{
    public class K6TestDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Script { get; set; } = string.Empty;
        public string? AuthType { get; set; }
        public string? AuthToken { get; set; }
        public K6TestOptions? Options { get; set; }
        public List<K6TestLog>? Logs { get; set; }
        public K6TestError? ErrorDetails { get; set; }
        public int? RequestId { get; set; }
        public string Status { get; set; } = string.Empty;
        public K6TestResults? Results { get; set; }
        public int? ProcessId { get; set; }
        public long CreatedAt { get; set; }
        public long UpdatedAt { get; set; }
    }
    public class CreateK6TestDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Script { get; set; } = string.Empty;
        public int? RequestId { get; set; }
    }

    public class UpdateK6TestResultsDTO
    {
        public string Status { get; set; } = string.Empty;
        public K6TestResults Results { get; set; } = new K6TestResults();
    }
    public class GenerateK6ScriptDTO
    {
        public RequestData RequestData { get; set; } = new RequestData();
        public K6TestOptions Options { get; set; } = new K6TestOptions();
    }

    public class RequestData
    {
        public string Method { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string? Headers { get; set; }
        public string? AuthType { get; set; }
        public string? AuthToken { get; set; }
        public string? Body { get; set; }
        public string? Params { get; set; }
        public string? Id { get; set; }
        public string? Parameters { get; set; } // Add this property
    }

    public class AddLogEntryDTO
    {
        public string Message { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string? Data { get; set; }
        public K6TestError? Error { get; set; }
    }

    public class UpdateTestStatusAndLogsDTO
    {
        public string Status { get; set; } = string.Empty;
        public List<K6TestLog> Logs { get; set; } = new List<K6TestLog>();
    }
}