using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProxyController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ProxyController> _logger;

        public ProxyController(
            IHttpClientFactory httpClientFactory,
            ILogger<ProxyController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> ProxyRequest([FromBody] ProxyRequestDto request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                if (request.OriginalRequest == null || request.ProxySettings == null || string.IsNullOrEmpty(request.ProxySettings.Url))
                {
                    return BadRequest(new { message = "Orijinal istek veya proxy ayarları eksik" });
                }

                // Configure HTTP handler with proxy settings
                var handler = new HttpClientHandler
                {
                    Proxy = new WebProxy
                    {
                        Address = new Uri(request.ProxySettings.Url),
                        UseDefaultCredentials = false,
                    },
                    UseProxy = true,
                    AllowAutoRedirect = true,
                    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
                };

                // Add proxy authentication if provided
                if (!string.IsNullOrEmpty(request.ProxySettings.Username) &&
                    !string.IsNullOrEmpty(request.ProxySettings.Password))
                {
                    handler.Proxy.Credentials = new NetworkCredential(
                        request.ProxySettings.Username,
                        request.ProxySettings.Password
                    );
                }

                // Create HTTP client with the configured handler
                using var httpClient = new HttpClient(handler);

                // Set timeout if provided
                if (request.OriginalRequest.Timeout.HasValue && request.OriginalRequest.Timeout.Value > 0)
                {
                    httpClient.Timeout = TimeSpan.FromMilliseconds(request.OriginalRequest.Timeout.Value);
                }

                // Create HTTP request message
                var targetRequest = new HttpRequestMessage
                {
                    Method = new HttpMethod(request.OriginalRequest.Method),
                    RequestUri = new Uri(request.OriginalRequest.Url)
                };

                // Add headers
                if (request.OriginalRequest.Headers != null)
                {
                    foreach (var header in request.OriginalRequest.Headers)
                    {
                        // Skip problematic headers that should be set by HttpClient
                        if (IsRestrictedHeader(header.Key)) continue;

                        targetRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);
                    }
                }

                // Add query parameters
                if (request.OriginalRequest.Params != null && request.OriginalRequest.Params.Count > 0)
                {
                    var uriBuilder = new UriBuilder(targetRequest.RequestUri);
                    var query = System.Web.HttpUtility.ParseQueryString(uriBuilder.Query);

                    foreach (var param in request.OriginalRequest.Params)
                    {
                        query[param.Key] = param.Value;
                    }

                    uriBuilder.Query = query.ToString();
                    targetRequest.RequestUri = uriBuilder.Uri;
                }

                // Add body if present
                if (request.OriginalRequest.Body != null)
                {
                    var bodyJson = JsonSerializer.Serialize(request.OriginalRequest.Body);
                    targetRequest.Content = new StringContent(bodyJson, Encoding.UTF8, "application/json");
                }

                // Send the request
                var response = await httpClient.SendAsync(targetRequest);

                // Read response content
                var responseContent = await response.Content.ReadAsStringAsync();

                // Prepare response headers
                var responseHeaders = new Dictionary<string, string>();
                foreach (var header in response.Headers)
                {
                    responseHeaders[header.Key] = string.Join(",", header.Value);
                }

                foreach (var header in response.Content.Headers)
                {
                    responseHeaders[header.Key] = string.Join(",", header.Value);
                }

                // Create response object
                var proxyResponse = new ProxyResponseDto
                {
                    StatusCode = (int)response.StatusCode,
                    Headers = responseHeaders,
                    Body = responseContent
                };

                return Ok(proxyResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Proxy isteği sırasında bir hata oluştu");

                if (ex is HttpRequestException httpEx)
                {
                    return StatusCode(502, new { message = "Proxy isteği başarısız oldu", error = httpEx.Message });
                }
                else if (ex is TaskCanceledException)
                {
                    return StatusCode(504, new { message = "Proxy isteği zaman aşımına uğradı" });
                }

                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        private bool IsRestrictedHeader(string header)
        {
            var restrictedHeaders = new[]
            {
                "Host", "Content-Length", "Connection", "Keep-Alive", "Proxy-Authenticate",
                "Proxy-Authorization", "Transfer-Encoding", "TE", "Trailer", "Upgrade"
            };

            return restrictedHeaders.Contains(header, StringComparer.OrdinalIgnoreCase);
        }
    }
}
