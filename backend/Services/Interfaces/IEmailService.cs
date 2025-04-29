using System.Threading.Tasks;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true);
        Task<bool> Send2FACodeAsync(string toEmail, string code);
    }
}
