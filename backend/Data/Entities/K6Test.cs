using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebTestUI.Backend.Data.Entities
{
    public class K6Test
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string Script { get; set; }
        public string? AuthType { get; set; }
        public string? AuthToken { get; set; }

        [Column(TypeName = "jsonb")]
        public K6TestOptions? Options { get; set; }

        [Column(TypeName = "jsonb")]
        public List<K6TestLog>? Logs { get; set; }

        [Column(TypeName = "jsonb")]
        public K6TestError? ErrorDetails { get; set; }

        public int? RequestId { get; set; }
        public string Status { get; set; }

        [Column(TypeName = "jsonb")]
        public K6TestResults? Results { get; set; }

        public long CreatedAt { get; set; }
        public long UpdatedAt { get; set; }
    }

    [NotMapped]
    public class K6TestOptions
    {
        public int Vus { get; set; }
        public string Duration { get; set; }
    }

    [NotMapped]
    public class K6TestLog
    {
        public long Timestamp { get; set; }
        public string Message { get; set; }
        public string Level { get; set; }
        public string? Data { get; set; }
        public K6TestError? Error { get; set; }
    }

    [NotMapped]
    public class K6TestError
    {
        public string Name { get; set; }
        public string Message { get; set; }
        public string? Stack { get; set; }
        public string? Code { get; set; }
    }

    [NotMapped]
    public class K6TestResults
    {
        public int Vus { get; set; }
        public string Duration { get; set; }
        public double RequestsPerSecond { get; set; }
        public double FailureRate { get; set; }
        public double AverageResponseTime { get; set; }
        public double P95ResponseTime { get; set; }
        public long Timestamp { get; set; }
        public K6TestDetailedMetrics? DetailedMetrics { get; set; }
    }

    [NotMapped]
    public class K6TestDetailedMetrics
    {
        public double ChecksRate { get; set; }
        public string DataReceived { get; set; }
        public string DataSent { get; set; }
        public double HttpReqRate { get; set; }
        public double HttpReqFailed { get; set; }
        public double SuccessRate { get; set; }
        public int Iterations { get; set; }
        public HttpReqDurationMetrics HttpReqDuration { get; set; }
        public IterationDurationMetrics IterationDuration { get; set; }
    }

    [NotMapped]
    public class HttpReqDurationMetrics
    {
        public double Avg { get; set; }
        public double Min { get; set; }
        public double Med { get; set; }
        public double Max { get; set; }
        public double P90 { get; set; }
        public double P95 { get; set; }
    }

    [NotMapped]
    public class IterationDurationMetrics
    {
        public double Avg { get; set; }
        public double Min { get; set; }
        public double Med { get; set; }
        public double Max { get; set; }
        public double P90 { get; set; }
        public double P95 { get; set; }
    }
} 