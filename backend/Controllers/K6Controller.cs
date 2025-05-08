using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.IO;
using System.Security.Claims;
using System.Text.RegularExpressions;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services;
using WebTestUI.Backend.Services.Interfaces;
using System.Text;
using System.Text.Json;
using System.Linq;
using Microsoft.VisualBasic; // Added for LINQ usage
using Microsoft.Extensions.DependencyInjection;

namespace WebTestUI.Backend.Controllers
{

    // Default path, can be overridden in configuration    
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public partial class K6Controller : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<K6Controller> _logger;
        private readonly IConfiguration _configuration;
        private readonly IK6TestService _k6TestService;
        private readonly string _k6ExecutablePath;
        private readonly Dictionary<string, Process> _runningTests;
        private readonly Dictionary<int, string> _processIdToTestIdMap;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public K6Controller(
            ILogger<K6Controller> logger,
            IConfiguration configuration,
            IK6TestService k6TestService,
            INotificationService notificationService,
            IServiceScopeFactory serviceScopeFactory)
        {
            _logger = logger;
            _configuration = configuration;
            _k6TestService = k6TestService;
            _k6ExecutablePath = _configuration["K6:ExecutablePath"] ?? "k6";
            _runningTests = new Dictionary<string, Process>();
            _processIdToTestIdMap = new Dictionary<int, string>();
            _notificationService = notificationService;
            _serviceScopeFactory = serviceScopeFactory;
        }

        [HttpPost("run")]
        public async Task<IActionResult> RunK6Test([FromBody] K6RunRequestDto request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token.");
            }
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
                    using (var writer = new StreamWriter(scriptPath, false, Encoding.UTF8))
                    {
                        await writer.WriteAsync(request.Script);
                        if (string.IsNullOrEmpty(request.Script))
                        {
                            _logger.LogError("Script content is null or empty.");
                            return BadRequest(new { error = "Script content cannot be null or empty." });
                        }
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

                Guid testRunGuid;
                if (request.TestIdToRun == Guid.Empty && !string.IsNullOrEmpty(request.NewTestName))
                {
                    if (string.IsNullOrEmpty(request.Script))
                    {
                        _logger.LogError("Script content is required when creating a new test.");
                        return BadRequest(new { error = "Script content is required for a new test." });
                    }
                    var createDto = new CreateK6TestDTO
                    {
                        Name = request.NewTestName,
                        Script = request.Script,
                    };
                    var newK6Test = await _k6TestService.CreateK6TestAsync(createDto);
                    testRunGuid = newK6Test.Id;
                }
                else if (request.TestIdToRun != Guid.Empty)
                {
                    testRunGuid = request.TestIdToRun;
                    var existingTest = await _k6TestService.ExecuteK6TestAsync(testRunGuid);
                    if (existingTest == null)
                    {
                        return NotFound(new { error = $"K6 test definition not found with ID {testRunGuid}" });
                    }
                    if (string.IsNullOrEmpty(request.Script) && !string.IsNullOrEmpty(existingTest.Script))
                    {
                        request.Script = existingTest.Script;
                        await System.IO.File.WriteAllTextAsync(scriptPath, request.Script, Encoding.UTF8);
                    }
                }
                else
                {
                    return BadRequest(new { error = "Either TestIdToRun (for existing test) or NewTestName (for new test) must be provided." });
                }

                _logger.LogInformation($"Attempting to start K6 process for test ID: {testRunGuid}");
                process.Start();
                var processId = process.Id;
                _logger.LogInformation($"K6 process started with PID: {processId} for test ID: {testRunGuid}");

                string runId = testRunGuid.ToString();
                _runningTests[runId] = process;
                _processIdToTestIdMap[processId] = runId;

                await _k6TestService.UpdateK6TestProcessIdAsync(testRunGuid, processId);
                await _k6TestService.UpdateK6TestStatusAsync(testRunGuid, "running");

                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                _ = Task.Run(async () =>
                {
                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        var scopedK6TestService = scope.ServiceProvider.GetRequiredService<IK6TestService>();
                        await process.WaitForExitAsync();
                        var exitCode = process.ExitCode;

                        lock (_runningTests) { _runningTests.Remove(runId); }
                        lock (_processIdToTestIdMap) { _processIdToTestIdMap.Remove(processId); }

                        if (exitCode != 0 && exitCode != 99)
                        {
                            _logger.LogError($"K6 process for test {runId} (PID: {processId}) exited with code {exitCode}. Error: {error.ToString()}");
                            await scopedK6TestService.UpdateK6TestStatusAsync(testRunGuid, "failed");
                            if (System.IO.File.Exists(jsonOutputPath)) try { System.IO.File.Delete(jsonOutputPath); } catch { /* ignore */ }
                            return;
                        }

                        if (System.IO.File.Exists(jsonOutputPath))
                        {
                            try
                            {
                                var jsonContent = await System.IO.File.ReadAllTextAsync(jsonOutputPath);
                                double durationInSeconds = 0;
                                if (request.Options?.Duration != null) {
                                    durationInSeconds = TryParseK6DurationToSeconds(request.Options.Duration);
                                }
                                var parsedK6Output = ParseK6JsonOutput(jsonContent, durationInSeconds);
                                var resultsToSave = new WebTestUI.Backend.Data.Entities.K6TestResults
                                {
                                    Vus = request.Options?.Vus ?? (parsedK6Output.Vus != null ? ToInt(parsedK6Output.Vus.Count) : 0),
                                    Duration = request.Options?.Duration ?? "",
                                    RequestsPerSecond = parsedK6Output.Http_Reqs?.Rate ?? 0,
                                    FailureRate = parsedK6Output.Http_Req_Failed?.Rate ?? 0,
                                    AverageResponseTime = parsedK6Output.Http_Req_Duration?.Trend?.Avg ?? 0,
                                    P95ResponseTime = parsedK6Output.Http_Req_Duration?.Trend?.P95 ?? 0,
                                    Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                                    DetailedMetrics = new WebTestUI.Backend.Data.Entities.K6TestDetailedMetrics
                                    {
                                        ChecksRate = parsedK6Output.Checks?.Rate ?? 0,
                                        DataReceived = parsedK6Output.Data != null ? parsedK6Output.Data.Count.ToString() : "0",
                                        DataSent = parsedK6Output.Data_Sent != null ? parsedK6Output.Data_Sent.Count.ToString() : "0",
                                        HttpReqRate = parsedK6Output.Http_Reqs?.Rate ?? 0,
                                        HttpReqFailed = parsedK6Output.Http_Req_Failed?.Rate ?? 0,
                                        SuccessRate = parsedK6Output.Success_Rate?.Rate ?? (1 - (parsedK6Output.Http_Req_Failed?.Rate ?? 0)),
                                        Iterations = parsedK6Output.Iterations != null ? ToInt(parsedK6Output.Iterations.Count) : 0,
                                        HttpReqDuration = parsedK6Output.Http_Req_Duration?.Trend != null ? new WebTestUI.Backend.Data.Entities.HttpReqDurationMetrics
                                        {
                                            Avg = parsedK6Output.Http_Req_Duration.Trend.Avg,
                                            Min = parsedK6Output.Http_Req_Duration.Trend.Min,
                                            Med = parsedK6Output.Http_Req_Duration.Trend.Med,
                                            Max = parsedK6Output.Http_Req_Duration.Trend.Max,
                                            P90 = parsedK6Output.Http_Req_Duration.Trend.P90,
                                            P95 = parsedK6Output.Http_Req_Duration.Trend.P95
                                        } : new WebTestUI.Backend.Data.Entities.HttpReqDurationMetrics(),
                                        IterationDuration = parsedK6Output.Iterations?.Trend != null ? new WebTestUI.Backend.Data.Entities.IterationDurationMetrics
                                        {
                                            Avg = parsedK6Output.Iterations.Trend.Avg,
                                            Min = parsedK6Output.Iterations.Trend.Min,
                                            Med = parsedK6Output.Iterations.Trend.Med,
                                            Max = parsedK6Output.Iterations.Trend.Max,
                                            P90 = parsedK6Output.Iterations.Trend.P90,
                                            P95 = parsedK6Output.Iterations.Trend.P95
                                        } : new WebTestUI.Backend.Data.Entities.IterationDurationMetrics()
                                    },
                                    StatusCodes = parsedK6Output.StatusCodes != null ? new WebTestUI.Backend.Data.Entities.StatusCodeMetrics
                                    {
                                        Status200 = parsedK6Output.StatusCodes.Status200,
                                        Status201 = parsedK6Output.StatusCodes.Status201,
                                        Status204 = parsedK6Output.StatusCodes.Status204,
                                        Status400 = parsedK6Output.StatusCodes.Status400,
                                        Status401 = parsedK6Output.StatusCodes.Status401,
                                        Status403 = parsedK6Output.StatusCodes.Status403,
                                        Status404 = parsedK6Output.StatusCodes.Status404,
                                        Status415 = parsedK6Output.StatusCodes.Status415,
                                        Status500 = parsedK6Output.StatusCodes.Status500,
                                        Other = parsedK6Output.StatusCodes.Other
                                    } : new WebTestUI.Backend.Data.Entities.StatusCodeMetrics()
                                };

                                var updateResultsDto = new UpdateK6TestResultsDTO
                                {
                                    Status = (exitCode == 99) ? "completed_with_thresholds" : "completed",
                                    Results = resultsToSave
                                };
                                await scopedK6TestService.UpdateK6TestResultsAsync(testRunGuid, updateResultsDto);
                                _logger.LogInformation($"K6 test {runId} (PID: {processId}) completed and results saved. Exit code: {exitCode}");
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError($"Error processing K6 output for test {runId} (PID: {processId}): {ex.Message}");
                                try
                                {
                                    await scopedK6TestService.UpdateK6TestStatusAsync(testRunGuid, "failed_parsing_results");
                                }
                                catch (Exception serviceEx)
                                {
                                    _logger.LogError($"Failed to update test status to failed_parsing_results for {testRunGuid}: {serviceEx.Message}");
                                }
                            }
                            finally
                            {
                                if (System.IO.File.Exists(jsonOutputPath)) try { System.IO.File.Delete(jsonOutputPath); } catch { /* ignore */ }
                            }
                        }
                        else
                        {
                            _logger.LogWarning($"K6 JSON output file not found for test {runId} (PID: {processId}). Setting status to failed.");
                            try
                            {
                                await scopedK6TestService.UpdateK6TestStatusAsync(testRunGuid, "failed_no_output");
                            }
                            catch (Exception serviceEx)
                            {
                                _logger.LogError($"Failed to update test status to failed_no_output for {testRunGuid}: {serviceEx.Message}");
                            }
                        }

                        if (System.IO.File.Exists(scriptPath)) try { System.IO.File.Delete(scriptPath); } catch { /* ignore */ }
                    }
                });

                return Ok(new { RunId = runId, ProcessId = processId, Message = "K6 test started." });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error running K6 test: {ex.Message}");
                if (!string.IsNullOrEmpty(userId)) {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationDto {
                        UserId = userId,
                        Title = "K6 Test Failed",
                        Message = "An unexpected error occurred while running the K6 test.",
                        Type = "test_error",
                        RelatedEntityType = "k6_run",
                        RelatedEntityId = request.TestIdToRun.ToString()
                    });
                }
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
            // Potentially return cached results if the process finished but metrics weren't retrieved yet
            return Ok(new { status = "completed" });
        }

        [HttpPost("stop-by-pid/{processId}")]
        public async Task<IActionResult> StopTestByProcessId(int processId)
        {
            if (_processIdToTestIdMap.TryGetValue(processId, out var runId) && _runningTests.TryGetValue(runId, out var process))
            {
                try
                {
                    _logger.LogInformation($"Attempting to stop K6 process with PID: {processId} (maps to runId: {runId})");
                    process.Kill(true); // Kill entire process tree
                    _runningTests.Remove(runId); // Ana map'ten kaldır
                    _processIdToTestIdMap.Remove(processId); // PID map'inden kaldır
                    _logger.LogInformation($"K6 process with PID {processId} stopped successfully.");

                    Guid testGuid = Guid.Parse(runId); 
                    await _k6TestService.UpdateK6TestStatusAsync(testGuid, "stopped"); // veya "cancelled"
                    
                    return Ok(new { Message = $"Test with PID {processId} stopped." });
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error stopping K6 process with PID {processId}: {ex.Message}");
                    return StatusCode(500, new { error = $"Error stopping test: {ex.Message}" });
                }
            }
            _logger.LogWarning($"Test with PID {processId} not found in running tests or mapping.");
            return NotFound(new { error = "Test not found or not running with the given Process ID." });
        }

        // Parses K6 JSON Lines output to extract summary metrics.
        private K6DetailedMetricsDto ParseK6JsonOutput(string jsonContent, double durationInSeconds = 0)
        {
            if (string.IsNullOrWhiteSpace(jsonContent))
            {
                _logger.LogError("K6 JSON output content is empty or null.");
                throw new ArgumentException("K6 JSON output content cannot be empty.");
            }

            _logger.LogInformation("Attempting to parse K6 JSON Lines output using robust method.");
            var metricsDto = new K6DetailedMetricsDto();
            var lines = jsonContent.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            // Dictionary to store metrics data based on metric name
            var metricPointsData = new Dictionary<string, List<double>>();
            var metricTimestamps = new Dictionary<string, List<DateTime>>();

            _logger.LogDebug($"Processing {lines.Length} lines from K6 JSON output.");

            foreach (var line in lines)
            {
                try
                {
                    using var jsonDoc = JsonDocument.Parse(line);
                    var root = jsonDoc.RootElement;

                    // Check for Point type metrics (new format)
                    if (root.TryGetProperty("type", out var typeElement) &&
                        typeElement.GetString() == "Point" &&
                        root.TryGetProperty("metric", out var metricNameElement) &&
                        root.TryGetProperty("data", out var dataElement))
                    {
                        var metricName = metricNameElement.GetString();
                        if (string.IsNullOrEmpty(metricName))
                            continue;

                        // Get the value and timestamp
                        if (dataElement.TryGetProperty("value", out var valueElement) &&
                            valueElement.ValueKind == JsonValueKind.Number &&
                            dataElement.TryGetProperty("time", out var timeElement) &&
                            timeElement.ValueKind == JsonValueKind.String)
                        {
                            double value = valueElement.GetDouble();
                            DateTime timestamp;

                            if (DateTime.TryParse(timeElement.GetString(), out timestamp))
                            {
                                // Store the value for this metric
                                if (!metricPointsData.ContainsKey(metricName))
                                {
                                    metricPointsData[metricName] = new List<double>();
                                    metricTimestamps[metricName] = new List<DateTime>();
                                }

                                metricPointsData[metricName].Add(value);
                                metricTimestamps[metricName].Add(timestamp);

                                _logger.LogTrace($"Found point metric: {metricName}, value: {value}, time: {timestamp}");
                            }
                        }
                    }
                    // Also try to handle the original Metric type format
                    else if (root.TryGetProperty("type", out typeElement) &&
                             typeElement.GetString() == "Metric" &&
                             root.TryGetProperty("metric", out metricNameElement) &&
                             root.TryGetProperty("data", out var metricDataElement) &&
                             metricDataElement.TryGetProperty("values", out var valuesElement) &&
                             valuesElement.ValueKind == JsonValueKind.Object)
                    {
                        // Original Metric format handling logic kept for backward compatibility
                        var metricName = metricNameElement.GetString();
                        if (!string.IsNullOrEmpty(metricName))
                        {
                            _logger.LogTrace($"Found metric definition with values for: {metricName}");

                            // Extract any numeric values from the values object and add them to points
                            foreach (var property in valuesElement.EnumerateObject())
                            {
                                if (property.Value.ValueKind == JsonValueKind.Number)
                                {
                                    if (!metricPointsData.ContainsKey(metricName))
                                    {
                                        metricPointsData[metricName] = new List<double>();
                                        metricTimestamps[metricName] = new List<DateTime>();
                                    }
                                    metricPointsData[metricName].Add(property.Value.GetDouble());
                                    metricTimestamps[metricName].Add(DateTime.UtcNow); // No timestamp in this format
                                }
                            }
                        }
                    }

                    if (root.TryGetProperty("metric", out var metricNameElementStatus))
                    {
                        var metricName = metricNameElementStatus.GetString();
                        if (metricName != null && metricName.StartsWith("status_"))
                        {
                            if (root.TryGetProperty("data", out var dataElementStatus) &&
                                dataElementStatus.TryGetProperty("value", out var valueElementStatus))
                            {
                                var statusValue = valueElementStatus.GetDouble();
                                switch (metricName)
                                {
                                    case "status_200": metricsDto.StatusCodes.Status200 += (int)statusValue; break;
                                    case "status_201": metricsDto.StatusCodes.Status201 += (int)statusValue; break;
                                    case "status_204": metricsDto.StatusCodes.Status204 += (int)statusValue; break;
                                    case "status_400": metricsDto.StatusCodes.Status400 += (int)statusValue; break;
                                    case "status_401": metricsDto.StatusCodes.Status401 += (int)statusValue; break;
                                    case "status_403": metricsDto.StatusCodes.Status403 += (int)statusValue; break;
                                    case "status_404": metricsDto.StatusCodes.Status404 += (int)statusValue; break;
                                    case "status_415": metricsDto.StatusCodes.Status415 += (int)statusValue; break;
                                    case "status_500": metricsDto.StatusCodes.Status500 += (int)statusValue; break;
                                    case "status_other": metricsDto.StatusCodes.Other += (int)statusValue; break;
                                }
                            }
                        }
                    }
                }
                catch (JsonException jsonEx)
                {
                    _logger.LogWarning($"Skipping line due to JSON parsing error: {jsonEx.Message}. Line: {line.Substring(0, Math.Min(line.Length, 100))}");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Skipping line due to unexpected error: {ex.Message}. Line: {line.Substring(0, Math.Min(line.Length, 100))}");
                }
            }

            // After processing all lines, create summary metrics from the collected point data
            _logger.LogInformation($"Finished processing lines. Found data for {metricPointsData.Count} metrics.");

            if (metricPointsData.Count > 0)
            {                // Helper function to create a MetricData object from collected points
                MetricData? CreateMetricDataFromPoints(string metricName, List<double> values)
                {
                    if (values == null || values.Count == 0)
                        return null;

                    var metricData = new MetricData
                    {
                        // For count, use the sum of values for counters, or last value for gauges
                        Count = IsCounterMetric(metricName) ? values.Sum() : values.Last(),

                        // For rate, use the average or last value depending on the metric type
                        // Multiply rate metrics by 100 to convert from 0-1 range to percentage (0-100)
                        Rate = IsRateMetric(metricName) ? values.Average() * 100 : values.Last()
                    };

                    // Create trend statistics if we have multiple data points
                    // Always create trend stats for duration metrics
                    if (values.Count > 1 || IsDurationMetric(metricName))
                    {
                        metricData.Trend = new TrendStats
                        {
                            Avg = values.Average(),
                            Min = values.Min(),
                            Max = values.Max(),
                            Med = CalculateMedian(values),
                            P90 = CalculatePercentile(values, 90),
                            P95 = CalculatePercentile(values, 95)
                        };
                    }

                    return metricData;
                }                // Populate metrics from the collected data
                if (metricPointsData.ContainsKey("checks"))
                    metricsDto.Checks = CreateMetricDataFromPoints("checks", metricPointsData["checks"]);

                if (metricPointsData.ContainsKey("data_received"))
                    metricsDto.Data = CreateMetricDataFromPoints("data_received", metricPointsData["data_received"]);
                
                if (metricPointsData.ContainsKey("data_sent"))
                    metricsDto.Data_Sent = CreateMetricDataFromPoints("data_sent", metricPointsData["data_sent"]);

                if (metricPointsData.ContainsKey("http_reqs"))
                {
                    // Create the HTTP requests metric
                    var httpReqsMetric = CreateMetricDataFromPoints("http_reqs", metricPointsData["http_reqs"]);

                    // Calculate requests per second based on actual test duration
                    if (httpReqsMetric != null && durationInSeconds > 0)
                    {
                        // Override the rate with count / duration to get requests per second
                        httpReqsMetric.Rate = httpReqsMetric.Count / durationInSeconds;

                    }

                    metricsDto.Http_Reqs = httpReqsMetric;
                }
                if (metricPointsData.ContainsKey("http_req_failed"))
                    metricsDto.Http_Req_Failed = CreateMetricDataFromPoints("http_req_failed", metricPointsData["http_req_failed"]);

                // Calculate success_rate if http_req_failed exists (success_rate = 100 - failure_rate)
                if (metricPointsData.ContainsKey("http_req_failed") && !metricPointsData.ContainsKey("success_rate"))
                {
                    // Create success_rate data points (100 - failure_rate for each point)
                    var failurePoints = metricPointsData["http_req_failed"];
                    var successRatePoints = failurePoints.Select(failureRate => 1 - failureRate).ToList();

                    // Store the success rate points
                    metricPointsData["success_rate"] = successRatePoints;
                    metricTimestamps["success_rate"] = new List<DateTime>(metricTimestamps["http_req_failed"]);

                    // Create the metric data for success rate
                    metricsDto.Success_Rate = CreateMetricDataFromPoints("success_rate", successRatePoints);
                    _logger.LogInformation($"Created success_rate metric from http_req_failed: {successRatePoints.Average() * 100:F2}%");
                }
                else if (metricPointsData.ContainsKey("success_rate"))
                {
                    metricsDto.Success_Rate = CreateMetricDataFromPoints("success_rate", metricPointsData["success_rate"]);
                }

                // Calculate success_rate if http_req_failed exists (success_rate = 100 - failure_rate)
                if (metricPointsData.ContainsKey("http_req_failed") && !metricPointsData.ContainsKey("success_rate"))
                {
                    // Create success_rate data points (100 - failure_rate for each point)
                    var successRatePoints = metricPointsData["http_req_failed"].Select(failureRate => 100 - (failureRate * 100)).ToList();
                    metricPointsData["success_rate"] = successRatePoints;
                    metricTimestamps["success_rate"] = new List<DateTime>(metricTimestamps["http_req_failed"]);
                    metricsDto.Success_Rate = CreateMetricDataFromPoints("success_rate", successRatePoints);
                    _logger.LogInformation($"Created success_rate metric from http_req_failed: {successRatePoints.Average():F2}%");
                }
                else if (metricPointsData.ContainsKey("success_rate"))
                {
                    metricsDto.Success_Rate = CreateMetricDataFromPoints("success_rate", metricPointsData["success_rate"]);
                }
                if (metricPointsData.ContainsKey("iterations"))
                    metricsDto.Iterations = CreateMetricDataFromPoints("iterations", metricPointsData["iterations"]);

                // Handle iteration_duration correctly by updating the Iterations property with duration trend data
                if (metricPointsData.ContainsKey("iteration_duration"))
                {
                    _logger.LogInformation($"Found iteration_duration metric with {metricPointsData["iteration_duration"].Count} data points. Values: {string.Join(", ", metricPointsData["iteration_duration"].Take(5))}");

                    // If we have iterations property already, update its trend with duration data
                    if (metricsDto.Iterations != null)
                    {
                        var values = metricPointsData["iteration_duration"];
                        if (values.Count > 0)
                        {
                            // Make sure we have a Trend object
                            if (metricsDto.Iterations.Trend == null)
                            {
                                metricsDto.Iterations.Trend = new TrendStats();
                            }                            // Update the trend with the actual duration values (convert from ms to seconds)
                            metricsDto.Iterations.Trend.Avg = values.Average() / 1000;
                            metricsDto.Iterations.Trend.Min = values.Min() / 1000;
                            metricsDto.Iterations.Trend.Max = values.Max() / 1000;
                            metricsDto.Iterations.Trend.Med = CalculateMedian(values) / 1000;
                            metricsDto.Iterations.Trend.P90 = CalculatePercentile(values, 90) / 1000;
                            metricsDto.Iterations.Trend.P95 = CalculatePercentile(values, 95) / 1000;

                            _logger.LogInformation($"Updated Iterations trend with duration data: Avg={metricsDto.Iterations.Trend.Avg}s, Min={metricsDto.Iterations.Trend.Min}s, Max={metricsDto.Iterations.Trend.Max}s");
                        }
                    }
                    // If no iterations property yet, create one from the duration data
                    else
                    {
                        _logger.LogInformation("Creating Iterations metric from iteration_duration data");
                        metricsDto.Iterations = CreateMetricDataFromPoints("iteration_duration", metricPointsData["iteration_duration"]);
                    }
                }

                if (metricPointsData.ContainsKey("vus"))
                    metricsDto.Vus = CreateMetricDataFromPoints("vus", metricPointsData["vus"]);

                if (metricPointsData.ContainsKey("vus_max"))
                    metricsDto.Vus_Max = CreateMetricDataFromPoints("vus_max", metricPointsData["vus_max"]);                // Add HTTP duration metrics which are critical for response time reporting
                if (metricPointsData.ContainsKey("http_req_duration"))
                    metricsDto.Http_Req_Duration = CreateMetricDataFromPoints("http_req_duration", metricPointsData["http_req_duration"]);

                if (metricPointsData.ContainsKey("http_req_blocked"))
                    metricsDto.Http_Req_Blocked = CreateMetricDataFromPoints("http_req_blocked", metricPointsData["http_req_blocked"]);

                if (metricPointsData.ContainsKey("http_req_connecting"))
                    metricsDto.Http_Req_Connecting = CreateMetricDataFromPoints("http_req_connecting", metricPointsData["http_req_connecting"]);

                if (metricPointsData.ContainsKey("http_req_tls_handshaking"))
                    metricsDto.Http_Req_Tls_Handshaking = CreateMetricDataFromPoints("http_req_tls_handshaking", metricPointsData["http_req_tls_handshaking"]);

                if (metricPointsData.ContainsKey("http_req_sending"))
                    metricsDto.Http_Req_Sending = CreateMetricDataFromPoints("http_req_sending", metricPointsData["http_req_sending"]);

                if (metricPointsData.ContainsKey("http_req_waiting"))
                    metricsDto.Http_Req_Waiting = CreateMetricDataFromPoints("http_req_waiting", metricPointsData["http_req_waiting"]);
                if (metricPointsData.ContainsKey("http_req_receiving"))
                    metricsDto.Http_Req_Receiving = CreateMetricDataFromPoints("http_req_receiving", metricPointsData["http_req_receiving"]);

                // Check if we actually managed to extract *any* meaningful metric data
                if (metricsDto.Http_Reqs != null || metricsDto.Iterations != null || metricsDto.Vus != null || metricsDto.Data != null)
                {
                    _logger.LogInformation("Successfully parsed metrics from point data.");
                    return metricsDto;
                }
                else
                {
                    _logger.LogError("Parsing failed: No meaningful metrics could be extracted from the point data.");
                    // Fall through to throw exception
                }
            }
            else
            {
                _logger.LogError("Parsing failed: No valid metric data found in the output.");
                // Fall through to throw exception
            }

            // If parsing failed
            throw new JsonException("Could not parse summary metrics from K6 JSON output. No suitable metric data found.");
        }        // Helper methods for the new Point-based metric calculation
        private bool IsCounterMetric(string metricName)
        {
            // Metrics that are typically counters (values should be summed)
            return metricName == "http_reqs" || metricName == "iterations" ||
                   metricName == "data_received" || metricName == "data_sent" ||
                   metricName == "checks";
        }
        private bool IsRateMetric(string metricName)
        {
            // Metrics that are typically represented as rates (should be averaged)
            // Include success_rate and checks to convert to percentage (0-100) 
            return metricName == "http_req_failed" || metricName == "success_rate" || metricName == "checks";
        }
        private bool IsDurationMetric(string metricName)
        {
            // Metrics that represent durations and should have trend stats
            return metricName.StartsWith("http_req_") ||
                   metricName == "iteration_duration" ||
                   metricName == "group_duration";
        }

        private double CalculateMedian(List<double> values)
        {
            var sortedValues = values.OrderBy(v => v).ToList();
            int count = sortedValues.Count;

            if (count == 0)
                return 0;

            if (count % 2 == 0)
                return (sortedValues[count / 2 - 1] + sortedValues[count / 2]) / 2;
            else
                return sortedValues[count / 2];
        }

        private double CalculatePercentile(List<double> values, int percentile)
        {
            if (values.Count == 0)
                return 0;

            var sortedValues = values.OrderBy(v => v).ToList();
            int count = sortedValues.Count;

            double rank = percentile / 100.0 * (count - 1);
            int lowerIndex = (int)Math.Floor(rank);
            int upperIndex = (int)Math.Ceiling(rank);

            if (lowerIndex == upperIndex)
                return sortedValues[lowerIndex];

            double weight = rank - lowerIndex;
            return sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight;
        }


        // Helper function to parse the 'values' element of a metric.
        private MetricData? ParseValuesElement(JsonElement valuesElement, string metricNameForLogging)
        {
            try
            {
                var metricData = new MetricData();

                // Extract rate and count
                metricData.Rate = valuesElement.TryGetProperty("rate", out var rateElement) && rateElement.ValueKind == JsonValueKind.Number
                                  ? rateElement.GetDouble() : 0;

                metricData.Count = valuesElement.TryGetProperty("count", out var countElement) && countElement.ValueKind == JsonValueKind.Number
                                   ? countElement.GetDouble()
                                   : (valuesElement.TryGetProperty("value", out var valueElement) && valueElement.ValueKind == JsonValueKind.Number ? valueElement.GetDouble() : 0); // Handle gauges like 'vus'

                // Extract trend stats only if trend properties exist
                if (valuesElement.TryGetProperty("avg", out _) || valuesElement.TryGetProperty("min", out _) || valuesElement.TryGetProperty("med", out _) ||
                    valuesElement.TryGetProperty("max", out _) || valuesElement.TryGetProperty("p(90)", out _) || valuesElement.TryGetProperty("p(95)", out _))
                {
                    metricData.Trend = new TrendStats
                    {
                        Avg = valuesElement.TryGetProperty("avg", out var avg) && avg.ValueKind == JsonValueKind.Number ? avg.GetDouble() : 0,
                        Min = valuesElement.TryGetProperty("min", out var min) && min.ValueKind == JsonValueKind.Number ? min.GetDouble() : 0,
                        Med = valuesElement.TryGetProperty("med", out var med) && med.ValueKind == JsonValueKind.Number ? med.GetDouble() : 0,
                        Max = valuesElement.TryGetProperty("max", out var max) && max.ValueKind == JsonValueKind.Number ? max.GetDouble() : 0,
                        P90 = valuesElement.TryGetProperty("p(90)", out var p90) && p90.ValueKind == JsonValueKind.Number ? p90.GetDouble() : 0,
                        P95 = valuesElement.TryGetProperty("p(95)", out var p95) && p95.ValueKind == JsonValueKind.Number ? p95.GetDouble() : 0
                    };
                }
                else
                {
                    metricData.Trend = null;
                }

                _logger.LogTrace($"Parsed values for metric '{metricNameForLogging}'. Count: {metricData.Count}, Rate: {metricData.Rate}, HasTrend: {metricData.Trend != null}");
                return metricData;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error parsing values element for metric '{metricNameForLogging}': {ex.Message}");
                return null; // Return null if parsing fails for this specific metric's values
            }
        }


        // Extracts metric data from the main metrics container (e.g., from State Point). 
        // This method might become less relevant if the primary approach focuses on latest Metric definitions.
        // Kept for potential future use or if State Point parsing is re-enabled as primary.
        private MetricData? ExtractMetricDataFromJson(JsonElement metricsContainer, string metricName)
        {
            _logger.LogDebug($"Extracting metric '{metricName}' from metrics container.");
            if (!metricsContainer.TryGetProperty(metricName, out var metricElement))
            {
                _logger.LogWarning($"Metric '{metricName}' not found in K6 JSON summary metrics container.");
                return null;
            }

            // Expecting structure: { "metric_name": { "type": "...", "contains": "...", "values": {...} } }
            if (!metricElement.TryGetProperty("values", out var valuesElement) || valuesElement.ValueKind != JsonValueKind.Object)
            {
                _logger.LogWarning($"'values' object not found or not an object for metric '{metricName}' in summary container.");
                // Handle simple gauge value directly within the container if present (less likely for final summary)
                if (metricElement.TryGetProperty("value", out var valueElement) && valueElement.ValueKind == JsonValueKind.Number)
                {
                    _logger.LogDebug($"Found direct value for gauge metric '{metricName}'.");
                    return new MetricData { Count = valueElement.GetDouble() };
                }
                return null;
            }

            // Reuse the helper to parse the found 'values' element
            return ParseValuesElement(valuesElement, metricName);
        }

        private double TryParseK6DurationToSeconds(string durationStr)
        {
            if (string.IsNullOrWhiteSpace(durationStr)) return 0;
            durationStr = durationStr.Trim().ToLower();
            double value = 0;
            try
            {
                if (durationStr.EndsWith("s"))
                {
                    double.TryParse(durationStr.Substring(0, durationStr.Length - 1), out value);
                }
                else if (durationStr.EndsWith("m"))
                {
                    double.TryParse(durationStr.Substring(0, durationStr.Length - 1), out value);
                    value *= 60;
                }
                else if (durationStr.EndsWith("h"))
                {
                    double.TryParse(durationStr.Substring(0, durationStr.Length - 1), out value);
                    value *= 3600;
                }
                else // Birimsizse saniye varsay
                {
                    double.TryParse(durationStr, out value);
                }
            }
            catch { /* ignore parsing errors, return 0 */ }
            return value;
        }

        // MetricData.Count double? olabilir, int'e çevirmek için helper.
        private static int ToInt(double? value) => value.HasValue ? Convert.ToInt32(value.Value) : 0;
    }
}
