using Microsoft.EntityFrameworkCore;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Data.Entities;
using System.Text.Json;
using System.Text;

namespace WebTestUI.Backend.Services
{
    public class K6TestService : IK6TestService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<K6TestService> _logger;

        public K6TestService(ApplicationDbContext context, ILogger<K6TestService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<K6TestDTO>> GetAllK6TestsAsync()
        {
            var tests = await _context.K6Tests
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return tests.Select(MapToDTO).ToList();
        }

        public async Task<List<K6TestDTO>> GetK6TestsByRequestAsync(int requestId)
        {
            var tests = await _context.K6Tests
                .Where(t => t.RequestId == requestId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return tests.Select(MapToDTO).ToList();
        }

        public async Task<K6TestDTO> CreateK6TestAsync(CreateK6TestDTO createDto)
        {
            var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var test = new K6Test
            {
                Id = Guid.NewGuid(),
                Name = createDto.Name,
                Description = createDto.Description,
                Script = createDto.Script,
                RequestId = createDto.RequestId,
                Status = "pending",
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.K6Tests.Add(test);
            await _context.SaveChangesAsync();

            return MapToDTO(test);
        }

        public async Task<K6TestDTO> UpdateK6TestResultsAsync(Guid id, UpdateK6TestResultsDTO updateDto)
        {
            var test = await _context.K6Tests.FindAsync(id);
            if (test == null)
                throw new KeyNotFoundException($"K6Test with ID {id} not found");

            test.Status = updateDto.Status;
            test.Results = updateDto.Results;
            test.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            await _context.SaveChangesAsync();
            return MapToDTO(test);
        }

        public async Task<bool> DeleteK6TestAsync(Guid id)
        {
            var test = await _context.K6Tests.FindAsync(id);
            if (test == null)
                return false;

            _context.K6Tests.Remove(test);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> GenerateK6ScriptAsync(GenerateK6ScriptDTO generateDto)
        {
            try
            {
                Console.WriteLine($"Received headers: {generateDto.RequestData.Headers}");
                var headers = !string.IsNullOrEmpty(generateDto.RequestData.Headers)
                    ? JsonSerializer.Deserialize<Dictionary<string, string>>(generateDto.RequestData.Headers)
                    ?? new Dictionary<string, string>()
                    : new Dictionary<string, string>();

                // Parse dynamic parameters
                var parameters = !string.IsNullOrEmpty(generateDto.RequestData.Parameters)
                    ? JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(generateDto.RequestData.Parameters)
                    : new Dictionary<string, JsonElement>();

                // Build parameter data array string for script
                var paramDataArrays = BuildParameterDataArrays(parameters ?? new Dictionary<string, JsonElement>());

                // Add auth headers if needed
                if (!string.IsNullOrEmpty(generateDto.RequestData.AuthToken) && !string.IsNullOrEmpty(generateDto.RequestData.AuthType))
                {
                    switch (generateDto.RequestData.AuthType.ToLower())
                    {
                        case "bearer":
                            headers["Authorization"] = $"Bearer {generateDto.RequestData.AuthToken}";
                            break;
                        case "basic":
                            headers["Authorization"] = $"Basic {generateDto.RequestData.AuthToken}";
                            break;
                    }
                }

                var script = $@"
import http from 'k6/http';
import {{ check, sleep }} from 'k6';
import {{ Counter, Rate }} from 'k6/metrics';
import {{ SharedArray }} from 'k6/data';

// Define parameters data
{paramDataArrays}

// Function to get random item from array
function getRandomItem(arr) {{
    return arr[Math.floor(Math.random() * arr.length)];
}}

// Function to replace parameters in URL and body
function replaceParameters(str, paramValues) {{
    return str.replace(/\{{([^}}]+)\}}/g, (match, param) => {{
        return paramValues[param] || match;
    }});
}}

// Custom metrics
const successRate = new Rate('success_rate');
const failureRate = new Rate('failure_rate');
const requestDuration = new Counter('request_duration');

// Status code counters
const status200 = new Counter('status_200');
const status201 = new Counter('status_201');
const status204 = new Counter('status_204');
const status400 = new Counter('status_400');
const status401 = new Counter('status_401');
const status403 = new Counter('status_403');
const status404 = new Counter('status_404');
const status415 = new Counter('status_415');
const status500 = new Counter('status_500');
const statusOther = new Counter('status_other');

export const options = {{
    vus: {generateDto.Options.Vus},
    duration: '{generateDto.Options.Duration}',
    thresholds: {{
        'success_rate': ['rate>0.95'],
        'http_req_duration': ['p(95)<500']
    }}
}};

export default function() {{
    // Get random values for each parameter
    const paramValues = {{}}
    {BuildParameterRandomization(parameters ?? new Dictionary<string, JsonElement>())}

    // Replace parameters in URL and body
    const url = replaceParameters('{generateDto.RequestData.Url}', paramValues);
    {(generateDto.RequestData.Method != "GET" ? $"const body = replaceParameters({JsonSerializer.Serialize(generateDto.RequestData.Body)}, paramValues);" : "")}

    const params = {{
        headers: {JsonSerializer.Serialize(headers)}
    }};
    console.log(url);
    const startTime = new Date().getTime();
    const response = http.{generateDto.RequestData.Method.ToLower()}(url, 
        {(generateDto.RequestData.Method != "GET" ? "body, " : "")}params);
    const endTime = new Date().getTime();

    // Track status codes
    switch(response.status) {{
        case 200: status200.add(1); break;
        case 201: status201.add(1); break;
        case 204: status204.add(1); break;
        case 400: status400.add(1); break;
        case 401: status401.add(1); break;
        case 403: status403.add(1); break;
        case 404: status404.add(1); break;
        case 415: status415.add(1); break;
        case 500: status500.add(1); break;
        default: statusOther.add(1);
    }}

    // Record metrics
    requestDuration.add(endTime - startTime);
    
    // Check response
    const success = check(response, {{
        'status is 2xx': (r) => r.status >= 200 && r.status < 300,
        'response time < 600ms': (r) => r.timings.duration < 600
    }});

    successRate.add(success);
    failureRate.add(!success);

    sleep(1);
}}";

                return script;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating K6 script: {ex.Message}");
                throw;
            }
        }

        private string BuildParameterDataArrays(Dictionary<string, JsonElement> parameters)
        {
            var arrays = new StringBuilder();
            foreach (var param in parameters)
            {
                if (param.Value.ValueKind == JsonValueKind.Array)
                {
                    arrays.AppendLine($"const {param.Key}Data = {param.Value.GetRawText()};");
                }
            }
            return arrays.ToString();
        }

        private string BuildParameterRandomization(Dictionary<string, JsonElement> parameters)
        {
            var sb = new StringBuilder();
            foreach (var param in parameters)
            {
                if (param.Value.ValueKind == JsonValueKind.Array)
                {
                    sb.AppendLine($"    paramValues['{param.Key}'] = getRandomItem({param.Key}Data);");
                }
            }
            return sb.ToString();
        }

        public async Task<K6TestDTO> GenerateAndSaveK6ScriptAsync(string name, string? description, int? requestId, RequestData requestData, K6TestOptions options)
        {
            var script = await GenerateK6ScriptAsync(new GenerateK6ScriptDTO { RequestData = requestData, Options = options });
            _logger.LogInformation($"Options: {options.Duration}, {options.Vus}");
            var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var test = new K6Test
            {
                Id = Guid.NewGuid(),
                Name = name,
                Description = description,
                Script = script,
                AuthType = requestData.AuthType,
                AuthToken = requestData.AuthToken,
                Options = options,
                RequestId = requestId,
                Status = "created",
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.K6Tests.Add(test);
            await _context.SaveChangesAsync();

            return MapToDTO(test);
        }

        public async Task AddLogEntryAsync(Guid testId, AddLogEntryDTO logDto)
        {
            var test = await _context.K6Tests.FindAsync(testId);
            if (test == null)
                throw new KeyNotFoundException($"K6Test with ID {testId} not found");

            var logs = test.Logs ?? new List<K6TestLog>();
            logs.Add(new K6TestLog
            {
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                Message = logDto.Message,
                Level = logDto.Level,
                Data = logDto.Data,
                Error = logDto.Error
            });

            if (logDto.Level == "error")
            {
                test.Status = "failed";
                test.ErrorDetails = logDto.Error;
            }

            test.Logs = logs;
            test.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            await _context.SaveChangesAsync();
        }

        public async Task UpdateTestStatusAndLogsAsync(Guid id, UpdateTestStatusAndLogsDTO updateDto)
        {
            var test = await _context.K6Tests.FindAsync(id);
            if (test == null)
                throw new KeyNotFoundException($"K6Test with ID {id} not found");

            test.Status = updateDto.Status;
            test.Logs = updateDto.Logs;
            test.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            await _context.SaveChangesAsync();
        }

        public async Task<K6TestDTO> ExecuteK6TestAsync(Guid testId)
        {
            var test = await _context.K6Tests.FindAsync(testId);
            if (test == null)
            {
                throw new KeyNotFoundException($"Test with ID {testId} not found.");
            }

            // Burada testin çalıştırılmasıyla ilgili bir mantık varsa, o ayrıca ele alınmalı.
            // Bu metot daha çok script ve options döndürmek için kullanılıyor gibi duruyor.
            // Şimdilik sadece DTO'yu döndürüyoruz.
            return MapToDTO(test);
        }

        public async Task UpdateK6TestProcessIdAsync(Guid testId, int processId)
        {
            var test = await _context.K6Tests.FindAsync(testId);
            if (test != null)
            {
                test.ProcessId = processId;
                test.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                await _context.SaveChangesAsync();
            }
            else
            {
                _logger.LogWarning($"UpdateK6TestProcessIdAsync: K6Test with ID {testId} not found.");
            }
        }

        public async Task UpdateK6TestStatusAsync(Guid testId, string status)
        {
            var test = await _context.K6Tests.FindAsync(testId);
            if (test != null)
            {
                test.Status = status;
                test.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                await _context.SaveChangesAsync();
            }
            else
            {
                _logger.LogWarning($"UpdateK6TestStatusAsync: K6Test with ID {testId} not found.");
            }
        }

        private K6TestDTO MapToDTO(K6Test test)
        {
            return new K6TestDTO
            {
                Id = test.Id,
                Name = test.Name,
                Description = test.Description,
                Script = test.Script,
                AuthType = test.AuthType,
                AuthToken = test.AuthToken,
                Options = test.Options,
                Logs = test.Logs,
                ErrorDetails = test.ErrorDetails,
                RequestId = test.RequestId,
                Status = test.Status,
                Results = test.Results,
                ProcessId = test.ProcessId,
                CreatedAt = test.CreatedAt,
                UpdatedAt = test.UpdatedAt
            };
        }

        // Implementation for the new interface method
        public async Task AddTestLogAsync(Guid testId, string level, string message, object? details = null)
        {
            var test = await _context.K6Tests.FindAsync(testId);
            if (test == null)
            {
                _logger.LogWarning($"Cannot add log. K6Test with ID {testId} not found.");
                return; 
            }

            if (test.Logs == null)
            {
                test.Logs = new List<WebTestUI.Backend.Data.Entities.K6TestLog>(); // Ensure Logs list is initialized
            }

            var ownedLogEntry = new WebTestUI.Backend.Data.Entities.K6TestLog // Using the K6Test.cs defined K6TestLog
            {
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                Level = level,
                Message = message,
                Data = details != null ? JsonSerializer.Serialize(details, new JsonSerializerOptions { WriteIndented = false }) : null
                // Error property will be null unless explicitly set for error logs
            };

            test.Logs.Add(ownedLogEntry);
            test.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            _context.K6Tests.Update(test); // Mark the K6Test entity as modified
            await _context.SaveChangesAsync();
        }

        // Implementation for the new interface method
        public async Task<IEnumerable<K6TestLogDto>> GetTestLogsAsync(Guid testId)
        {
            var test = await _context.K6Tests.AsNoTracking().FirstOrDefaultAsync(t => t.Id == testId);
            if (test == null || test.Logs == null)
            {
                _logger.LogWarning($"K6Test with ID {testId} not found or has no logs.");
                return Enumerable.Empty<K6TestLogDto>();
            }

            return test.Logs.OrderBy(log => log.Timestamp) // Order by timestamp ascending
                           .Select(log => new K6TestLogDto
                           {
                               Id = Guid.NewGuid(), // Generating a new Guid for DTO as owned type doesn't have its own PK
                               K6TestId = testId, // Assign the parent testId
                               Timestamp = log.Timestamp,
                               Level = log.Level,
                               Message = log.Message,
                               Details = log.Data // K6Test.cs -> K6TestLog.Data is already a string?
                           }).ToList();
        }
    }
}