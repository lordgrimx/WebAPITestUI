using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface ISharedDataService
    {
        Task<string> SaveSharedDataAsync(SharedDataDto data);
        Task<SharedDataDto?> GetSharedDataAsync(string shareId);
    }
}