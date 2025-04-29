using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity; // Add Identity namespace
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.Services.Interfaces;
using System.Threading.Tasks; // Add Task namespace

namespace WebTestUI.Backend.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager; // Add UserManager field

        public JwtService(IConfiguration configuration, UserManager<ApplicationUser> userManager) // Inject UserManager
        {
            _configuration = configuration;
            _userManager = userManager; // Assign UserManager
        }

        // Make async and rename to match interface
        public async Task<string> GenerateTokenAsync(ApplicationUser user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT:Key is not configured")));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Get roles using UserManager
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty), // Use UserName from IdentityUser
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                // Removed incorrect role claim
            };

            // Add role claims correctly
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JWT:DurationInMinutes"] ?? "60")),
                SigningCredentials = credentials,
                Issuer = _configuration["JWT:Issuer"],
                Audience = _configuration["JWT:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public bool ValidateToken(string token, out ClaimsPrincipal claimsPrincipal)
        {
            claimsPrincipal = null;

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT:Key is not configured"));

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = _configuration["JWT:Issuer"],
                    ValidAudience = _configuration["JWT:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };

                claimsPrincipal = tokenHandler.ValidateToken(token, validationParameters, out _);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
