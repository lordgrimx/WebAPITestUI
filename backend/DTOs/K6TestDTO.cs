using WebTestUI.Backend.Data.Entities;

namespace WebTestUI.Backend.DTOs
{
    public class K6TestDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string Script { get; set; }
        public string? AuthType { get; set; }
        public string? AuthToken { get; set; }
        public K6TestOptions? Options { get; set; }
        public List<K6TestLog>? Logs { get; set; }
        public K6TestError? ErrorDetails { get; set; }
        public int? RequestId { get; set; }
        public string Status { get; set; }
        public K6TestResults? Results { get; set; }
        public long CreatedAt { get; set; }
        public long UpdatedAt { get; set; }
    }

    public class CreateK6TestDTO
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public string Script { get; set; }
        public int? RequestId { get; set; }
    }

    public class UpdateK6TestResultsDTO
    {
        public string Status { get; set; }
        public K6TestResults Results { get; set; }
    }

    public class GenerateK6ScriptDTO
    {
        public RequestData RequestData { get; set; }
        public K6TestOptions Options { get; set; }
    }

    public class RequestData
    {
        public string Method { get; set; }
        public string Url { get; set; }
        public string? Headers { get; set; }
        public string? AuthType { get; set; }
        public string? AuthToken { get; set; }
        public string? Body { get; set; }
        public string? Params { get; set; }
        public string? Id { get; set; }
    }

    public class AddLogEntryDTO
    {
        public string Message { get; set; }
        public string Level { get; set; }
        public string? Data { get; set; }
        public K6TestError? Error { get; set; }
    }

    public class UpdateTestStatusAndLogsDTO
    {
        public string Status { get; set; }
        public List<K6TestLog> Logs { get; set; }
    }
} 