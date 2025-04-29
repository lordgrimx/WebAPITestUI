using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(
            IUserService userService,
            ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var userProfile = await _userService.GetUserProfileAsync(userId);
                if (userProfile == null)
                {
                    return NotFound(new { message = "Kullanıcı bulunamadı." });
                }

                return Ok(userProfile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Mevcut kullanıcı bilgileri alınırken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var updatedProfile = await _userService.UpdateUserProfileAsync(userId, model);
                if (updatedProfile == null)
                {
                    return BadRequest(new { message = "Profil güncellenemedi." });
                }

                return Ok(updatedProfile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı profili güncellenirken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var result = await _userService.ChangePasswordAsync(userId, model);
                if (!result)
                {
                    return BadRequest(new { message = "Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin." });
                }

                return Ok(new { message = "Şifre başarıyla değiştirildi." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Şifre değiştirilirken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpPost("toggle-2fa")]
        public async Task<IActionResult> ToggleTwoFactor([FromBody] bool enable)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var result = await _userService.ToggleTwoFactorAsync(userId, enable);
                if (!result)
                {
                    return BadRequest(new { message = "İki faktörlü doğrulama ayarları güncellenemedi." });
                }

                return Ok(new
                {
                    message = enable
                        ? "İki faktörlü doğrulama başarıyla etkinleştirildi."
                        : "İki faktörlü doğrulama devre dışı bırakıldı."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İki faktörlü doğrulama ayarları güncellenirken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpPost("upload-profile-image")]
        // Updated to accept Base64 string from request body
        public async Task<IActionResult> UploadProfileImage([FromBody] UploadImageDto dto)
        {
            _logger.LogInformation("UploadProfileImage endpoint called (Base64).");

            // Check if the model state is valid (includes checking [Required] on ImageBase64)
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("UploadProfileImage: Invalid model state.");
                return BadRequest(ModelState);
            }

            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("UploadProfileImage: User session not found.");
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                _logger.LogInformation("Attempting to upload profile image for user {UserId}", userId);

                // Call the updated service method with the Base64 string
                var uploadedImageBase64 = await _userService.UploadProfileImageAsync(userId, dto.ImageBase64);

                if (string.IsNullOrEmpty(uploadedImageBase64))
                {
                    _logger.LogWarning("UploadProfileImage: Service returned null or empty for user {UserId}", userId);
                    return BadRequest(new { message = "Profil resmi yüklenemedi." });
                }

                 _logger.LogInformation("Successfully uploaded profile image for user {UserId}", userId);
                // Return the updated Base64 string or just a success message
                return Ok(new
                {
                    message = "Profil resmi başarıyla yüklendi.",
                    imageBase64 = uploadedImageBase64 // Return the saved Base64 string
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Profil resmi yüklenirken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }
    }
}
