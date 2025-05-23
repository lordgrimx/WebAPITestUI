using Microsoft.EntityFrameworkCore;
using System.Text.Json; // Added for JSON handling
using WebTestUI.Backend.Data;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class EnvironmentService : IEnvironmentService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<EnvironmentService> _logger;

        public EnvironmentService(
            ApplicationDbContext dbContext,
            ILogger<EnvironmentService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<IEnumerable<EnvironmentDto>> GetUserEnvironmentsAsync(string userId)
        {
            try
            {
                var environments = await _dbContext.Environments // Corrected DbSet name
                    .Where(e => e.UserId == userId)
                    .OrderBy(e => e.Name)
                    .ToListAsync(); // Fetch entities first

                // Map entities to DTOs using the helper method
                return environments.Select(MapToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı ortamları alınırken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        public async Task<EnvironmentDto> GetActiveEnvironmentAsync(string userId)
        {
            try
            {
                var environment = await _dbContext.Environments // Corrected DbSet name
                    .Where(e => e.UserId == userId && e.IsActive)
                    .FirstOrDefaultAsync(); // Fetch entity first

                // Map entity to DTO using the helper method, handle null case
                return environment == null ? null : MapToDto(environment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Aktif ortam alınırken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        public async Task<EnvironmentDto> GetEnvironmentByIdAsync(int id, string userId)
        {
            try
            {
                var environment = await _dbContext.Environments // Corrected DbSet name
                    .Where(e => e.Id == id && e.UserId == userId)
                    .FirstOrDefaultAsync(); // Fetch entity first

                // Map entity to DTO using the helper method, handle null case
                return environment == null ? null : MapToDto(environment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortam alınırken bir hata oluştu: {EnvironmentId}, {UserId}", id, userId);
                throw;
            }
        }

        public async Task<EnvironmentDto> CreateEnvironmentAsync(CreateEnvironmentDto model, string userId)
        {
            try
            {
                // Serialize the dictionary to JSON string for storage
                var variablesJson = JsonSerializer.Serialize(model.Variables ?? new Dictionary<string, string>());

                var environment = new EnvironmentConfig
                {
                    Name = model.Name,
                    Variables = variablesJson, // Store as JSON string
                    IsActive = model.IsActive,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                if (environment.IsActive)
                {
                    // Aktif edilecekse diğerleri pasif olmalı
                    await DeactivateAllEnvironmentsAsync(userId);
                }

                _dbContext.Environments.Add(environment); // Corrected DbSet name
                await _dbContext.SaveChangesAsync();

                // Map the created entity back to DTO using helper
                return MapToDto(environment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortam oluşturulurken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        public async Task<EnvironmentDto> UpdateEnvironmentAsync(int id, UpdateEnvironmentDto model, string userId)
        {
            try
            {
                var environment = await _dbContext.Environments // Corrected DbSet name
                    .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

                if (environment == null)
                {
                    return null;
                }

                if (!string.IsNullOrEmpty(model.Name))
                {
                    environment.Name = model.Name;
                }

                // model.Variables is now a string (JSON string from frontend)
                if (model.Variables != null) 
                {
                    // Directly assign the JSON string, no need to re-serialize
                    environment.Variables = model.Variables; 
                }

                if (model.IsActive.HasValue && model.IsActive.Value && !environment.IsActive)
                {
                    // Aktif edilecekse diğerleri pasif olmalı
                    await DeactivateAllEnvironmentsAsync(userId);
                    environment.IsActive = true;
                }
                else if (model.IsActive.HasValue)
                {
                    environment.IsActive = model.IsActive.Value;
                }

                environment.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                // Map the updated entity back to DTO using helper
                return MapToDto(environment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortam güncellenirken bir hata oluştu: {EnvironmentId}, {UserId}", id, userId);
                throw;
            }
        }

        public async Task<bool> DeleteEnvironmentAsync(int id, string userId)
        {
            try
            {
                var environment = await _dbContext.Environments // Corrected DbSet name
                    .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

                if (environment == null)
                {
                    return false;
                }

                _dbContext.Environments.Remove(environment); // Corrected DbSet name
                await _dbContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortam silinirken bir hata oluştu: {EnvironmentId}, {UserId}", id, userId);
                throw;
            }
        }

        public async Task<bool> ActivateEnvironmentAsync(int id, string userId)
        {
            try
            {
                var environment = await _dbContext.Environments // Corrected DbSet name
                    .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

                if (environment == null)
                {
                    return false;
                }

                // Önce tüm ortamları devre dışı bırak
                await DeactivateAllEnvironmentsAsync(userId);

                // Sonra bu ortamı aktifleştir
                environment.IsActive = true;
                environment.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ortam aktifleştirilirken bir hata oluştu: {EnvironmentId}, {UserId}", id, userId);
                throw;
            }
        }

        private async Task DeactivateAllEnvironmentsAsync(string userId)
        {
            var environments = await _dbContext.Environments // Corrected DbSet name
                .Where(e => e.UserId == userId && e.IsActive)
                .ToListAsync();

            foreach (var env in environments)
            {
                env.IsActive = false;
                env.UpdatedAt = DateTime.UtcNow;
            }
        }

        // Helper method to map EnvironmentConfig entity to EnvironmentDto
        private EnvironmentDto MapToDto(EnvironmentConfig environment)
        {
            // Deserialize JSON string to Dictionary for the DTO
            var variablesDict = new Dictionary<string, string>();
            if (!string.IsNullOrEmpty(environment.Variables))
            {
                try
                {
                    // Ensure null is handled gracefully, returning an empty dictionary
                    variablesDict = JsonSerializer.Deserialize<Dictionary<string, string>>(environment.Variables)
                                    ?? new Dictionary<string, string>();
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to deserialize Environment Variables for ID {EnvironmentId}. Variables string: {Variables}", environment.Id, environment.Variables);
                    // Return empty dictionary or handle error as appropriate for your application
                    variablesDict = new Dictionary<string, string>();
                }
            }

            return new EnvironmentDto
            {
                Id = environment.Id,
                Name = environment.Name,
                IsActive = environment.IsActive,
                Variables = variablesDict, // Use deserialized dictionary
                CreatedAt = environment.CreatedAt,
                UpdatedAt = environment.UpdatedAt
            };
        }
    }
}
