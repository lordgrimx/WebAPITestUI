using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResultDto> RegisterAsync(RegisterDto model);
        Task<AuthResultDto> LoginAsync(LoginDto model);
        Task<AuthResultDto> VerifyTwoFactorAsync(TwoFactorVerifyDto model);
        Task<bool> GenerateTwoFactorCodeAsync(string userId);
    }
}
