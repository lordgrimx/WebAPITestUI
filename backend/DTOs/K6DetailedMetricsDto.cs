namespace WebTestUI.Backend.DTOs
{
    public class K6DetailedMetricsDto
    {
        public MetricData? Checks { get; set; }
        public MetricData? Data { get; set; }
        public MetricData? Http_Reqs { get; set; }
        public MetricData? Http_Req_Failed { get; set; } // Eklendi
        public MetricData? Success_Rate { get; set; } // Başarı oranı için eklendi
        public MetricData? Iterations { get; set; }
        public MetricData? Vus { get; set; }
        public MetricData? Vus_Max { get; set; }

        // HTTP Duration metrics
        public MetricData? Http_Req_Duration { get; set; }
        public MetricData? Http_Req_Blocked { get; set; }
        public MetricData? Http_Req_Connecting { get; set; }
        public MetricData? Http_Req_Tls_Handshaking { get; set; }
        public MetricData? Http_Req_Sending { get; set; }
        public MetricData? Http_Req_Waiting { get; set; }
        public MetricData? Http_Req_Receiving { get; set; }
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
