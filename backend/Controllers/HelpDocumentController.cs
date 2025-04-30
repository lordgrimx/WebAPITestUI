// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Controllers\HelpDocumentController.cs
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
    public class HelpDocumentController : ControllerBase
    {
        private readonly IHelpDocumentService _helpDocumentService;

        public HelpDocumentController(IHelpDocumentService helpDocumentService)
        {
            _helpDocumentService = helpDocumentService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<HelpDocumentDto>>> GetAllDocuments()
        {
            var documents = await _helpDocumentService.GetAllDocumentsAsync();
            return Ok(documents);
        }

        [HttpGet("category/{category}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<HelpDocumentDto>>> GetDocumentsByCategory(string category)
        {
            var documents = await _helpDocumentService.GetDocumentsByCategoryAsync(category);
            return Ok(documents);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<HelpDocumentDto>> GetDocumentById(int id)
        {
            var document = await _helpDocumentService.GetDocumentByIdAsync(id);

            if (document == null)
                return NotFound();

            return Ok(document);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<HelpDocumentDto>> CreateDocument(CreateHelpDocumentDto documentDto)
        {
            var createdDocument = await _helpDocumentService.CreateDocumentAsync(documentDto);
            return CreatedAtAction(nameof(GetDocumentById), new { id = createdDocument.Id }, createdDocument);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<HelpDocumentDto>> UpdateDocument(int id, CreateHelpDocumentDto documentDto)
        {
            var updatedDocument = await _helpDocumentService.UpdateDocumentAsync(id, documentDto);

            if (updatedDocument == null)
                return NotFound();

            return Ok(updatedDocument);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteDocument(int id)
        {
            var result = await _helpDocumentService.DeleteDocumentAsync(id);

            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}
