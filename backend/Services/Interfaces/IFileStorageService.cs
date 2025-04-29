using Microsoft.AspNetCore.Http;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(IFormFile file, string fileName, string containerName);
        Task<bool> DeleteFileAsync(string filePath);
    }
}
