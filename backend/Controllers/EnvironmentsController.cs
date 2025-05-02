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
    public class EnvironmentsController : ControllerBase
    {
        private readonly IEnvironmentService _environmentService;
        private readonly ILogger<EnvironmentsController> _logger;

        public EnvironmentsController(
            IEnvironmentService environmentService,
            ILogger<EnvironmentsController> logger)
        {
            _environmentService = environmentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserEnvironments()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var environments = await _environmentService.GetUserEnvironmentsAsync(userId);

                // Eğer kullanıcının hiç ortamı yoksa, default bir tane oluştur
                if (environments == null || !environments.Any())
                {
                    // Varsayılan ortamı oluştur
                    var defaultEnvironment = new CreateEnvironmentDto
                    {
                        Name = "Default",
                        IsActive = true,
                        Variables = new Dictionary<string, string>()
                    };

                    // Kullanıcı için varsayılan ortamı oluştur (doğru parametre sırasıyla)
                    var createdEnv = await _environmentService.CreateEnvironmentAsync(defaultEnvironment, userId);

                    // Yeni oluşturulan ortamı listede göster
                    environments = new List<EnvironmentDto> { createdEnv };
                }

                return Ok(environments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortamlar alınırken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveEnvironment()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                // GetActiveEnvironmentAsync metodu artık EnvironmentService'de mevcut
                var environment = await _environmentService.GetActiveEnvironmentAsync(userId);

                if (environment == null)
                {
                    // Aktif ortam bulunamadıysa, varsayılan bir tane oluştur
                    var defaultEnvironment = new CreateEnvironmentDto
                    {
                        Name = "Default",
                        IsActive = true,
                        Variables = new Dictionary<string, string>()
                    };

                    // Kullanıcı için varsayılan ortamı oluştur
                    environment = await _environmentService.CreateEnvironmentAsync(defaultEnvironment, userId);
                }

                return Ok(environment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif ortam alınırken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEnvironmentById(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var environment = await _environmentService.GetEnvironmentByIdAsync(id, userId);
                if (environment == null)
                {
                    return NotFound(new { message = "Ortam bulunamadı." });
                }

                return Ok(environment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortam alınırken bir hata oluştu: {EnvironmentId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateEnvironment([FromBody] CreateEnvironmentDto model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var environment = await _environmentService.CreateEnvironmentAsync(model, userId);
                return CreatedAtAction(nameof(GetEnvironmentById), new { id = environment.Id }, environment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortam oluşturulurken bir hata oluştu");
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEnvironment(int id, [FromBody] UpdateEnvironmentDto model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var environment = await _environmentService.UpdateEnvironmentAsync(id, model, userId);
                if (environment == null)
                {
                    return NotFound(new { message = "Ortam bulunamadı veya bu işlem için yetkiniz yok." });
                }

                return Ok(environment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortam güncellenirken bir hata oluştu: {EnvironmentId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEnvironment(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                var result = await _environmentService.DeleteEnvironmentAsync(id, userId);
                if (!result)
                {
                    return NotFound(new { message = "Ortam bulunamadı veya bu işlem için yetkiniz yok." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortam silinirken bir hata oluştu: {EnvironmentId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }

        // Yorum satırını kaldır
        [HttpPut("{id}/activate")] // POST yerine PUT kullanmak daha uygun olabilir
        public async Task<IActionResult> ActivateEnvironment(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });
                }

                // Servis metodunu çağır
                var result = await _environmentService.ActivateEnvironmentAsync(id, userId);
                // var result = false; // Geçici olarak false döndür - Bu satırı kaldır
                if (!result)
                {
                    return NotFound(new { message = "Ortam bulunamadı veya bu işlem için yetkiniz yok." });
                }

                return Ok(new { message = "Ortam başarıyla aktifleştirildi." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortam aktifleştirilirken bir hata oluştu: {EnvironmentId}", id);
                return StatusCode(500, new { message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
            }
        }
        // Yorum satırını kaldır
    }
}
