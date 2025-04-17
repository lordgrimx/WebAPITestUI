using System.Text.Json;
using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Controllers
{
    // This is an extension file for K6Controller to add helper methods
    public partial class K6Controller
    {
        // Method to log the parsed metrics as JSON to the console/logger
        private void LogMetricsToConsole(K6DetailedMetricsDto metrics)
        {
            try
            {
                // Create serializer options with indentation for readability
                var options = new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                // Serialize the metrics object to JSON
                string metricsJson = JsonSerializer.Serialize(metrics, options);

                // Log the JSON output
                _logger.LogInformation("=== K6 Test Results Summary ===");
                _logger.LogInformation(metricsJson);
                _logger.LogInformation("===============================");

                // Log specific HTTP duration metrics if available
                if (metrics.Http_Req_Duration != null && metrics.Http_Req_Duration.Trend != null)
                {
                    _logger.LogInformation($"HTTP Request Duration: Avg={metrics.Http_Req_Duration.Trend.Avg}ms, Min={metrics.Http_Req_Duration.Trend.Min}ms, Max={metrics.Http_Req_Duration.Trend.Max}ms, P95={metrics.Http_Req_Duration.Trend.P95}ms");
                }
                else
                {
                    _logger.LogWarning("HTTP Request Duration metrics not available");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error logging metrics JSON: {ex.Message}");
            }
        }

        // Helper method to collect HTTP duration metrics
        private void CollectHttpDurationMetrics(K6DetailedMetricsDto metricsDto, Dictionary<string, List<double>> metricPointsData)
        {
            // This method is no longer needed as we're directly adding the metrics in the main ParseK6JsonOutput method
            // But we'll keep it here to maintain compatibility with any code that might call it
            _logger.LogTrace("CollectHttpDurationMetrics called, but metrics are already collected in the main method");
        }
    }
}
