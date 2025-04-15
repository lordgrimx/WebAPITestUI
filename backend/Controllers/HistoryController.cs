using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryService _historyService;
        private readonly ILogger<HistoryController> _logger;

        public HistoryController(
            IHistoryService historyService,
            ILogger<HistoryController> logger)
        {
            _historyService = historyService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserHistory([FromQuery] int limit = 50)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var history = await _historyService.GetUserHistoryAsync(userId, limit);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geçmiş kayıtları alınırken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpGet("request/{requestId}")]
        public async Task<IActionResult> GetRequestHistory(int requestId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var history = await _historyService.GetRequestHistoryAsync(requestId, userId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstek geçmişi alınırken bir hata oluştu: {RequestId}", requestId);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetHistoryEntry(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var historyEntry = await _historyService.GetHistoryEntryByIdAsync(id, userId);
                if (historyEntry == null)
                {
                    return NotFound(new { message = "Geçmiş kaydı bulunamadı." });
                }

                return Ok(historyEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geçmiş kaydı alınırken bir hata oluştu: {HistoryId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> RecordHistory([FromBody] RecordHistoryDto model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var historyEntry = await _historyService.RecordHistoryAsync(model, userId);
                return CreatedAtAction(nameof(GetHistoryEntry), new { id = historyEntry.Id }, historyEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geçmiş kaydı oluşturulurken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHistoryEntry(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var result = await _historyService.DeleteHistoryEntryAsync(id, userId);
                if (!result)
                {
                    return NotFound(new { message = "Geçmiş kaydı bulunamadı veya bu işlem için yetkiniz yok." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geçmiş kaydı silinirken bir hata oluştu: {HistoryId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearOldHistory([FromQuery] int olderThanDays = 30)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var olderThan = DateTime.UtcNow.AddDays(-olderThanDays);
                var deletedCount = await _historyService.ClearOldHistoryAsync(userId, olderThan);

                return Ok(new
                {
                    message = $"{deletedCount} adet geçmiş kaydı silindi.",
                    deletedCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Eski geçmiş kayıtları temizlenirken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }
    }
}
