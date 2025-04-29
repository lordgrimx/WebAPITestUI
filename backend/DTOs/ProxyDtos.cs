using System.Text.Json.Serialization;

namespace WebTestUI.Backend.DTOs
{
    public class ProxyRequestDto
    {
        public OriginalRequestDto OriginalRequest { get; set; } = new OriginalRequestDto();
        public ProxySettingsDto ProxySettings { get; set; } = new ProxySettingsDto();
    }

    public class OriginalRequestDto
    {
        public string Method { get; set; } = "GET";
        public string Url { get; set; } = string.Empty;
        public Dictionary<string, string> Headers { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> Params { get; set; } = new Dictionary<string, string>();
        public object? Body { get; set; }
        public int? Timeout { get; set; }
    }

    public class ProxySettingsDto
    {
        public string Url { get; set; } = string.Empty;
        public string? Username { get; set; }
        public string? Password { get; set; }
    }

    public class ProxyResponseDto
    {
        public int StatusCode { get; set; }
        public Dictionary<string, string> Headers { get; set; } = new Dictionary<string, string>();
        public string Body { get; set; } = string.Empty;
    }
}
