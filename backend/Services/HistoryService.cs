using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class HistoryService : IHistoryService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<HistoryService> _logger;

        public HistoryService(
            ApplicationDbContext dbContext,
            ILogger<HistoryService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<IEnumerable<HistoryDto>> GetUserHistoryAsync(string userId, int limit = 50)
        {
            try
            {
                var history = await _dbContext.HistoryEntries
                    .Include(h => h.Request)
                    .Where(h => h.UserId == userId)
                    .OrderByDescending(h => h.Timestamp)
                    .Take(limit)
                    .ToListAsync();

                return history.Select(MapToHistoryDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı geçmişi alınırken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<HistoryDto>> GetRequestHistoryAsync(int requestId, string userId)
        {
            try
            {
                var history = await _dbContext.HistoryEntries
                    .Include(h => h.Request)
                    .Where(h => h.RequestId == requestId && h.UserId == userId)
                    .OrderByDescending(h => h.Timestamp)
                    .ToListAsync();

                return history.Select(MapToHistoryDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstek geçmişi alınırken bir hata oluştu: {RequestId}, {UserId}", requestId, userId);
                throw;
            }
        }

        // Implement the missing interface methods
        // Return nullable DTO for better handling of not found cases
        public async Task<HistoryDto?> GetHistoryByIdAsync(int id, string userId)
        {
            try
            {
                var historyEntry = await _dbContext.HistoryEntries
                    .Include(h => h.Request)
                    .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

                return historyEntry == null ? null : MapToHistoryDto(historyEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geçmiş kaydı ID {HistoryId} getirilirken bir hata oluştu (Kullanıcı: {UserId})", id, userId);
                throw; // Re-throw the exception to allow higher layers to handle it
            }
        }

        // Combined DeleteHistoryAsync and DeleteHistoryEntryAsync
        public async Task<bool> DeleteHistoryAsync(int id, string userId)
        {
             try
            {
                var historyEntry = await _dbContext.HistoryEntries
                    .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

                if (historyEntry == null)
                {
                    _logger.LogWarning("Silinecek geçmiş kaydı bulunamadı: ID {HistoryId}, Kullanıcı: {UserId}", id, userId);
                    return false; // Indicate that the entry was not found
                }

                _dbContext.HistoryEntries.Remove(historyEntry);
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Geçmiş kaydı başarıyla silindi: ID {HistoryId}, Kullanıcı: {UserId}", id, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geçmiş kaydı ID {HistoryId} silinirken bir hata oluştu (Kullanıcı: {UserId})", id, userId);
                throw; // Re-throw the exception
            }
        }

        public async Task<bool> ClearHistoryAsync(string userId)
        {
            try
            {
                var entries = await _dbContext.HistoryEntries
                    .Where(h => h.UserId == userId)
                    .ToListAsync();

                if (entries.Count == 0)
                {
                    return false;
                }

                _dbContext.HistoryEntries.RemoveRange(entries);
                await _dbContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tüm geçmiş kayıtları temizlenirken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        public async Task<HistoryDto> RecordHistoryAsync(RecordHistoryDto model, string userId)
        {
            try
            {
                // Check if the associated request exists and belongs to the user
                if (model.RequestId.HasValue)
                {
                    var requestExists = await _dbContext.Requests
                        .AnyAsync(r => r.Id == model.RequestId.Value && r.UserId == userId);

                    if (!requestExists)
                    {
                        _logger.LogWarning("Geçmiş kaydı oluşturulurken ilişkili istek bulunamadı veya kullanıcıya ait değil: RequestId {RequestId}, Kullanıcı: {UserId}", model.RequestId.Value, userId);
                        // Depending on requirements, you might throw an exception or handle this differently
                        // For now, let's proceed but log a warning. Consider if RequestId should be nullable in History if this is allowed.
                        // throw new InvalidOperationException($"Request with ID {model.RequestId.Value} not found or access denied for user {userId}.");
                    }
                }

                var historyEntry = new History
                {
                    UserId = userId,
                    RequestId = model.RequestId, // Keep RequestId even if validation fails, or set to null based on requirements
                    Method = model.Method,
                    Url = model.Url,
                    Status = model.StatusCode, // Fix: Use StatusCode from DTO
                    Duration = model.Duration,
                    ResponseSize = model.Size, // Fix: Use Size from DTO
                    Response = model.ResponseBody, // Fix: Use ResponseBody from DTO
                    Timestamp = DateTime.UtcNow
                };

                _dbContext.HistoryEntries.Add(historyEntry);
                await _dbContext.SaveChangesAsync();

                // Load the related request if it exists to include its name in the DTO
                if (historyEntry.RequestId.HasValue)
                {
                    // Use explicit loading to avoid potential N+1 issues if called in a loop elsewhere
                    await _dbContext.Entry(historyEntry).Reference(h => h.Request).LoadAsync();
                }
                 _logger.LogInformation("Geçmiş kaydı başarıyla oluşturuldu: ID {HistoryId}, Kullanıcı: {UserId}", historyEntry.Id, userId);
                return MapToHistoryDto(historyEntry);
            }
            catch (DbUpdateException dbEx) // More specific exception handling
            {
                 _logger.LogError(dbEx, "Veritabanı güncelleme hatası oluştu geçmiş kaydı oluşturulurken (Kullanıcı: {UserId})", userId);
                 throw; // Re-throw or handle appropriately
            }
            catch (Exception ex) // Catch broader exceptions
            {
                _logger.LogError(ex, "Geçmiş kaydı oluşturulurken beklenmedik bir hata oluştu (Kullanıcı: {UserId})", userId);
                throw;
            }
        }

        // Removed duplicate DeleteHistoryEntryAsync method

        public async Task<int> ClearOldHistoryAsync(string userId, DateTime olderThan)
        {
            try
            {
                var oldEntries = await _dbContext.HistoryEntries
                    .Where(h => h.UserId == userId && h.Timestamp < olderThan)
                    .ToListAsync();

                if (oldEntries.Count == 0)
                {
                    return 0;
                }

                _dbContext.HistoryEntries.RemoveRange(oldEntries);
                await _dbContext.SaveChangesAsync();

                return oldEntries.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eski geçmiş kayıtları temizlenirken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        // Helper metot: History nesnesini HistoryDto'ya dönüştürür
        private HistoryDto MapToHistoryDto(History history)
        {
            return new HistoryDto
            {
                Id = history.Id,
                RequestId = history.RequestId,
                RequestName = history.Request?.Name,
                Method = history.Method,
                Url = history.Url,
                StatusCode = history.Status ?? 0, // Handle potential null with default value
                Duration = history.Duration ?? 0, // Handle potential null with default value
                Size = history.ResponseSize ?? 0, // Handle potential null with default value
                Timestamp = history.Timestamp,
                ResponseBody = history.Response // Changed Response to ResponseBody
            };
        }
    }
}
