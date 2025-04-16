using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.IO;
using System.Security.Claims;
using System.Text.RegularExpressions;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services;
using System.Text;
using System.Text.Json;

namespace WebTestUI.Backend.Controllers
{

     // Default path, can be overridden in configuration

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class K6Controller : ControllerBase
    {
        
        private readonly ILogger<K6Controller> _logger;
        private readonly IConfiguration _configuration;
        private readonly IK6TestService _k6TestService;
        private readonly string _k6ExecutablePath;
        private readonly Dictionary<string, Process> _runningTests;

        public K6Controller(
            ILogger<K6Controller> logger,
            IConfiguration configuration,
            IK6TestService k6TestService)
        {
            _logger = logger;
            _configuration = configuration;
            _k6TestService = k6TestService;
            _k6ExecutablePath = _configuration["K6:ExecutablePath"] ?? "k6";
            _runningTests = new Dictionary<string, Process>();
        }

        [HttpPost("run")]
        public async Task<IActionResult> RunK6Test([FromBody] K6RunRequestDto request)
        {
            try
            {
                var tempDir = Path.GetTempPath();
                if (!Directory.Exists(tempDir))
                {
                    Directory.CreateDirectory(tempDir);
                }
                _logger.LogInformation($"Temp directory path: {tempDir}");
                
                var scriptFileName = $"k6-script-{Guid.NewGuid()}.js";
                var scriptPath = Path.Combine(tempDir, scriptFileName);
                _logger.LogInformation($"Creating script file at: {scriptPath}");

                try 
                {
                    // Ensure the file is properly written and flushed
                    using (var writer = new StreamWriter(scriptPath, false, Encoding.UTF8))
                    {
                        await writer.WriteAsync(request.Script);
                        await writer.FlushAsync();
                    }

                    if (!System.IO.File.Exists(scriptPath))
                    {
                        _logger.LogError($"Failed to create script file: {scriptPath}");
                        return StatusCode(500, new { error = "Failed to create script file" });
                    }

                    var fileInfo = new FileInfo(scriptPath);
                    _logger.LogInformation($"Script file created successfully. Size: {fileInfo.Length} bytes");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error writing script file: {ex.Message}");
                    return StatusCode(500, new { error = $"Script file creation error: {ex.Message}" });
                }

                var jsonOutputPath = Path.Combine(tempDir, $"k6-output-{Guid.NewGuid()}.json");
                _logger.LogInformation($"JSON çıktı dosyası: {jsonOutputPath}");

                var args = new List<string>
                {
                    "run",
                    "--out", $"json={jsonOutputPath}"
                };

                if (request.Options != null)
                {
                    if (request.Options.Vus.HasValue)
                        args.Add($"--vus={request.Options.Vus.Value}");
                    
                    if (!string.IsNullOrEmpty(request.Options.Duration))
                        args.Add($"--duration={request.Options.Duration}");
                    
                    if (request.Options.Iterations.HasValue)
                        args.Add($"--iterations={request.Options.Iterations.Value}");
                }

                args.Add(scriptPath);

                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = _k6ExecutablePath,
                        Arguments = string.Join(" ", args),
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        WorkingDirectory = request.WorkingDirectory ?? Path.GetTempPath()
                    }
                };

                var output = new StringBuilder();
                var error = new StringBuilder();

                process.OutputDataReceived += (sender, e) =>
                {
                    if (e.Data != null)
                    {
                        output.AppendLine(e.Data);
                        _logger.LogInformation($"K6 Output: {e.Data}");
                    }
                };

                process.ErrorDataReceived += (sender, e) =>
                {
                    if (e.Data != null)
                    {
                        error.AppendLine(e.Data);
                        _logger.LogError($"K6 Error: {e.Data}");
                    }
                };

                var testId = Guid.NewGuid().ToString();
                _runningTests[testId] = process;

                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                await process.WaitForExitAsync();

                var exitCode = process.ExitCode;
                process.Close();

               

                if (exitCode != 0)
                {
                    return StatusCode(500, new { error = error.ToString() });
                }

                try
                {
                    var metrics = ParseK6Output(output.ToString());
                    return Ok(new K6MetricsResponseDto
                    {
                        Status = "completed",
                        Metrics = metrics,
                        RunId = testId,
                        TestId = testId,
                        StartTime = DateTime.UtcNow,
                        EndTime = DateTime.UtcNow
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error parsing K6 output: {ex.Message}");
                    return StatusCode(500, new { error = "Error parsing K6 output" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error running K6 test: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("metrics/{runId}")]
        public IActionResult GetMetrics(string runId)
        {
            if (!_runningTests.TryGetValue(runId, out var process))
            {
                return NotFound(new { error = "Test run not found" });
            }

            if (!process.HasExited)
            {
                return Ok(new { status = "running" });
            }

            _runningTests.Remove(runId);
            return Ok(new { status = "completed" });
        }

        [HttpPost("stop/{runId}")]
        public IActionResult StopTest(string runId)
        {
            if (!_runningTests.TryGetValue(runId, out var process))
            {
                return NotFound(new { error = "Test run not found" });
            }

            try
            {
                if (!process.HasExited)
                {
                    process.Kill(true);
                }

                _runningTests.Remove(runId);
                return Ok(new { status = "stopped" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error stopping K6 test: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private K6DetailedMetricsDto ParseK6Output(string output)
        {
            try
            {
                var lines = output.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                var metricsLine = lines.LastOrDefault(l => l.Contains("\"type\":\"metric\""));

                if (string.IsNullOrEmpty(metricsLine))
                {
                    throw new Exception("No metrics found in K6 output");
                }

                var metricsJson = JsonSerializer.Deserialize<JsonElement>(metricsLine);
                var metrics = new K6DetailedMetricsDto();

                if (metricsJson.TryGetProperty("data", out var data))
                {
                    metrics.Checks = ExtractMetricData(data, "checks");
                    metrics.Data = ExtractMetricData(data, "data");
                    metrics.Http_Reqs = ExtractMetricData(data, "http_reqs");
                    metrics.Iterations = ExtractMetricData(data, "iterations");
                    metrics.Vus = ExtractMetricData(data, "vus");
                    metrics.Vus_Max = ExtractMetricData(data, "vus_max");
                }

                return metrics;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error parsing K6 metrics: {ex.Message}");
                throw;
            }
        }

        private MetricData ExtractMetricData(JsonElement data, string metricName)
        {
            if (!data.TryGetProperty(metricName, out var metric))
            {
                return null;
            }

            return new MetricData
            {
                Rate = metric.GetProperty("rate").GetDouble(),
                Count = metric.GetProperty("count").GetDouble(),
                Trend = new TrendStats
                {
                    Avg = metric.GetProperty("avg").GetDouble(),
                    Min = metric.GetProperty("min").GetDouble(),
                    Med = metric.GetProperty("med").GetDouble(),
                    Max = metric.GetProperty("max").GetDouble(),
                    P90 = metric.GetProperty("p90").GetDouble(),
                    P95 = metric.GetProperty("p95").GetDouble()
                }
            };
        }
    }
}
