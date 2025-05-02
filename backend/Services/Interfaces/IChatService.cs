// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Services\Interfaces\IChatService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface IChatService
    {
        Task<ChatMessageDto> CreateMessageAsync(string userId, CreateChatMessageDto messageDto);
        Task<IEnumerable<ChatMessageDto>> GetMessagesBySessionIdAsync(string sessionId, string userId);
        Task<IEnumerable<ChatSessionDto>> GetAllSessionsByUserIdAsync(string userId);
        Task<AiCompletionResponse> GetAiCompletionAsync(string userId, AiCompletionRequest request);
        Task<bool> DeleteSessionAsync(string sessionId, string userId);
    }
}
