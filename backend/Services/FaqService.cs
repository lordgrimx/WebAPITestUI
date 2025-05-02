// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Services\FaqService.cs
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
    public class FaqService : IFaqService
    {
        private readonly ApplicationDbContext _context;

        public FaqService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FaqDto>> GetAllFaqsAsync()
        {
            var faqs = await _context.Faqs
                .Where(f => f.IsPublished)
                .OrderBy(f => f.Category)
                .ThenBy(f => f.SortOrder)
                .Select(f => new FaqDto
                {
                    Id = f.Id,
                    Question = f.Question,
                    Answer = f.Answer,
                    Category = f.Category,
                    SortOrder = f.SortOrder
                })
                .ToListAsync();

            return faqs;
        }

        public async Task<IEnumerable<FaqDto>> GetFaqsByCategoryAsync(string category)
        {
            var faqs = await _context.Faqs
                .Where(f => f.IsPublished && f.Category == category)
                .OrderBy(f => f.SortOrder)
                .Select(f => new FaqDto
                {
                    Id = f.Id,
                    Question = f.Question,
                    Answer = f.Answer,
                    Category = f.Category,
                    SortOrder = f.SortOrder
                })
                .ToListAsync();

            return faqs;
        }

        public async Task<FaqDto> GetFaqByIdAsync(int id)
        {
            var faq = await _context.Faqs
                .Where(f => f.Id == id)
                .Select(f => new FaqDto
                {
                    Id = f.Id,
                    Question = f.Question,
                    Answer = f.Answer,
                    Category = f.Category,
                    SortOrder = f.SortOrder
                })
                .FirstOrDefaultAsync();

            return faq;
        }

        public async Task<FaqDto> CreateFaqAsync(CreateFaqDto faqDto)
        {
            var faq = new Faq
            {
                Question = faqDto.Question,
                Answer = faqDto.Answer,
                Category = faqDto.Category,
                SortOrder = faqDto.SortOrder,
                IsPublished = faqDto.IsPublished,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Faqs.AddAsync(faq);
            await _context.SaveChangesAsync();

            return new FaqDto
            {
                Id = faq.Id,
                Question = faq.Question,
                Answer = faq.Answer,
                Category = faq.Category,
                SortOrder = faq.SortOrder
            };
        }

        public async Task<FaqDto> UpdateFaqAsync(int id, UpdateFaqDto faqDto)
        {
            var faq = await _context.Faqs.FindAsync(id);

            if (faq == null)
                return null;

            faq.Question = faqDto.Question;
            faq.Answer = faqDto.Answer;
            faq.Category = faqDto.Category;
            faq.SortOrder = faqDto.SortOrder;
            faq.IsPublished = faqDto.IsPublished;
            faq.UpdatedAt = DateTime.UtcNow;

            _context.Faqs.Update(faq);
            await _context.SaveChangesAsync();

            return new FaqDto
            {
                Id = faq.Id,
                Question = faq.Question,
                Answer = faq.Answer,
                Category = faq.Category,
                SortOrder = faq.SortOrder
            };
        }

        public async Task<bool> DeleteFaqAsync(int id)
        {
            var faq = await _context.Faqs.FindAsync(id);

            if (faq == null)
                return false;

            _context.Faqs.Remove(faq);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
