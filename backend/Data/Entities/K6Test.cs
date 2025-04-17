using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace WebTestUI.Backend.Data.Entities
{
    public class K6Test
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Script { get; set; } = string.Empty;
        public string? AuthType { get; set; }
        public string? AuthToken { get; set; }

        [Column(TypeName = "jsonb")]
        public K6TestOptions? Options { get; set; }

        [Column(TypeName = "jsonb")]
        public List<K6TestLog>? Logs { get; set; }

        [Column(TypeName = "jsonb")]
        public K6TestError? ErrorDetails { get; set; }

        public int? RequestId { get; set; }
        public string Status { get; set; } = string.Empty;

        [Column(TypeName = "jsonb")]
        public K6TestResults? Results { get; set; }

        public long CreatedAt { get; set; }
        public long UpdatedAt { get; set; }
    }
    [Owned]
    public class K6TestOptions
    {
        public int Vus { get; set; }
        public string Duration { get; set; } = string.Empty;
    }
    [Owned]
    public class K6TestLog
    {
        public long Timestamp { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string? Data { get; set; }
        public K6TestError? Error { get; set; }
    }
    [Owned]
    public class K6TestError
    {
        public string Name { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Stack { get; set; }
        public string? Code { get; set; }
    }
    [Owned]
    public class K6TestResults
    {
        [JsonPropertyName("vus")]
        public int Vus { get; set; }

        [JsonPropertyName("duration")]
        public string Duration { get; set; } = string.Empty;

        [JsonPropertyName("requestsPerSecond")]
        public double RequestsPerSecond { get; set; }

        [JsonPropertyName("failureRate")]
        public double FailureRate { get; set; }

        [JsonPropertyName("averageResponseTime")]
        public double AverageResponseTime { get; set; }

        [JsonPropertyName("p95ResponseTime")]
        public double P95ResponseTime { get; set; }

        [JsonPropertyName("timestamp")]
        public long Timestamp { get; set; }

        [JsonPropertyName("detailedMetrics")]
        public K6TestDetailedMetrics? DetailedMetrics { get; set; }
    }
    [Owned]
    public class K6TestDetailedMetrics
    {
        [JsonPropertyName("checksRate")]
        public double ChecksRate { get; set; }

        [JsonPropertyName("dataReceived")]
        public string DataReceived { get; set; } = string.Empty;

        [JsonPropertyName("dataSent")]
        public string DataSent { get; set; } = string.Empty;

        [JsonPropertyName("httpReqRate")]
        public double HttpReqRate { get; set; }

        [JsonPropertyName("httpReqFailed")]
        public double HttpReqFailed { get; set; }

        [JsonPropertyName("successRate")]
        public double SuccessRate { get; set; }

        [JsonPropertyName("iterations")]
        public int Iterations { get; set; }

        [JsonPropertyName("httpReqDuration")]
        public HttpReqDurationMetrics HttpReqDuration { get; set; } = new();

        [JsonPropertyName("iterationDuration")]
        public IterationDurationMetrics IterationDuration { get; set; } = new();
    }
    [Owned]
    public class HttpReqDurationMetrics
    {
        [JsonPropertyName("avg")]
        public double Avg { get; set; }

        [JsonPropertyName("min")]
        public double Min { get; set; }

        [JsonPropertyName("med")]
        public double Med { get; set; }

        [JsonPropertyName("max")]
        public double Max { get; set; }

        [JsonPropertyName("p90")]
        public double P90 { get; set; }

        [JsonPropertyName("p95")]
        public double P95 { get; set; }
    }
    [Owned]
    public class IterationDurationMetrics
    {
        [JsonPropertyName("avg")]
        public double Avg { get; set; }

        [JsonPropertyName("min")]
        public double Min { get; set; }

        [JsonPropertyName("med")]
        public double Med { get; set; }

        [JsonPropertyName("max")]
        public double Max { get; set; }

        [JsonPropertyName("p90")]
        public double P90 { get; set; }

        [JsonPropertyName("p95")]
        public double P95 { get; set; }
    }
}