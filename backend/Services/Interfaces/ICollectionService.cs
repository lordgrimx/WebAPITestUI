using WebTestUI.Backend.DTOs;

namespace WebTestUI.Backend.Services.Interfaces
{
    public interface ICollectionService
    {
        Task<IEnumerable<CollectionDto>> GetUserCollectionsAsync(string userId);
        Task<CollectionDto> GetCollectionByIdAsync(int id, string userId);
        Task<CollectionDto> CreateCollectionAsync(CreateCollectionDto model, string userId);
        Task<CollectionDto> UpdateCollectionAsync(int id, UpdateCollectionDto model, string userId);
        Task<bool> DeleteCollectionAsync(int id, string userId);
    }
}
