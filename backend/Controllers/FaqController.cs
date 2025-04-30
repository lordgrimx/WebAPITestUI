// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Controllers\FaqController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaqController : ControllerBase
    {
        private readonly IFaqService _faqService;

        public FaqController(IFaqService faqService)
        {
            _faqService = faqService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<FaqDto>>> GetAllFaqs()
        {
            var faqs = await _faqService.GetAllFaqsAsync();
            return Ok(faqs);
        }

        [HttpGet("category/{category}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<FaqDto>>> GetFaqsByCategory(string category)
        {
            var faqs = await _faqService.GetFaqsByCategoryAsync(category);
            return Ok(faqs);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<FaqDto>> GetFaqById(int id)
        {
            var faq = await _faqService.GetFaqByIdAsync(id);

            if (faq == null)
                return NotFound();

            return Ok(faq);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FaqDto>> CreateFaq(CreateFaqDto faqDto)
        {
            var createdFaq = await _faqService.CreateFaqAsync(faqDto);
            return CreatedAtAction(nameof(GetFaqById), new { id = createdFaq.Id }, createdFaq);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FaqDto>> UpdateFaq(int id, UpdateFaqDto faqDto)
        {
            var updatedFaq = await _faqService.UpdateFaqAsync(id, faqDto);

            if (updatedFaq == null)
                return NotFound();

            return Ok(updatedFaq);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteFaq(int id)
        {
            var result = await _faqService.DeleteFaqAsync(id);

            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
