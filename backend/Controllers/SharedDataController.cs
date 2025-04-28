using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SharedDataController : ControllerBase
    {
        private readonly ISharedDataService _sharedDataService;

        public SharedDataController(ISharedDataService sharedDataService)
        {
            _sharedDataService = sharedDataService;
        }

        [HttpPost]
        public async Task<ActionResult<ShareLinkResponseDto>> ShareData([FromBody] SharedDataDto data)
        {
            if (data == null)
            {
                return BadRequest("Invalid data provided.");
            }

            string shareId = await _sharedDataService.SaveSharedDataAsync(data);

            return Ok(new ShareLinkResponseDto { ShareId = shareId });
        }

        [HttpGet("{shareId}")]
        public async Task<ActionResult<SharedDataDto>> GetSharedData(string shareId)
        {
            if (string.IsNullOrEmpty(shareId))
            {
                return BadRequest("Share ID is required.");
            }

            SharedDataDto? data = await _sharedDataService.GetSharedDataAsync(shareId);

            if (data == null)
            {
                return NotFound("Shared data not found.");
            }

            return Ok(data);
        }
    }
}