using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(ApplicationUser user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT:Key is not configured")));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Name ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Role, user.Roles?.FirstOrDefault() ?? "User")
            };

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
