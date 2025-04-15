using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class FileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;
        private readonly ILogger<FileStorageService> _logger;

        public FileStorageService(
            IWebHostEnvironment environment,
            IConfiguration configuration,
            ILogger<FileStorageService> logger)
        {
            _environment = environment;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string fileName, string containerName)
        {
            try
            {
                // Dosya yolunu oluştur
                var uploadsFolder = Path.Combine(_environment.WebRootPath, containerName);

                // Klasör yoksa oluştur
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Benzersiz dosya adı oluştur
                var uniqueFileName = $"{Path.GetFileNameWithoutExtension(fileName)}_{Guid.NewGuid()}{Path.GetExtension(fileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Dosyayı kaydet
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Dosyanın web erişim yolunu döndür
                return $"/{containerName}/{uniqueFileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Dosya kaydedilirken bir hata oluştu: {FileName}", fileName);
                return null;
            }
        }

        public Task<bool> DeleteFileAsync(string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath))
                {
                    return Task.FromResult(false);
                }

                // Dosya yolunu düzelt
                filePath = filePath.TrimStart('/');
                var fullPath = Path.Combine(_environment.WebRootPath, filePath);

                // Dosya varsa sil
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return Task.FromResult(true);
                }

                return Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Dosya silinirken bir hata oluştu: {FilePath}", filePath);
                return Task.FromResult(false);
            }
        }
    }
}
