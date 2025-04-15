using System.Security.Claims;
using System.Security.Claims;
using System.Threading.Tasks; // Add Task namespace
using WebTestUI.Backend.Data.Entities;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IJwtService
    {
        Task<string> GenerateTokenAsync(ApplicationUser user); // Make async
        bool ValidateToken(string token, out ClaimsPrincipal claimsPrincipal);
    }
}
