using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _dbContext;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthService> _logger;

        // 2FA kod geçerlilik süresi (5 dakika)
        private const int CODE_EXPIRY_MINUTES = 5;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext dbContext,
            IJwtService jwtService,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _dbContext = dbContext;
            _jwtService = jwtService;
            _logger = logger;
        }

        public async Task<AuthResultDto> RegisterAsync(RegisterDto model)
        {
            // Aynı e-posta ile kullanıcı var mı kontrol et
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var."
                };
            }

            // Yeni kullanıcı oluştur
            var newUser = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                Name = model.Name,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(newUser, model.Password);
            if (!result.Succeeded)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Kullanıcı kaydı başarısız: " + string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }

            // Default rol ata
            await _userManager.AddToRoleAsync(newUser, "User");

            // Kullanıcı kayıt işlemi başarılı, token oluştur
            return new AuthResultDto
            {
                Success = true,
                Message = "Kullanıcı başarıyla oluşturuldu.",
                UserId = newUser.Id,
                Token = _jwtService.GenerateToken(newUser),
                User = MapToUserDto(newUser)
            };
        }

        public async Task<AuthResultDto> LoginAsync(LoginDto model)
        {
            // Kullanıcıyı bul
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Geçersiz e-posta veya şifre."
                };
            }

            // Şifreyi doğrula
            var isPasswordValid = await _userManager.CheckPasswordAsync(user, model.Password);
            if (!isPasswordValid)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Geçersiz e-posta veya şifre."
                };
            }

            // 2FA etkinleştirilmiş mi kontrol et
            if (user.TwoFactorEnabled)
            {
                // 2FA kodu oluştur
                await GenerateTwoFactorCodeAsync(user.Id);

                return new AuthResultDto
                {
                    Success = true,
                    TwoFactorRequired = true,
                    UserId = user.Id,
                    Message = "İki faktörlü doğrulama kodu gönderildi."
                };
            }

            // 2FA etkin değilse normal giriş işlemi
            // Son giriş tarihini güncelle
            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            return new AuthResultDto
            {
                Success = true,
                Message = "Giriş başarılı.",
                Token = _jwtService.GenerateToken(user),
                UserId = user.Id,
                User = MapToUserDto(user)
            };
        }

        public async Task<AuthResultDto> VerifyTwoFactorAsync(TwoFactorVerifyDto model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Kullanıcı bulunamadı."
                };
            }

            // 2FA kodunun varlığını ve geçerliliğini kontrol et
            if (string.IsNullOrEmpty(user.TwoFactorCode) ||
                !user.TwoFactorCodeExpiry.HasValue ||
                user.TwoFactorCode != model.Code ||
                DateTime.UtcNow > user.TwoFactorCodeExpiry.Value)
            {
                // Geçersiz veya süresi dolmuş kod
                user.TwoFactorCode = null;
                user.TwoFactorCodeExpiry = null;
                await _userManager.UpdateAsync(user);

                return new AuthResultDto
                {
                    Success = false,
                    Message = "Geçersiz veya süresi dolmuş doğrulama kodu."
                };
            }

            // Kod doğru, girişi tamamla
            user.TwoFactorCode = null;
            user.TwoFactorCodeExpiry = null;
            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            return new AuthResultDto
            {
                Success = true,
                Message = "Giriş başarılı.",
                Token = _jwtService.GenerateToken(user),
                UserId = user.Id,
                User = MapToUserDto(user)
            };
        }

        public async Task<bool> GenerateTwoFactorCodeAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            // 6 haneli rastgele kod oluştur
            var random = new Random();
            var code = random.Next(100000, 999999).ToString();

            // Kodu ve son kullanma tarihini kaydet
            user.TwoFactorCode = code;
            user.TwoFactorCodeExpiry = DateTime.UtcNow.AddMinutes(CODE_EXPIRY_MINUTES);
            await _userManager.UpdateAsync(user);

            // Gerçek bir uygulamada, burada e-posta veya SMS ile kod gönderimi yapılır
            // Şimdilik sadece logluyoruz
            _logger.LogInformation($"SIMULATED: 2FA Code for user {userId}: {code}");

            return true;
        }

        // Helper metot: ApplicationUser'ı UserDto'ya dönüştürür
        private UserDto MapToUserDto(ApplicationUser user)
        {
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = _userManager.GetRolesAsync(user).Result.FirstOrDefault() ?? "User",
                ProfileImage = user.ProfileImage,
                Phone = user.Phone,
                Address = user.Address,
                Website = user.Website,
                TwoFactorEnabled = user.TwoFactorEnabled
            };
        }
    }
}
