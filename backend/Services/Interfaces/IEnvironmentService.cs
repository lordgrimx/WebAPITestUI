using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IEnvironmentService
    {
        Task<IEnumerable<EnvironmentDto>> GetUserEnvironmentsAsync(string userId);
        Task<EnvironmentDto> GetActiveEnvironmentAsync(string userId);
        Task<EnvironmentDto> GetEnvironmentByIdAsync(int id, string userId);
        Task<EnvironmentDto> CreateEnvironmentAsync(CreateEnvironmentDto model, string userId);
        Task<EnvironmentDto> UpdateEnvironmentAsync(int id, UpdateEnvironmentDto model, string userId);
        Task<bool> DeleteEnvironmentAsync(int id, string userId);
        Task<bool> ActivateEnvironmentAsync(int id, string userId); // Bu satırı ekle
    }
}
