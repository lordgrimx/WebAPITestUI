using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _senderEmail;
        private readonly string _senderName;
        private readonly string _password;
        private readonly bool _enableSsl;
        private readonly bool _useDefaultCredentials; public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;            // Önce .env.local dosyasından ayarları almayı deneyelim, yoksa appsettings.json'dan alalım
            _smtpServer = Environment.GetEnvironmentVariable("SMTP_SERVER") ??
                          _configuration["EmailSettings:SmtpServer"] ??
                          "smtp.gmail.com";

            // Port için null kontrolü ve varsayılan değer
            string smtpPortStr = Environment.GetEnvironmentVariable("SMTP_PORT") ??
                                _configuration["EmailSettings:SmtpPort"] ??
                                "587";
            _smtpPort = int.TryParse(smtpPortStr, out int port) ? port : 587;

            _senderEmail = Environment.GetEnvironmentVariable("NEXT_PUBLIC_EMAIL") ??
                          _configuration["EmailSettings:SenderEmail"] ??
                          "default@example.com";

            _senderName = Environment.GetEnvironmentVariable("EMAIL_SENDER_NAME") ??
                         _configuration["EmailSettings:SenderName"] ??
                         "API Testing Tool";

            _password = Environment.GetEnvironmentVariable("NEXT_PUBLIC_PASSWORD") ??
                       _configuration["EmailSettings:Password"] ??
                       string.Empty;

            // Bool değerler için güvenli parse
            string enableSslStr = Environment.GetEnvironmentVariable("EMAIL_ENABLE_SSL") ??
                                 _configuration["EmailSettings:EnableSsl"] ??
                                 "true";
            _enableSsl = bool.TryParse(enableSslStr, out bool enableSsl) ? enableSsl : true;

            string useDefaultCredentialsStr = Environment.GetEnvironmentVariable("EMAIL_USE_DEFAULT_CREDENTIALS") ??
                                             _configuration["EmailSettings:UseDefaultCredentials"] ??
                                             "false";
            _useDefaultCredentials = bool.TryParse(useDefaultCredentialsStr, out bool useDefault) ? useDefault : false;

            
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true)
        {
            try
            {
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_senderEmail, _senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };

                mailMessage.To.Add(toEmail); using (var smtpClient = new SmtpClient(_smtpServer, _smtpPort))
                {
                    // Gmail için SSL kesinlikle etkinleştirilmelidir
                    smtpClient.EnableSsl = true;

                    // Default kimlik bilgilerini KESİNLİKLE kullanmıyoruz (false olmalı)
                    smtpClient.UseDefaultCredentials = false;

                    // Gmail App Password kullanımı için NetworkCredential'ı doğru şekilde ayarlıyoruz
                    smtpClient.Credentials = new NetworkCredential(_senderEmail, _password);

                    // Gmail için ek güvenlik ayarları
                    smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
                    smtpClient.Timeout = 20000; // 20 saniye timeout

                    _logger.LogInformation($"Attempting to send email to {toEmail} using {_smtpServer}:{_smtpPort}");
                    _logger.LogInformation($"Authentication with: {_senderEmail}");

                    await smtpClient.SendMailAsync(mailMessage);
                    _logger.LogInformation($"Email sent successfully to {toEmail}");
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {toEmail}");
                return false;
            }
        }

        public async Task<bool> Send2FACodeAsync(string toEmail, string code)
        {
            string subject = "Your Two-Factor Authentication Code";
            string body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;'>
                        <div style='text-align: center; padding-bottom: 20px;'>
                            <h2 style='color: #333;'>Two-Factor Authentication</h2>
                        </div>
                        <p>Hello,</p>
                        <p>Your verification code for API Testing Tool is:</p>
                        <div style='background-color: #f4f7f8; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 4px; margin: 20px 0;'>
                            {code}
                        </div>
                        <p>This code will expire in 5 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                        <p>Best regards,<br/>API Testing Tool Team</p>
                    </div>
                </body>
                </html>";

            return await SendEmailAsync(toEmail, subject, body);
        }
    }
}
