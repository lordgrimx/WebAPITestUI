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
    public class CollectionsController : ControllerBase
    {
        private readonly ICollectionService _collectionService;
        private readonly ILogger<CollectionsController> _logger;

        public CollectionsController(
            ICollectionService collectionService,
            ILogger<CollectionsController> logger)
        {
            _collectionService = collectionService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserCollections()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var collections = await _collectionService.GetUserCollectionsAsync(userId);
                return Ok(collections);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyonlar alınırken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCollectionById(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var collection = await _collectionService.GetCollectionByIdAsync(id, userId);
                if (collection == null)
                {
                    return NotFound(new { message = "Koleksiyon bulunamadı." });
                }

                return Ok(collection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyon alınırken bir hata oluştu: {CollectionId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateCollection([FromBody] CreateCollectionDto model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var collection = await _collectionService.CreateCollectionAsync(model, userId);
                return CreatedAtAction(nameof(GetCollectionById), new { id = collection.Id }, collection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyon oluşturulurken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCollection(int id, [FromBody] UpdateCollectionDto model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var collection = await _collectionService.UpdateCollectionAsync(id, model, userId);
                if (collection == null)
                {
                    return NotFound(new { message = "Koleksiyon bulunamadı veya bu işlem için yetkiniz yok." });
                }

                return Ok(collection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyon güncellenirken bir hata oluştu: {CollectionId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCollection(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var result = await _collectionService.DeleteCollectionAsync(id, userId);
                if (!result)
                {
                    return NotFound(new { message = "Koleksiyon bulunamadı veya bu işlem için yetkiniz yok." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyon silinirken bir hata oluştu: {CollectionId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }
    }
}
