using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Add Authorize attribute
    public class SharedDataController : ControllerBase
    {
        private readonly ISharedDataService _sharedDataService;

        public SharedDataController(ISharedDataService sharedDataService)
        {
            _sharedDataService = sharedDataService;
        }
        [HttpPost]
        public async Task<ActionResult<ShareLinkResponseDto>> ShareData([FromBody] SharedDataDto data, [FromQuery] int? currentEnvironmentId)
        {
            if (data == null)
            {
                return BadRequest("Invalid data provided.");
            }

            // Make sure that only necessary data is included in the share
            // Validate that it has at least an environment or collections
            if (data.Environment == null && (data.Collections == null || !data.Collections.Any()))
            {
                return BadRequest("At least an environment or collections must be provided.");
            }

            // Get the current user ID
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User must be authenticated to share data.");
            }

            string shareId = await _sharedDataService.SaveSharedDataAsync(data, currentEnvironmentId);

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

            // Get the logged-in user's ID
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // If a user is logged in, automatically associate the shared data with them
            if (!string.IsNullOrEmpty(userId))
            {
                // Associate the environment and collections with this user
                await _sharedDataService.AssociateSharedDataWithUserAsync(userId, data);
            }

            return Ok(data);
        }
    }
}