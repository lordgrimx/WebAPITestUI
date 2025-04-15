using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IHistoryService
    {
        Task<IEnumerable<HistoryDto>> GetUserHistoryAsync(string userId, int limit = 50);
        Task<HistoryDto> GetHistoryByIdAsync(int id, string userId);
        Task<HistoryDto> RecordHistoryAsync(RecordHistoryDto model, string userId);
        Task<bool> DeleteHistoryAsync(int id, string userId);
        Task<bool> ClearHistoryAsync(string userId);
    }
}
