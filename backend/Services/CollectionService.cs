using Microsoft.EntityFrameworkCore;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class CollectionService : ICollectionService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<CollectionService> _logger;

        public CollectionService(
            ApplicationDbContext dbContext,
            ILogger<CollectionService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<IEnumerable<CollectionDto>> GetUserCollectionsAsync(string userId, string? currentEnvironmentId)
        {
            try
            {
                var query = _dbContext.Collections
                    .Where(c => c.UserId == userId);

                if (!string.IsNullOrEmpty(currentEnvironmentId) && int.TryParse(currentEnvironmentId, out int envId))
                {
                    // Koleksiyonları doğrudan EnvironmentId'ye göre filtrele
                    query = query.Where(c => c.EnvironmentId == envId);
                }

                var collections = await query
                    .OrderBy(c => c.Name)
                    .Select(c => new CollectionDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Description = c.Description,
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt,
                        EnvironmentId = c.EnvironmentId, // EnvironmentId alanını da DTO'ya ekleyelim
                        // İstek sayısını da EnvironmentId'ye göre filtreleyebiliriz, ancak bu mevcut DTO yapısını değiştirir.
                        // İhtiyaç olursa bu kısım güncellenebilir.
                        RequestCount = _dbContext.Requests.Count(r => r.CollectionId == c.Id)
                    })
                    .ToListAsync();

                return collections;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı koleksiyonları alınırken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        public async Task<CollectionDto> GetCollectionByIdAsync(int id, string userId)
        {
            try
            {
                var collection = await _dbContext.Collections
                    .Where(c => c.Id == id && c.UserId == userId)
                    .Select(c => new CollectionDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Description = c.Description,
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt,
                        EnvironmentId = c.EnvironmentId,
                        RequestCount = _dbContext.Requests.Count(r => r.CollectionId == c.Id)
                    })
                    .FirstOrDefaultAsync();

                return collection!; // Interfaz uyumluluğu için null! kullanıyoruz
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyon alınırken bir hata oluştu: {CollectionId}, {UserId}", id, userId);
                throw;
            }
        }

        public async Task<CollectionDto> CreateCollectionAsync(CreateCollectionDto model, string userId)
        {
            try
            {
                var collection = new Collection
                {
                    Name = model.Name,
                    Description = model.Description,
                    UserId = userId,
                    EnvironmentId = model.EnvironmentId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _dbContext.Collections.Add(collection);
                await _dbContext.SaveChangesAsync();

                return new CollectionDto
                {
                    Id = collection.Id,
                    Name = collection.Name,
                    Description = collection.Description,
                    CreatedAt = collection.CreatedAt,
                    UpdatedAt = collection.UpdatedAt,
                    EnvironmentId = collection.EnvironmentId,
                    RequestCount = 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyon oluşturulurken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        public async Task<CollectionDto> UpdateCollectionAsync(int id, UpdateCollectionDto model, string userId)
        {
            try
            {
                var collection = await _dbContext.Collections
                    .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

                if (collection == null)
                {
                    return null!; // Interfaz uyumluluğu için null! kullanıyoruz
                }

                if (!string.IsNullOrEmpty(model.Name))
                {
                    collection.Name = model.Name;
                }

                if (model.Description != null)
                {
                    collection.Description = model.Description;
                }

                collection.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                return new CollectionDto
                {
                    Id = collection.Id,
                    Name = collection.Name,
                    Description = collection.Description,
                    CreatedAt = collection.CreatedAt,
                    UpdatedAt = collection.UpdatedAt,
                    EnvironmentId = collection.EnvironmentId,
                    RequestCount = await _dbContext.Requests.CountAsync(r => r.CollectionId == id)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyon güncellenirken bir hata oluştu: {CollectionId}, {UserId}", id, userId);
                throw;
            }
        }

        public async Task<bool> DeleteCollectionAsync(int id, string userId)
        {
            try
            {
                var collection = await _dbContext.Collections
                    .Include(c => c.Requests)
                    .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

                if (collection == null)
                {
                    return false;
                }

                // İlk olarak bu koleksiyona ait istekleri sil
                _dbContext.Requests.RemoveRange(collection.Requests);

                // Sonra koleksiyonu sil
                _dbContext.Collections.Remove(collection);
                await _dbContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyon silinirken bir hata oluştu: {CollectionId}, {UserId}", id, userId);
                throw;
            }
        }
    }
}
