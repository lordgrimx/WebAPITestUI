using Microsoft.AspNetCore.Mvc;
using WebTestUI.Backend.Services;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Data.Entities;

namespace WebTestUI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class K6TestController : ControllerBase
    {
        private readonly IK6TestService _k6TestService;

        public K6TestController(IK6TestService k6TestService)
        {
            _k6TestService = k6TestService;
        }

        [HttpGet]
        public async Task<ActionResult<List<K6TestDTO>>> GetAllK6Tests()
        {
            var tests = await _k6TestService.GetAllK6TestsAsync();
            return Ok(tests);
        }

        [HttpGet("request/{requestId}")]
        public async Task<ActionResult<List<K6TestDTO>>> GetK6TestsByRequest(int requestId)
        {
            var tests = await _k6TestService.GetK6TestsByRequestAsync(requestId);
            return Ok(tests);
        }

        [HttpPost]
        public async Task<ActionResult<K6TestDTO>> CreateK6Test(CreateK6TestDTO createDto)
        {
            var test = await _k6TestService.CreateK6TestAsync(createDto);
            return CreatedAtAction(nameof(GetAllK6Tests), new { id = test.Id }, test);
        }

        [HttpPut("{id}/results")]
        public async Task<ActionResult<K6TestDTO>> UpdateK6TestResults(Guid id, UpdateK6TestResultsDTO updateDto)
        {
            try
            {
                var test = await _k6TestService.UpdateK6TestResultsAsync(id, updateDto);
                return Ok(test);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteK6Test(Guid id)
        {
            var result = await _k6TestService.DeleteK6TestAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("generate-script")]
        public async Task<ActionResult<string>> GenerateK6Script(GenerateK6ScriptDTO generateDto)
        {
            var script = await _k6TestService.GenerateK6ScriptAsync(generateDto);
            return Ok(script);
        }

        [HttpPost("generate-and-save")]
        public async Task<ActionResult<K6TestDTO>> GenerateAndSaveK6Script(
            [FromQuery] string name,
            [FromQuery] string? description,
            [FromQuery] int? requestId,
            [FromBody] GenerateK6ScriptDTO generateDto)
        {
            var test = await _k6TestService.GenerateAndSaveK6ScriptAsync(
                name,
                description,
                requestId,
                generateDto.RequestData,
                generateDto.Options);

            return CreatedAtAction(nameof(GetAllK6Tests), new { id = test.Id }, test);
        }
        [HttpPost("{testId}/logs")]
        public async Task<ActionResult> AddLogEntry(Guid testId, AddLogEntryDTO logDto)
        {
            try
            {
                await _k6TestService.AddLogEntryAsync(testId, logDto);
                return Ok();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("{testId}/logs")]
        public async Task<ActionResult<List<K6TestLog>>> GetTestLogs(Guid testId)
        {
            try
            {
                var testDto = await _k6TestService.ExecuteK6TestAsync(testId);
                if (testDto == null)
                {
                    return NotFound(new { message = $"Test with ID {testId} not found when fetching logs." });
                }
                return Ok(testDto.Logs ?? new List<K6TestLog>());
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Test with ID {testId} not found (KeyNotFoundException)." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"An internal error occurred while fetching logs: {ex.Message}" });
            }
        }
        

        [HttpPost("{testId}/execute")]
        public async Task<ActionResult<object>> ExecuteK6Test(Guid testId)
        {
            try
            {
                var test = await _k6TestService.ExecuteK6TestAsync(testId);
                if (test == null)
                    return NotFound();

                // Test seçeneklerini ve script'i döndür
                return Ok(new
                {
                    script = test.Script,
                    options = test.Options
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{id}/status-and-logs")]
        public async Task<ActionResult> UpdateTestStatusAndLogs(Guid id, UpdateTestStatusAndLogsDTO updateDto)
        {
            try
            {
                await _k6TestService.UpdateTestStatusAndLogsAsync(id, updateDto);
                return Ok();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}