// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Services\Interfaces\IFaqService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IFaqService
    {
        Task<IEnumerable<FaqDto>> GetAllFaqsAsync();
        Task<IEnumerable<FaqDto>> GetFaqsByCategoryAsync(string category);
        Task<FaqDto> GetFaqByIdAsync(int id);
        Task<FaqDto> CreateFaqAsync(CreateFaqDto faqDto);
        Task<FaqDto> UpdateFaqAsync(int id, UpdateFaqDto faqDto);
        Task<bool> DeleteFaqAsync(int id);
    }
}
