using System.Security.Claims;
using WebTestUI.Backend.Data.Entities;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(ApplicationUser user);
        bool ValidateToken(string token, out ClaimsPrincipal claimsPrincipal);
    }
}
