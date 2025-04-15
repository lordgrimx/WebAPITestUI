using Microsoft.EntityFrameworkCore;
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
                var environments = await _dbContext.EnvironmentVariables
                    .Where(e => e.UserId == userId)
                    .OrderBy(e => e.Name)
                    .Select(e => new EnvironmentDto
                    {
                        Id = e.Id,
                        Name = e.Name,
                        IsActive = e.IsActive,
                        Variables = e.Variables,
                        CreatedAt = e.CreatedAt,
                        UpdatedAt = e.UpdatedAt
                    })
                    .ToListAsync();

                return environments;
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
                var environment = await _dbContext.EnvironmentVariables
                    .Where(e => e.UserId == userId && e.IsActive)
                    .Select(e => new EnvironmentDto
                    {
                        Id = e.Id,
                        Name = e.Name,
                        IsActive = e.IsActive,
                        Variables = e.Variables,
                        CreatedAt = e.CreatedAt,
                        UpdatedAt = e.UpdatedAt
                    })
                    .FirstOrDefaultAsync();

                return environment;
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
                var environment = await _dbContext.EnvironmentVariables
                    .Where(e => e.Id == id && e.UserId == userId)
                    .Select(e => new EnvironmentDto
                    {
                        Id = e.Id,
                        Name = e.Name,
                        IsActive = e.IsActive,
                        Variables = e.Variables,
                        CreatedAt = e.CreatedAt,
                        UpdatedAt = e.UpdatedAt
                    })
                    .FirstOrDefaultAsync();

                return environment;
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
                var environment = new EnvironmentVariable
                {
                    Name = model.Name,
                    Variables = model.Variables ?? new Dictionary<string, string>(),
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

                _dbContext.EnvironmentVariables.Add(environment);
                await _dbContext.SaveChangesAsync();

                return new EnvironmentDto
                {
                    Id = environment.Id,
                    Name = environment.Name,
                    IsActive = environment.IsActive,
                    Variables = environment.Variables,
                    CreatedAt = environment.CreatedAt,
                    UpdatedAt = environment.UpdatedAt
                };
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
                var environment = await _dbContext.EnvironmentVariables
                    .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

                if (environment == null)
                {
                    return null;
                }

                if (!string.IsNullOrEmpty(model.Name))
                {
                    environment.Name = model.Name;
                }

                if (model.Variables != null)
                {
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

                return new EnvironmentDto
                {
                    Id = environment.Id,
                    Name = environment.Name,
                    IsActive = environment.IsActive,
                    Variables = environment.Variables,
                    CreatedAt = environment.CreatedAt,
                    UpdatedAt = environment.UpdatedAt
                };
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
                var environment = await _dbContext.EnvironmentVariables
                    .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

                if (environment == null)
                {
                    return false;
                }

                _dbContext.EnvironmentVariables.Remove(environment);
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
                var environment = await _dbContext.EnvironmentVariables
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
            var environments = await _dbContext.EnvironmentVariables
                .Where(e => e.UserId == userId && e.IsActive)
                .ToListAsync();

            foreach (var env in environments)
            {
                env.IsActive = false;
                env.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
