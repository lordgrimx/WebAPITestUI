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
        public async Task<HistoryDto> GetHistoryByIdAsync(int id, string userId)
        {
            try
            {
                var historyEntry = await _dbContext.HistoryEntries
                    .Include(h => h.Request)
                    .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

                if (historyEntry == null)
                {
                    return null;
                }

                return MapToHistoryDto(historyEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geçmiş kaydı getirilirken bir hata oluştu: {HistoryId}, {UserId}", id, userId);
                throw;
            }
        }

        // Rename to match the interface
        public async Task<bool> DeleteHistoryAsync(int id, string userId)
        {
            // Reuse existing implementation
            return await DeleteHistoryEntryAsync(id, userId);
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
                // İsteği kontrol et
                if (model.RequestId.HasValue)
                {
                    var request = await _dbContext.Requests
                        .FirstOrDefaultAsync(r => r.Id == model.RequestId.Value && r.UserId == userId);

                    if (request == null)
                    {
                        throw new InvalidOperationException("Belirtilen istek bulunamadı veya erişim izniniz yok.");
                    }
                }

                var historyEntry = new History
                {
                    UserId = userId,
                    RequestId = model.RequestId,
                    Method = model.Method,
                    Url = model.Url,
                    Status = model.Status,
                    Duration = model.Duration,
                    ResponseSize = model.ResponseSize,
                    Response = model.Response,
                    Timestamp = DateTime.UtcNow
                };

                _dbContext.HistoryEntries.Add(historyEntry);
                await _dbContext.SaveChangesAsync();

                // İlişkili isteği yükle
                if (historyEntry.RequestId.HasValue)
                {
                    await _dbContext.Entry(historyEntry).Reference(h => h.Request).LoadAsync();
                }

                return MapToHistoryDto(historyEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geçmiş kaydı oluşturulurken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> DeleteHistoryEntryAsync(int id, string userId)
        {
            try
            {
                var historyEntry = await _dbContext.HistoryEntries
                    .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

                if (historyEntry == null)
                {
                    return false;
                }

                _dbContext.HistoryEntries.Remove(historyEntry);
                await _dbContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geçmiş kaydı silinirken bir hata oluştu: {HistoryId}, {UserId}", id, userId);
                throw;
            }
        }

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
                Status = history.Status,
                Duration = history.Duration,
                ResponseSize = history.ResponseSize,
                Timestamp = history.Timestamp,
                Response = history.Response
            };
        }
    }
}
