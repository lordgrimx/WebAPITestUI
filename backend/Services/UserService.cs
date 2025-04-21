using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace WebTestUI.Backend.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserService> _logger;

        public UserService(
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            ILogger<UserService> logger)
        {
            _userManager = userManager;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<UserDto?> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            return await MapToUserDtoAsync(user);
        }

        public async Task<UserDto?> UpdateUserProfileAsync(string userId, UpdateProfileDto model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            // Güncellenecek alanları kontrol et
            if (!string.IsNullOrEmpty(model.Name))
            {
                user.Name = model.Name;
            }

            // Use PhoneNumber instead of Phone (standard property from IdentityUser)
            if (model.Phone != null)
            {
                user.PhoneNumber = model.Phone;
            }

            if (model.Address != null)
            {
                user.Address = model.Address;
            }

            if (model.Website != null)
            {
                user.Website = model.Website;
            }

            if (model.TwoFactorEnabled.HasValue)
            {
                user.TwoFactorEnabled = model.TwoFactorEnabled.Value;

                // İki faktörlü doğrulama kapatılıyorsa, ilgili kodu temizle
                if (!model.TwoFactorEnabled.Value)
                {
                    user.TwoFactorCode = null;
                    user.TwoFactorCodeExpiry = null;
                }
            }

            // Update Language if provided
            if (model.Language != null)
            {
                user.Language = model.Language;
            }

            // Update other settings if provided in the DTO
            if (model.Timezone != null) user.Timezone = model.Timezone;
            if (model.DateFormat != null) user.DateFormat = model.DateFormat;
            if (model.AutoLogoutEnabled.HasValue) user.AutoLogoutEnabled = model.AutoLogoutEnabled.Value;
            if (model.SessionTimeoutMinutes.HasValue) user.SessionTimeoutMinutes = model.SessionTimeoutMinutes.Value;
            if (model.Theme != null) user.Theme = model.Theme;
            if (model.CompactViewEnabled.HasValue) user.CompactViewEnabled = model.CompactViewEnabled.Value;
            if (model.ShowSidebarEnabled.HasValue) user.ShowSidebarEnabled = model.ShowSidebarEnabled.Value;
            if (model.UsageAnalyticsEnabled.HasValue) user.UsageAnalyticsEnabled = model.UsageAnalyticsEnabled.Value;
            if (model.CrashReportsEnabled.HasValue) user.CrashReportsEnabled = model.CrashReportsEnabled.Value;
            if (model.MarketingEmailsEnabled.HasValue) user.MarketingEmailsEnabled = model.MarketingEmailsEnabled.Value;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                _logger.LogError("Kullanıcı güncellenirken hata oluştu: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
                return null;
            }

            return await MapToUserDtoAsync(user);
        }

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            // Mevcut şifreyi doğrula
            var isCurrentPasswordValid = await _userManager.CheckPasswordAsync(user, model.CurrentPassword);
            if (!isCurrentPasswordValid)
            {
                return false;
            }

            // Şifreyi değiştir
            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            return result.Succeeded;
        }

        public async Task<bool> ToggleTwoFactorAsync(string userId, bool enable)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            user.TwoFactorEnabled = enable;

            // İki faktörlü doğrulama kapatılıyorsa, ilgili kodu temizle
            if (!enable)
            {
                user.TwoFactorCode = null;
                user.TwoFactorCodeExpiry = null;
            }

            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        // Updated to accept Base64 string
        public async Task<string?> UploadProfileImageAsync(string userId, string imageBase64)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("UploadProfileImageAsync: User not found with ID {UserId}", userId);
                return null;
            }

            try
            {
                // Basic validation for Base64 string (optional but recommended)
                if (string.IsNullOrWhiteSpace(imageBase64) || !imageBase64.Contains(","))
                {
                    _logger.LogWarning("UploadProfileImageAsync: Invalid Base64 string format for user {UserId}", userId);
                    return null; // Or throw an exception
                }

                // Update user profile with Base64 string
                user.ProfileImageBase64 = imageBase64;

                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                {
                    _logger.LogError("UploadProfileImageAsync: Failed to update user {UserId}. Errors: {Errors}",
                        userId, string.Join(", ", result.Errors.Select(e => e.Description)));
                    return null;
                }

                _logger.LogInformation("UploadProfileImageAsync: Successfully updated profile image for user {UserId}", userId);
                return user.ProfileImageBase64;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UploadProfileImageAsync: Error uploading profile image for user {UserId}", userId);
                return null;
            }
        }

        // Helper metot: ApplicationUser'ı UserDto'ya dönüştürür
        private async Task<UserDto> MapToUserDtoAsync(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = roles.FirstOrDefault() ?? "User",
                ProfileImageBase64 = user.ProfileImageBase64,
                Phone = user.PhoneNumber, // Using PhoneNumber instead of Phone
                Address = user.Address,
                Website = user.Website,
                TwoFactorEnabled = user.TwoFactorEnabled,
                Language = user.Language,

                // Map other settings
                Timezone = user.Timezone,
                DateFormat = user.DateFormat,
                AutoLogoutEnabled = user.AutoLogoutEnabled,
                SessionTimeoutMinutes = user.SessionTimeoutMinutes,
                Theme = user.Theme,
                CompactViewEnabled = user.CompactViewEnabled,
                ShowSidebarEnabled = user.ShowSidebarEnabled,
                UsageAnalyticsEnabled = user.UsageAnalyticsEnabled,
                CrashReportsEnabled = user.CrashReportsEnabled,
                MarketingEmailsEnabled = user.MarketingEmailsEnabled
            };
        }
    }
}
