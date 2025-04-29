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
    public class RequestsController : ControllerBase
    {
        private readonly IRequestService _requestService;
        private readonly ILogger<RequestsController> _logger;

        public RequestsController(
            IRequestService requestService,
            ILogger<RequestsController> logger)
        {
            _requestService = requestService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserRequests([FromQuery] string? currentEnvironmentId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var requests = await _requestService.GetUserRequestsAsync(userId, currentEnvironmentId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstekler alınırken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpGet("collection/{collectionId}")]
        public async Task<IActionResult> GetCollectionRequests(int collectionId, [FromQuery] string? currentEnvironmentId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var requests = await _requestService.GetCollectionRequestsAsync(collectionId, userId, currentEnvironmentId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyon istekleri alınırken bir hata oluştu: {CollectionId}", collectionId);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequestById(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                } // if bloğunun sonu

                // Eksik kod: İsteği servis üzerinden al
                var request = await _requestService.GetRequestByIdAsync(id, userId);
                if (request == null)
                {
                    return NotFound(new { message = "İstek bulunamadı veya bu işlem için yetkiniz yok." });
                }

                return Ok(request);

            } // try bloğunun sonu (Eklendi)
            catch (Exception ex) // catch bloğu (Eklendi)
            {
                _logger.LogError(ex, "İstek getirilirken bir hata oluştu: {RequestId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        } // GetRequestById metodunun sonu (Doğru yer)

        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] CreateRequestDto model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var request = await _requestService.CreateRequestAsync(model, userId);
                return CreatedAtAction(nameof(GetRequestById), new { id = request.Id }, request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstek oluşturulurken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRequest(int id, [FromBody] UpdateRequestDto model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var request = await _requestService.UpdateRequestAsync(id, model, userId);
                if (request == null)
                {
                    return NotFound(new { message = "İstek bulunamadı veya bu işlem için yetkiniz yok." });
                }

                return Ok(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstek güncellenirken bir hata oluştu: {RequestId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var result = await _requestService.DeleteRequestAsync(id, userId);
                if (!result)
                {
                    return NotFound(new { message = "İstek bulunamadı veya bu işlem için yetkiniz yok." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstek silinirken bir hata oluştu: {RequestId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }
    }
}
