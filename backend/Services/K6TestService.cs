using Microsoft.EntityFrameworkCore;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Data.Entities;
using System.Text.Json;

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
                    : new Dictionary<string, string>();

               

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
                 Console.WriteLine($"Deserialized headers: {JsonSerializer.Serialize(headers)}");
                var script = $@"
import http from 'k6/http';
import {{ check, sleep }} from 'k6';
import {{ Counter, Rate }} from 'k6/metrics';

// Custom metrics
const successRate = new Rate('success_rate');
const failureRate = new Rate('failure_rate');
const requestDuration = new Counter('request_duration');

export const options = {{
    vus: {generateDto.Options.Vus},
    duration: '{generateDto.Options.Duration}',
    thresholds: {{
        'success_rate': ['rate>0.95'],
        'http_req_duration': ['p(95)<500']
    }}
}};

export default function() {{
    const params = {{
        headers: {JsonSerializer.Serialize(headers)}
    }};

    {(generateDto.RequestData.Method != "GET" ? $"const payload = {JsonSerializer.Serialize(generateDto.RequestData.Body)}" : "")}
    
    const startTime = new Date().getTime();
    const response = http.{generateDto.RequestData.Method.ToLower()}('{generateDto.RequestData.Url}', 
        {(generateDto.RequestData.Method != "GET" ? "payload, " : "")}params);
    const endTime = new Date().getTime();

    // Record metrics
    requestDuration.add(endTime - startTime);
    
    // Check response
    const success = check(response, {{
        'status is 2xx': (r) => r.status >= 200 && r.status < 300,
        'response time < 500ms': (r) => r.timings.duration < 500
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
                throw new KeyNotFoundException($"K6Test with ID {testId} not found");

            try
            {
                test.Status = "running";
                test.Logs = test.Logs ?? new List<K6TestLog>();
                test.Logs.Add(new K6TestLog
                {
                    Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    Message = "Starting K6 test execution",
                    Level = "info"
                });

                await _context.SaveChangesAsync();
                return MapToDTO(test);
            }
            catch (Exception ex)
            {
                test.Status = "failed";
                test.Logs.Add(new K6TestLog
                {
                    Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    Message = "Test execution failed",
                    Level = "error",
                    Data = ex.Message
                });

                await _context.SaveChangesAsync();
                throw;
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
                CreatedAt = test.CreatedAt,
                UpdatedAt = test.UpdatedAt
            };
        }
    }
} 