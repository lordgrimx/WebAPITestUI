using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using WebTestUI.Backend.Data;

namespace WebTestUI.Backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HealthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("/health")]
        public async Task<IActionResult> Get()
        {
            try
            {
                // Veritabanı bağlantısını kontrol et
                await _context.Database.CanConnectAsync();
                
                return Ok(new { status = "healthy", message = "Service is running" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { status = "unhealthy", message = $"Service has issues: {ex.Message}" });
            }
        }
    }
} 