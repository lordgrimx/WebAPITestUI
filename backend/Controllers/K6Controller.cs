using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.IO;
using System.Security.Claims;
using System.Text.RegularExpressions;
using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class K6Controller : ControllerBase
    {
        private readonly ILogger<K6Controller> _logger;

        public K6Controller(ILogger<K6Controller> logger)
        {
            _logger = logger;
        }

        [HttpPost("run")]
        public async Task<IActionResult> RunK6Test([FromBody] K6RunRequestDto request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                if (string.IsNullOrEmpty(request.Script))
                {
                    return BadRequest(new { message = "K6 script boş olamaz." });
                }

                // Create a temporary file for the script
                var tempFilePath = Path.GetTempFileName() + ".js";
                await System.IO.File.WriteAllTextAsync(tempFilePath, request.Script);

                try
                {
                    // Execute k6 command
                    var processStartInfo = new ProcessStartInfo
                    {
                        FileName = "k6",
                        Arguments = $"run {tempFilePath}",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };

                    using var process = new Process();
                    process.StartInfo = processStartInfo;
                    process.Start();

                    var output = await process.StandardOutput.ReadToEndAsync();
                    var error = await process.StandardError.ReadToEndAsync();
                    await process.WaitForExitAsync();

                    if (process.ExitCode != 0)
                    {
                        _logger.LogError("K6 execution failed: {Error}", error);
                        return StatusCode(500, new { message = "K6 testi başarısız oldu.", error = error });
                    }

                    // Parse metrics from the output
                    var results = new K6ResultDto
                    {
                        Vus = request.Options?.Vus ?? 10,
                        Duration = request.Options?.Duration ?? "30s",
                        RequestsPerSecond = 0,
                        FailureRate = 0,
                        AverageResponseTime = 0,
                        P95ResponseTime = 0,
                        Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                        DetailedMetrics = new K6DetailedMetricsDto
                        {
                            ChecksRate = 0,
                            DataReceived = "0 B",
                            DataSent = "0 B",
                            HttpReqRate = 0,
                            HttpReqFailed = 0,
                            SuccessRate = 0,
                            Iterations = 0,
                            HttpReqDuration = new K6DurationMetricsDto(),
                            IterationDuration = new K6DurationMetricsDto()
                        }
                    };

                    // Extract http_reqs rate
                    var reqsMatch = Regex.Match(output, @"http_reqs[\s\S]+?:\s+\d+\s+([0-9.]+)\/s");
                    if (reqsMatch.Success && reqsMatch.Groups.Count > 1)
                    {
                        results.RequestsPerSecond = float.Parse(reqsMatch.Groups[1].Value);
                    }

                    // Extract failure rate
                    var failureMatch = Regex.Match(output, @"failure_rate[\s\S]+?:\s+([0-9.]+)%");
                    if (failureMatch.Success && failureMatch.Groups.Count > 1)
                    {
                        results.FailureRate = float.Parse(failureMatch.Groups[1].Value);
                    }

                    // Extract average response time
                    var avgRespMatch = Regex.Match(output, @"http_req_duration[\s\S]+?avg=([0-9.]+)([mµ]?)s");
                    if (avgRespMatch.Success && avgRespMatch.Groups.Count > 2)
                    {
                        float avg = float.Parse(avgRespMatch.Groups[1].Value);
                        string unit = avgRespMatch.Groups[2].Value;

                        // Convert to milliseconds
                        if (unit == "µ")
                        {
                            avg /= 1000; // Convert microseconds to milliseconds
                        }
                        else if (string.IsNullOrEmpty(unit))
                        {
                            avg *= 1000; // Convert seconds to milliseconds
                        }

                        results.AverageResponseTime = avg;
                    }

                    // Extract p95 response time
                    var p95Match = Regex.Match(output, @"http_req_duration[\s\S]+?p\(95\)=([0-9.]+)([mµ]?)s");
                    if (p95Match.Success && p95Match.Groups.Count > 2)
                    {
                        float p95 = float.Parse(p95Match.Groups[1].Value);
                        string unit = p95Match.Groups[2].Value;

                        // Convert to milliseconds
                        if (unit == "µ")
                        {
                            p95 /= 1000; // Convert microseconds to milliseconds
                        }
                        else if (string.IsNullOrEmpty(unit))
                        {
                            p95 *= 1000; // Convert seconds to milliseconds
                        }

                        results.P95ResponseTime = p95;
                    }

                    // Extract detailed metrics
                    ExtractDetailedMetrics(output, results.DetailedMetrics);

                    return Ok(results);
                }
                finally
                {
                    // Clean up the temporary file
                    if (System.IO.File.Exists(tempFilePath))
                    {
                        System.IO.File.Delete(tempFilePath);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "K6 testi çalıştırılırken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        private void ExtractDetailedMetrics(string output, K6DetailedMetricsDto metrics)
        {
            // Extract checks rate
            var checksMatch = Regex.Match(output, @"checks[\s\S]+?:\s+\d+\s+([0-9.]+)\/s");
            if (checksMatch.Success && checksMatch.Groups.Count > 1)
            {
                metrics.ChecksRate = float.Parse(checksMatch.Groups[1].Value);
            }

            // Extract data received
            var dataReceivedMatch = Regex.Match(output, @"data_received[\s\S]+?:\s+([0-9.]+\s+[A-Z]+)");
            if (dataReceivedMatch.Success && dataReceivedMatch.Groups.Count > 1)
            {
                metrics.DataReceived = dataReceivedMatch.Groups[1].Value;
            }

            // Extract data sent
            var dataSentMatch = Regex.Match(output, @"data_sent[\s\S]+?:\s+([0-9.]+\s+[A-Z]+)");
            if (dataSentMatch.Success && dataSentMatch.Groups.Count > 1)
            {
                metrics.DataSent = dataSentMatch.Groups[1].Value;
            }

            // Extract HTTP request rate
            var httpReqRateMatch = Regex.Match(output, @"http_reqs[\s\S]+?:\s+\d+\s+([0-9.]+)\/s");
            if (httpReqRateMatch.Success && httpReqRateMatch.Groups.Count > 1)
            {
                metrics.HttpReqRate = float.Parse(httpReqRateMatch.Groups[1].Value);
            }

            // Extract HTTP request failed rate
            var httpReqFailedMatch = Regex.Match(output, @"http_req_failed[\s\S]+?:\s+([0-9.]+)%");
            if (httpReqFailedMatch.Success && httpReqFailedMatch.Groups.Count > 1)
            {
                metrics.HttpReqFailed = float.Parse(httpReqFailedMatch.Groups[1].Value);
            }

            // Extract success rate (100% - failure rate)
            var successRateMatch = Regex.Match(output, @"failure_rate[\s\S]+?:\s+([0-9.]+)%");
            if (successRateMatch.Success && successRateMatch.Groups.Count > 1)
            {
                metrics.SuccessRate = 100 - float.Parse(successRateMatch.Groups[1].Value);
            }

            // Extract iterations count
            var iterationsMatch = Regex.Match(output, @"iterations[\s\S]+?:\s+(\d+)\s+");
            if (iterationsMatch.Success && iterationsMatch.Groups.Count > 1)
            {
                metrics.Iterations = int.Parse(iterationsMatch.Groups[1].Value);
            }

            // Extract HTTP request duration metrics
            var httpDurationMatch = Regex.Match(output, @"http_req_duration[\s\S]+?min=([0-9.]+)([mµ]?)s[\s\S]+?med=([0-9.]+)([mµ]?)s[\s\S]+?max=([0-9.]+)([mµ]?)s[\s\S]+?p\(90\)=([0-9.]+)([mµ]?)s[\s\S]+?p\(95\)=([0-9.]+)([mµ]?)s");
            if (httpDurationMatch.Success && httpDurationMatch.Groups.Count > 10)
            {
                metrics.HttpReqDuration.Min = ConvertToMilliseconds(float.Parse(httpDurationMatch.Groups[1].Value), httpDurationMatch.Groups[2].Value);
                metrics.HttpReqDuration.Med = ConvertToMilliseconds(float.Parse(httpDurationMatch.Groups[3].Value), httpDurationMatch.Groups[4].Value);
                metrics.HttpReqDuration.Max = ConvertToMilliseconds(float.Parse(httpDurationMatch.Groups[5].Value), httpDurationMatch.Groups[6].Value);
                metrics.HttpReqDuration.P90 = ConvertToMilliseconds(float.Parse(httpDurationMatch.Groups[7].Value), httpDurationMatch.Groups[8].Value);
                metrics.HttpReqDuration.P95 = ConvertToMilliseconds(float.Parse(httpDurationMatch.Groups[9].Value), httpDurationMatch.Groups[10].Value);
            }

            // Extract iteration duration metrics if available
            var iterDurationMatch = Regex.Match(output, @"iteration_duration[\s\S]+?min=([0-9.]+)([mµ]?)s[\s\S]+?med=([0-9.]+)([mµ]?)s[\s\S]+?max=([0-9.]+)([mµ]?)s[\s\S]+?p\(90\)=([0-9.]+)([mµ]?)s[\s\S]+?p\(95\)=([0-9.]+)([mµ]?)s");
            if (iterDurationMatch.Success && iterDurationMatch.Groups.Count > 10)
            {
                metrics.IterationDuration.Min = ConvertToMilliseconds(float.Parse(iterDurationMatch.Groups[1].Value), iterDurationMatch.Groups[2].Value);
                metrics.IterationDuration.Med = ConvertToMilliseconds(float.Parse(iterDurationMatch.Groups[3].Value), iterDurationMatch.Groups[4].Value);
                metrics.IterationDuration.Max = ConvertToMilliseconds(float.Parse(iterDurationMatch.Groups[5].Value), iterDurationMatch.Groups[6].Value);
                metrics.IterationDuration.P90 = ConvertToMilliseconds(float.Parse(iterDurationMatch.Groups[7].Value), iterDurationMatch.Groups[8].Value);
                metrics.IterationDuration.P95 = ConvertToMilliseconds(float.Parse(iterDurationMatch.Groups[9].Value), iterDurationMatch.Groups[10].Value);
            }
        }

        private float ConvertToMilliseconds(float value, string unit)
        {
            if (unit == "µ")
            {
                return value / 1000; // Convert microseconds to milliseconds
            }
            else if (string.IsNullOrEmpty(unit))
            {
                return value * 1000; // Convert seconds to milliseconds
            }

            return value; // Already in milliseconds
        }
    }
}
