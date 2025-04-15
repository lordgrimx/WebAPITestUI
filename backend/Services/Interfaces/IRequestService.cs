using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IRequestService
    {
        Task<IEnumerable<RequestDto>> GetUserRequestsAsync(string userId);
        Task<RequestDto> GetRequestByIdAsync(int id, string userId);
        Task<RequestDto> CreateRequestAsync(CreateRequestDto model, string userId);
        Task<RequestDto> UpdateRequestAsync(int id, UpdateRequestDto model, string userId);
        Task<bool> DeleteRequestAsync(int id, string userId);
        Task<ExecuteRequestResultDto> ExecuteRequestAsync(ExecuteRequestDto model, string userId);
        Task<IEnumerable<RequestDto>> GetCollectionRequestsAsync(int collectionId, string userId);
    }
}
