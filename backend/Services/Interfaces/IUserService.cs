using WebTestUI.Backend.DTOs; // Removed using Microsoft.AspNetCore.Http;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> GetUserProfileAsync(string userId);
        Task<UserDto> UpdateUserProfileAsync(string userId, UpdateProfileDto model);
        Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto model);
        Task<bool> ToggleTwoFactorAsync(string userId, bool enable);
        // Updated signature to accept Base64 string and return nullable string
        Task<string?> UploadProfileImageAsync(string userId, string imageBase64);
    }
}
