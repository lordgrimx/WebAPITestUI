using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Data.Entities;

namespace WebTestUI.Backend.Services
{
    public interface IK6TestService
    {
        Task<List<K6TestDTO>> GetAllK6TestsAsync();
        Task<List<K6TestDTO>> GetK6TestsByRequestAsync(int requestId);
        Task<K6TestDTO> CreateK6TestAsync(CreateK6TestDTO createDto);
        Task<K6TestDTO> UpdateK6TestResultsAsync(Guid id, UpdateK6TestResultsDTO updateDto);
        Task<bool> DeleteK6TestAsync(Guid id);
        Task<string> GenerateK6ScriptAsync(GenerateK6ScriptDTO generateDto);
        Task<K6TestDTO> GenerateAndSaveK6ScriptAsync(string name, string? description, int? requestId, RequestData requestData, K6TestOptions options);
        Task AddLogEntryAsync(Guid testId, AddLogEntryDTO logDto);
        Task UpdateTestStatusAndLogsAsync(Guid id, UpdateTestStatusAndLogsDTO updateDto);
        Task<K6TestDTO> ExecuteK6TestAsync(Guid testId);
        Task UpdateK6TestProcessIdAsync(Guid testId, int processId);
        Task UpdateK6TestStatusAsync(Guid testId, string status);

        // Added for K6Controller logging needs
        Task AddTestLogAsync(Guid testId, string level, string message, object? details = null);
        Task<IEnumerable<K6TestLogDto>> GetTestLogsAsync(Guid testId);
    }
} 