// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Services\HelpDocumentService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class HelpDocumentService : IHelpDocumentService
    {
        private readonly ApplicationDbContext _context;

        public HelpDocumentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HelpDocumentDto>> GetAllDocumentsAsync()
        {
            var documents = await _context.HelpDocuments
                .Where(d => d.IsPublished)
                .OrderBy(d => d.Category)
                .ThenBy(d => d.SortOrder)
                .Select(d => new HelpDocumentDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    Content = d.Content,
                    Category = d.Category,
                    Description = d.Description,
                    IconName = d.IconName
                })
                .ToListAsync();

            return documents;
        }

        public async Task<IEnumerable<HelpDocumentDto>> GetDocumentsByCategoryAsync(string category)
        {
            var documents = await _context.HelpDocuments
                .Where(d => d.IsPublished && d.Category == category)
                .OrderBy(d => d.SortOrder)
                .Select(d => new HelpDocumentDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    Content = d.Content,
                    Category = d.Category,
                    Description = d.Description,
                    IconName = d.IconName
                })
                .ToListAsync();

            return documents;
        }

        public async Task<HelpDocumentDto> GetDocumentByIdAsync(int id)
        {
            var document = await _context.HelpDocuments
                .Where(d => d.Id == id)
                .Select(d => new HelpDocumentDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    Content = d.Content,
                    Category = d.Category,
                    Description = d.Description,
                    IconName = d.IconName
                })
                .FirstOrDefaultAsync();

            return document;
        }

        public async Task<HelpDocumentDto> CreateDocumentAsync(CreateHelpDocumentDto documentDto)
        {
            var document = new HelpDocument
            {
                Title = documentDto.Title,
                Content = documentDto.Content,
                Category = documentDto.Category,
                Description = documentDto.Description,
                IconName = documentDto.IconName,
                SortOrder = documentDto.SortOrder,
                IsPublished = documentDto.IsPublished,
                CreatedAt = DateTime.UtcNow
            };

            await _context.HelpDocuments.AddAsync(document);
            await _context.SaveChangesAsync();

            return new HelpDocumentDto
            {
                Id = document.Id,
                Title = document.Title,
                Content = document.Content,
                Category = document.Category,
                Description = document.Description,
                IconName = document.IconName
            };
        }

        public async Task<HelpDocumentDto> UpdateDocumentAsync(int id, CreateHelpDocumentDto documentDto)
        {
            var document = await _context.HelpDocuments.FindAsync(id);

            if (document == null)
                return null;

            document.Title = documentDto.Title;
            document.Content = documentDto.Content;
            document.Category = documentDto.Category;
            document.Description = documentDto.Description;
            document.IconName = documentDto.IconName;
            document.SortOrder = documentDto.SortOrder;
            document.IsPublished = documentDto.IsPublished;
            document.UpdatedAt = DateTime.UtcNow;

            _context.HelpDocuments.Update(document);
            await _context.SaveChangesAsync();

            return new HelpDocumentDto
            {
                Id = document.Id,
                Title = document.Title,
                Content = document.Content,
                Category = document.Category,
                Description = document.Description,
                IconName = document.IconName
            };
        }

        public async Task<bool> DeleteDocumentAsync(int id)
        {
            var document = await _context.HelpDocuments.FindAsync(id);

            if (document == null)
                return false;

            _context.HelpDocuments.Remove(document);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
