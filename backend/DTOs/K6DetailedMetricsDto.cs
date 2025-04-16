namespace WebTestUI.Backend.DTOs
{
    public class K6DetailedMetricsDto
    {
        public MetricData Checks { get; set; }
        public MetricData Data { get; set; }
        public MetricData Http_Reqs { get; set; }
        public MetricData Iterations { get; set; }
        public MetricData Vus { get; set; }
        public MetricData Vus_Max { get; set; }
    }

    public class MetricData
    {
        public double Rate { get; set; }
        public double Count { get; set; }
        public TrendStats Trend { get; set; }
    }

    public class TrendStats
    {
        public double Avg { get; set; }
        public double Min { get; set; }
        public double Med { get; set; }
        public double Max { get; set; }
        public double P90 { get; set; }
        public double P95 { get; set; }
    }

    public class K6MetricsResponseDto
    {
        public string Status { get; set; }
        public K6DetailedMetricsDto Metrics { get; set; }
        public string RunId { get; set; }
        public string TestId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
    }
} 