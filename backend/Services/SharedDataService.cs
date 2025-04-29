using System;
using System.Collections.Concurrent; // Can be removed if fully switching to DB
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;
using WebTestUI.Backend.Data;
using Microsoft.EntityFrameworkCore;
using WebTestUI.Backend.Data.Entities;
using System.Text.Json;

namespace WebTestUI.Backend.Services
{
    public class SharedDataService : ISharedDataService
    {
        private readonly ApplicationDbContext _context;

        public SharedDataService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> SaveSharedDataAsync(SharedDataDto data)
        {
            string shareId = Guid.NewGuid().ToString("N");
            string jsonDataToSave;

            // Check if an Environment is being shared and needs expansion
            if (data.Environment != null && data.Environment.Id > 0 && (data.Collections == null || !data.Collections.Any()))
            {
                // Fetch the full environment, its collections, and their requests
                var environmentId = data.Environment.Id;
                var fullEnvironment = await _context.Environments
                                            .Include(e => e.Collections!) // Ensure Collections is not null
                                                .ThenInclude(c => c.Requests!) // Ensure Requests is not null
                                            .AsNoTracking() // Use AsNoTracking for read-only operation
                                            .FirstOrDefaultAsync(e => e.Id == environmentId);

                if (fullEnvironment != null)
                {
                    // Map the fetched entities to a comprehensive DTO
                    var comprehensiveDataDto = new SharedDataDto
                    {
                        Environment = new EnvironmentDto // Map EnvironmentConfig to EnvironmentDto
                        {
                            Id = fullEnvironment.Id,
                            Name = fullEnvironment.Name ?? "Unnamed Environment", // Handle potential null Name
                            IsActive = fullEnvironment.IsActive,
                            Variables = !string.IsNullOrEmpty(fullEnvironment.Variables)
                                        ? JsonSerializer.Deserialize<Dictionary<string, string>>(fullEnvironment.Variables) ?? new Dictionary<string, string>()
                                        : new Dictionary<string, string>(),
                            CreatedAt = fullEnvironment.CreatedAt,
                            UpdatedAt = fullEnvironment.UpdatedAt
                        },
                        Collections = fullEnvironment.Collections?.Select(c => new CollectionDto // Map Collection to CollectionDto
                        {
                            Id = c.Id,
                            Name = c.Name ?? "Unnamed Collection", // Handle potential null Name
                            Description = c.Description,
                            EnvironmentId = c.EnvironmentId,
                            CreatedAt = c.CreatedAt,
                            UpdatedAt = c.UpdatedAt,
                            Requests = c.Requests?.Select(r => new RequestDto // Map Request to RequestDto
                            {
                                Id = r.Id,
                                // UserId = r.UserId, // Don't share original UserId
                                CollectionId = r.CollectionId,
                                // CollectionName = c.Name, // Can be set if needed
                                Name = r.Name ?? "Unnamed Request", // Handle potential null Name
                                Description = r.Description,
                                Method = r.Method ?? "GET", // Handle potential null Method
                                Url = r.Url ?? string.Empty, // Handle potential null Url
                                Headers = !string.IsNullOrEmpty(r.Headers)
                                          ? JsonSerializer.Deserialize<Dictionary<string, string>>(r.Headers) ?? new Dictionary<string, string>()
                                          : new Dictionary<string, string>(),
                                AuthType = r.AuthType,
                                AuthConfig = !string.IsNullOrEmpty(r.AuthConfig)
                                             ? JsonSerializer.Deserialize<object>(r.AuthConfig) // Deserialize AuthConfig
                                             : null,
                                Params = !string.IsNullOrEmpty(r.Params)
                                         ? JsonSerializer.Deserialize<Dictionary<string, string>>(r.Params) ?? new Dictionary<string, string>()
                                         : new Dictionary<string, string>(),
                                Body = r.Body,
                                Tests = r.Tests,
                                IsFavorite = r.IsFavorite,
                                CreatedAt = r.CreatedAt,
                                UpdatedAt = r.UpdatedAt
                            }).ToList() ?? new List<RequestDto>() // Ensure list is not null
                        }).ToList() ?? new List<CollectionDto>() // Ensure list is not null
                        // Optionally add History if needed based on Environment/Collections
                    };
                    jsonDataToSave = JsonSerializer.Serialize(comprehensiveDataDto);
                }
                else
                {
                    // Environment not found, fallback to saving original data or handle error
                    jsonDataToSave = JsonSerializer.Serialize(data); // Fallback
                }
            }
            else
            {
                // If not sharing an environment or if collections are already provided, save the original DTO
                jsonDataToSave = JsonSerializer.Serialize(data);
            }


            var sharedDataEntity = new SharedData
            {
                ShareId = shareId,
                DataJson = jsonDataToSave, // Use the potentially expanded JSON
                CreatedAt = DateTime.UtcNow
            };

            _context.SharedData.Add(sharedDataEntity);
            await _context.SaveChangesAsync();

            return shareId;
        }

        public async Task<SharedDataDto?> GetSharedDataAsync(string shareId)
        {
            var sharedDataEntity = await _context.SharedData.FirstOrDefaultAsync(s => s.ShareId == shareId);

            if (sharedDataEntity == null)
            {
                return null;
            }

            try
            {
                var sharedDataDto = JsonSerializer.Deserialize<SharedDataDto>(sharedDataEntity.DataJson);
                return sharedDataDto;
            }
            catch (JsonException)
            {
                // Handle deserialization errors if necessary
                return null;
            }
        }

        public async Task AssociateSharedDataWithUserAsync(string userId, SharedDataDto sharedDataDto)
        {
            var user = await _context.Users.Include(u => u.Collections).Include(u => u.HistoryEntries).Include(u => u.Environments).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                // Handle case where user is not found
                return;
            }

            // Process and save shared data based on its content
            if (sharedDataDto.Request != null)
            {
                var newRequest = new Request
                {
                    UserId = userId,
                    Method = sharedDataDto.Request.Method,
                    Url = sharedDataDto.Request.Url,
                    Name = sharedDataDto.Request.Name,
                    Headers = sharedDataDto.Request.Headers != null ? JsonSerializer.Serialize(sharedDataDto.Request.Headers) : null,
                    Body = sharedDataDto.Request.Body,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Requests.Add(newRequest);
            }

            if (sharedDataDto.Collections != null && sharedDataDto.Collections.Any())
            {
                foreach (var collectionDto in sharedDataDto.Collections)
                {
                    var newCollection = new Collection
                    {
                        UserId = userId,
                        Name = collectionDto.Name,
                        Description = collectionDto.Description,
                        EnvironmentId = collectionDto.EnvironmentId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Requests = new List<Request>() // Initialize Requests list for the new collection
                    };

                    // Add the new collection to the context BEFORE processing requests to get its ID
                    _context.Collections.Add(newCollection);
                    // We might need to save changes here if we need the newCollection.Id immediately,
                    // or handle relationships differently. For simplicity, let's assume EF Core handles it.

                    // Now, process requests within this collection DTO
                    if (collectionDto.Requests != null && collectionDto.Requests.Any())
                    {
                        foreach (var requestDto in collectionDto.Requests)
                        {
                            var newRequest = new Request
                            {
                                // Link to the NEW collection and the importing user
                                CollectionId = newCollection.Id, // This might require SaveChanges beforehand or navigation property assignment
                                UserId = userId,
                                // Copy other request properties
                                Method = requestDto.Method,
                                Url = requestDto.Url,
                                Name = requestDto.Name,
                                Headers = requestDto.Headers != null ? JsonSerializer.Serialize(requestDto.Headers) : null,
                                Body = requestDto.Body,
                                // AuthType = requestDto.AuthType, // Add if AuthType exists in RequestDto
                                // AuthConfig = requestDto.AuthConfig != null ? JsonSerializer.Serialize(requestDto.AuthConfig) : null, // Add if AuthConfig exists
                                // Params = requestDto.Params != null ? JsonSerializer.Serialize(requestDto.Params) : null, // Add if Params exists
                                // Tests = requestDto.Tests, // Add if Tests exists
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            // Add the new request to the context
                             _context.Requests.Add(newRequest);
                             // Alternatively, if using navigation properties:
                             // newCollection.Requests.Add(newRequest);
                        }
                    }
                }
            }

            if (sharedDataDto.Environment != null)
            {
                var newEnvironment = new EnvironmentConfig
                {
                    UserId = userId,
                    Name = sharedDataDto.Environment.Name,
                    Variables = sharedDataDto.Environment.Variables != null ? JsonSerializer.Serialize(sharedDataDto.Environment.Variables) : null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Environments.Add(newEnvironment);
            }

            if (sharedDataDto.History != null && sharedDataDto.History.Any())
            {
                foreach (var historyItemDto in sharedDataDto.History)
                {
                    var newRequest = new Request
                    {
                        UserId = userId,
                        Method = historyItemDto.Method,
                        Url = historyItemDto.Url,
                        Name = historyItemDto.RequestName,
                        Headers = historyItemDto.RequestHeaders != null ? JsonSerializer.Serialize(historyItemDto.RequestHeaders) : null,
                        Body = historyItemDto.RequestBody,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Requests.Add(newRequest);
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}