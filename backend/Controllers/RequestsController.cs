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
        public async Task<IActionResult> GetUserRequests()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var requests = await _requestService.GetUserRequestsAsync(userId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstekler alınırken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        // [HttpGet("collection/{collectionId}")]
        // public async Task<IActionResult> GetCollectionRequests(int collectionId)
        // {
        //     try
        //     {
        //         var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        //         if (string.IsNullOrEmpty(userId))
        //         {
        //             return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
        //         }

        //         // HATA: IRequestService'de GetCollectionRequestsAsync yok.
        //         // var requests = await _requestService.GetCollectionRequestsAsync(collectionId, userId);
        //         // return Ok(requests);
        //         return StatusCode(501, new { message = "Bu özellik henüz uygulanmadı." }); // Geçici olarak 501 döndür
        //     }
        //     catch (Exception ex)
        //     {
        //         _logger.LogError(ex, "Koleksiyon istekleri alınırken bir hata oluştu: {CollectionId}", collectionId);
        //         return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
        //     }
        // }

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

        // [HttpPost("execute")]
        // public async Task<IActionResult> ExecuteAdHocRequest([FromBody] ExecuteRequestDto model)
        // {
        //     try
        //     {
        //         var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        //         if (string.IsNullOrEmpty(userId))
        //         {
        //             return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
        //         }

        //         // HATA: IRequestService'de ExecuteAdHocRequestAsync yok.
        //         // Bu metot IRequestService.ExecuteRequestAsync'ı çağırmalı.
        //         var result = await _requestService.ExecuteRequestAsync(model, userId); // Doğru metodu çağır
        //         return Ok(result);
        //     }
        //     catch (Exception ex)
        //     {
        //         _logger.LogError(ex, "Ad-hoc istek yürütülürken bir hata oluştu");
        //         return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
        //     }
        // }

        // === YANLIŞLIKLA EKLENEN KISIM BAŞLANGICI ===
        // Aşağıdaki metotlar sınıfın dışına taşmış ve hatalara neden oluyor.
        // Bu blok tamamen silinecek.

        // [HttpDelete("{id}")]
        // public async Task<IActionResult> DeleteRequest(int id)
        // {
        //     try
        //     {
        //         var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        //         if (string.IsNullOrEmpty(userId))
        //         {
        //             return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
        //         }

        //         var result = await _requestService.DeleteRequestAsync(id, userId);
        //         if (!result)
        //         {
        //             return NotFound(new { message = "İstek bulunamadı veya bu işlem için yetkiniz yok." });
        //         }

        //         return NoContent();
        //     }
        //     catch (Exception ex)
        //     {
        //         _logger.LogError(ex, "İstek silinirken bir hata oluştu: {RequestId}", id);
        //         return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
        //     }
        // }

        // [HttpPost("{id}/execute")]
        // public async Task<IActionResult> ExecuteRequest(int id)
        // {
        //     try
        //     {
        //         var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        //         if (string.IsNullOrEmpty(userId))
        //         {
        //             return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
        //         }

        //         var result = await _requestService.ExecuteRequestAsync(id, userId);
        //         if (result == null)
        //         {
        //             return NotFound(new { message = "İstek bulunamadı veya bu işlem için yetkiniz yok." });
        //         }

        //         return Ok(result);
        //     }
        //     catch (Exception ex)
        //     {
        //         _logger.LogError(ex, "İstek yürütülürken bir hata oluştu: {RequestId}", id);
        //         return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
        //     }
        // }

        // [HttpPost("execute")]
        // public async Task<IActionResult> ExecuteAdHocRequest([FromBody] ExecuteRequestDto model)
        // {
        //     try
        //     {
        //         var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        //         if (string.IsNullOrEmpty(userId))
        //         {
        //             return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
        //         }

        //         var result = await _requestService.ExecuteAdHocRequestAsync(model, userId);
        //         return Ok(result);
        //     }
        //     catch (Exception ex)
        //     {
        //         _logger.LogError(ex, "Ad-hoc istek yürütülürken bir hata oluştu");
        //         return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
        //     }
        // }
        // === YANLIŞLIKLA EKLENEN KISIM SONU ===

    } // RequestsController sınıfının doğru kapanış parantezi
} // Namespace'in doğru kapanış parantezi
