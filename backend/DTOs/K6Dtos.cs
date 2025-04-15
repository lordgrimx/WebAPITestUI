using System.Text.Json.Serialization;

namespace WebTestUI.Backend.DTOs
{
    public class K6RunRequestDto
    {
        public string Script { get; set; } = string.Empty;
        public string? TestId { get; set; }
        public K6OptionsDto? Options { get; set; }
    }

    public class K6OptionsDto
    {
        public int Vus { get; set; } = 10;
        public string Duration { get; set; } = "30s";
    }

    public class K6ResultDto
    {
        public int Vus { get; set; }
        public string Duration { get; set; } = string.Empty;
        public float RequestsPerSecond { get; set; }
        public float FailureRate { get; set; }
        public float AverageResponseTime { get; set; }
        public float P95ResponseTime { get; set; }
        public long Timestamp { get; set; }
        public K6DetailedMetricsDto DetailedMetrics { get; set; } = new K6DetailedMetricsDto();
    }

    public class K6DetailedMetricsDto
    {
        public float ChecksRate { get; set; }
        public string DataReceived { get; set; } = "0 B";
        public string DataSent { get; set; } = "0 B";
        public float HttpReqRate { get; set; }
        public float HttpReqFailed { get; set; }
        public float SuccessRate { get; set; }
        public int Iterations { get; set; }
        public K6DurationMetricsDto HttpReqDuration { get; set; } = new K6DurationMetricsDto();
        public K6DurationMetricsDto IterationDuration { get; set; } = new K6DurationMetricsDto();
    }

    public class K6DurationMetricsDto
    {
        public float Avg { get; set; }
        public float Min { get; set; }
        public float Med { get; set; }
        public float Max { get; set; }
        public float P90 { get; set; }
        public float P95 { get; set; }
    }
}
