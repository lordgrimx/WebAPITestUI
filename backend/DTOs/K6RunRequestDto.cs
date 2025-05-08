namespace WebTestUI.Backend.DTOs
{
    public class K6RunRequestDto
    {
        public Guid TestId { get; set; }
        public string? Script { get; set; }
        public K6Options? Options { get; set; }
        public string? OutputFormat { get; set; } = "json";
        public bool? Paused { get; set; } = false;
        public bool? GracefulStop { get; set; } = false;
        public Dictionary<string, string>? Environment { get; set; }
        public string? WorkingDirectory { get; set; }
        public Guid TestIdToRun { get; set; }
        public string? NewTestName { get; set; }
    }

    public class K6Options
    {
        public int? Vus { get; set; }
        public string? Duration { get; set; }
        public int? Iterations { get; set; }
        public Dictionary<string, object>? Stages { get; set; }
        public Dictionary<string, object>? Thresholds { get; set; }
        public Dictionary<string, object>? Scenarios { get; set; }
    }
}