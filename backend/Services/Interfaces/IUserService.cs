using Microsoft.AspNetCore.Http;
using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> GetUserProfileAsync(string userId);
        Task<UserDto> UpdateUserProfileAsync(string userId, UpdateProfileDto model);
        Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto model);
        Task<bool> ToggleTwoFactorAsync(string userId, bool enable);
        Task<string> UploadProfileImageAsync(string userId, IFormFile image);
    }
}
