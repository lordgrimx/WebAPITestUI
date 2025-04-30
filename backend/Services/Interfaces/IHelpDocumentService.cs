// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Services\Interfaces\IHelpDocumentService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IHelpDocumentService
    {
        Task<IEnumerable<HelpDocumentDto>> GetAllDocumentsAsync();
        Task<IEnumerable<HelpDocumentDto>> GetDocumentsByCategoryAsync(string category);
        Task<HelpDocumentDto> GetDocumentByIdAsync(int id);
        Task<HelpDocumentDto> CreateDocumentAsync(CreateHelpDocumentDto documentDto);
        Task<HelpDocumentDto> UpdateDocumentAsync(int id, CreateHelpDocumentDto documentDto);
        Task<bool> DeleteDocumentAsync(int id);
    }
}
