using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IFileStorageService _fileStorageService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserService> _logger;

        public UserService(
            UserManager<ApplicationUser> userManager,
            IFileStorageService fileStorageService,
            IConfiguration configuration,
            ILogger<UserService> logger)
        {
            _userManager = userManager;
            _fileStorageService = fileStorageService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<UserDto> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            return await MapToUserDtoAsync(user);
        }

        public async Task<UserDto> UpdateUserProfileAsync(string userId, UpdateProfileDto model)
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

            if (model.Phone != null)
            {
                user.Phone = model.Phone;
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

        public async Task<string> UploadProfileImageAsync(string userId, IFormFile image)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            try
            {
                // Dosya uzantısını ve boyutunu kontrol et
                var maxFileSize = _configuration.GetValue<int>("FileStorage:MaxFileSizeBytes", 2 * 1024 * 1024); // Varsayılan 2MB
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };

                var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    _logger.LogWarning("Geçersiz dosya uzantısı: {Extension}", extension);
                    return null;
                }

                if (image.Length > maxFileSize)
                {
                    _logger.LogWarning("Dosya boyutu çok büyük: {Size} bytes", image.Length);
                    return null;
                }

                // Eski profil resmini temizle
                if (!string.IsNullOrEmpty(user.ProfileImage))
                {
                    // Burada eski resmin silinmesi işlemi yapılabilir
                    // _fileStorageService.DeleteFile(user.ProfileImage);
                }

                // Profil resmini yükle
                var fileName = $"profile_{userId}{extension}";
                var filePath = await _fileStorageService.SaveFileAsync(image, fileName, "profiles");

                if (string.IsNullOrEmpty(filePath))
                {
                    return null;
                }

                // Kullanıcı profilini güncelle
                user.ProfileImage = filePath;
                await _userManager.UpdateAsync(user);

                return filePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Profil resmi yüklenirken bir hata oluştu");
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
                ProfileImage = user.ProfileImage,
                Phone = user.Phone,
                Address = user.Address,
                Website = user.Website,
                TwoFactorEnabled = user.TwoFactorEnabled
            };
        }
    }
}
