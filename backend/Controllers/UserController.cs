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
        public async Task<IActionResult> UploadProfileImage(IFormFile image)
        {
            try
            {
                if (image == null || image.Length == 0)
                {
                    return BadRequest(new { message = "Lütfen bir resim dosyası seçin." });
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var filePath = await _userService.UploadProfileImageAsync(userId, image);
                if (string.IsNullOrEmpty(filePath))
                {
                    return BadRequest(new { message = "Profil resmi yüklenemedi." });
                }

                return Ok(new
                {
                    message = "Profil resmi başarıyla yüklendi.",
                    imageUrl = filePath
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
