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
    }
} 