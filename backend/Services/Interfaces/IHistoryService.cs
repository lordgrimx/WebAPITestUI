using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IHistoryService
    {
        Task<IEnumerable<HistoryDto>> GetUserHistoryAsync(string userId, string? currentEnvironmentId, int limit = 50);
        Task<IEnumerable<HistoryDto>> GetRequestHistoryAsync(int requestId, string userId, string? currentEnvironmentId);
        Task<HistoryDto?> GetHistoryByIdAsync(int id, string userId); // Return nullable DTO
        Task<HistoryDto> RecordHistoryAsync(RecordHistoryDto model, string userId);
        Task<bool> DeleteHistoryAsync(int id, string userId);
        Task<bool> ClearHistoryAsync(string userId);
        Task<int> ClearOldHistoryAsync(string userId, DateTime olderThan);
    }
}
