using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface ISharedDataService
    {
        Task<string> SaveSharedDataAsync(SharedDataDto data, int? currentEnvironmentId);
        Task<SharedDataDto?> GetSharedDataAsync(string shareId);
        Task AssociateSharedDataWithUserAsync(string userId, SharedDataDto data); // New method
    }
}