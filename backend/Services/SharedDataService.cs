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
        public async Task<string> SaveSharedDataAsync(SharedDataDto data, int? currentEnvironmentId)
        {
            string shareId = Guid.NewGuid().ToString("N");
            var comprehensiveDataDto = new SharedDataDto();
            // Use the passed currentEnvironmentId instead of data.Environment?.Id
            int? targetEnvironmentId = currentEnvironmentId;

            // 1. Handle Environment if provided by ID (PRIORITY)
            if (targetEnvironmentId.HasValue && targetEnvironmentId.Value > 0)
            {
                var fullEnvironment = await _context.Environments
                                            .Include(e => e.Collections!)
                                                .ThenInclude(c => c.Requests!) // Include requests within collections
                                            .AsNoTracking()
                                            .FirstOrDefaultAsync(e => e.Id == targetEnvironmentId.Value);

                if (fullEnvironment != null)
                {
                    // Populate comprehensiveDataDto.Environment
                    comprehensiveDataDto.Environment = new EnvironmentDto
                    {
                        Id = fullEnvironment.Id, // Use the actual ID from the fetched entity
                        Name = fullEnvironment.Name ?? "Unnamed Environment",
                        IsActive = fullEnvironment.IsActive, // Use actual IsActive state
                        Variables = !string.IsNullOrEmpty(fullEnvironment.Variables)
                                    ? JsonSerializer.Deserialize<Dictionary<string, string>>(fullEnvironment.Variables) ?? new Dictionary<string, string>()
                                    : new Dictionary<string, string>(),
                        CreatedAt = fullEnvironment.CreatedAt,
                        UpdatedAt = fullEnvironment.UpdatedAt
                    };

                    // Populate comprehensiveDataDto.Collections ONLY with collections from THIS environment
                    comprehensiveDataDto.Collections = fullEnvironment.Collections?.Select(c => new CollectionDto
                    {
                        Id = c.Id,
                        Name = c.Name ?? "Unnamed Collection",
                        Description = c.Description,
                        EnvironmentId = c.EnvironmentId, // Keep the original EnvironmentId
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt,
                        // Map requests for each collection
                        Requests = c.Requests?.Select(r => new RequestDto
                        {
                            Id = r.Id,
                            CollectionId = r.CollectionId,
                            Name = r.Name ?? "Unnamed Request",
                            Description = r.Description,
                            Method = r.Method ?? "GET",
                            Url = r.Url ?? string.Empty,
                            Headers = !string.IsNullOrEmpty(r.Headers)
                                      ? JsonSerializer.Deserialize<Dictionary<string, string>>(r.Headers) ?? new Dictionary<string, string>()
                                      : new Dictionary<string, string>(),
                            AuthType = r.AuthType,
                            AuthConfig = !string.IsNullOrEmpty(r.AuthConfig)
                                         ? JsonSerializer.Deserialize<object>(r.AuthConfig)
                                         : null,
                            Params = !string.IsNullOrEmpty(r.Params)
                                     ? JsonSerializer.Deserialize<Dictionary<string, string>>(r.Params) ?? new Dictionary<string, string>()
                                     : new Dictionary<string, string>(),
                            Body = r.Body,
                            Tests = r.Tests,
                            IsFavorite = r.IsFavorite,
                            CreatedAt = r.CreatedAt,
                            UpdatedAt = r.UpdatedAt
                        }).ToList() ?? new List<RequestDto>()
                    }).ToList() ?? new List<CollectionDto>();

                    // Populate comprehensiveDataDto.Request (e.g., first request of first collection)
                    if (comprehensiveDataDto.Collections.Any())
                    {
                        var firstCollectionWithRequests = comprehensiveDataDto.Collections.FirstOrDefault(c => c.Requests != null && c.Requests.Any());
                        if (firstCollectionWithRequests != null)
                        {
                            comprehensiveDataDto.Request = firstCollectionWithRequests.Requests.First();
                        }
                    }
                    // If a specific environment is targeted, don't process separate collections or requests from input 'data'
                    data.Collections = null; // Prevent fallback logic below
                    data.Request = null;     // Prevent fallback logic below
                }
            }
            // 2. Handle Collections if provided by ID (ONLY if no specific environment was targeted above)
            else if (data.Collections != null && data.Collections.Any())
            {
                // ... (existing logic for handling collections by ID) ...
                // This part assumes the frontend sent only relevant collection IDs.
                // Fetch only the specified collections.
                comprehensiveDataDto.Collections = new List<CollectionDto>();
                int? associatedEnvironmentId = null;
                var allRequests = new List<RequestDto>();

                foreach (var collectionDto in data.Collections)
                {
                    // Fetch the full collection with requests
                    var fullCollection = await _context.Collections
                                                .Include(c => c.Requests!)
                                                .AsNoTracking()
                                                .FirstOrDefaultAsync(c => c.Id == collectionDto.Id); // Assuming collectionDto has Id

                    if (fullCollection != null)
                    {
                        // Convert request entities to DTOs
                        var requestDtos = fullCollection.Requests?.Select(r => new RequestDto
                        {
                            Id = r.Id,
                            CollectionId = r.CollectionId,
                            Name = r.Name ?? "Unnamed Request",
                            Description = r.Description,
                            Method = r.Method ?? "GET",
                            Url = r.Url ?? string.Empty,
                            Headers = !string.IsNullOrEmpty(r.Headers)
                                      ? JsonSerializer.Deserialize<Dictionary<string, string>>(r.Headers) ?? new Dictionary<string, string>()
                                      : new Dictionary<string, string>(),
                            AuthType = r.AuthType,
                            AuthConfig = !string.IsNullOrEmpty(r.AuthConfig)
                                         ? JsonSerializer.Deserialize<object>(r.AuthConfig)
                                         : null,
                            Params = !string.IsNullOrEmpty(r.Params)
                                     ? JsonSerializer.Deserialize<Dictionary<string, string>>(r.Params) ?? new Dictionary<string, string>()
                                     : new Dictionary<string, string>(),
                            Body = r.Body,
                            Tests = r.Tests,
                            IsFavorite = r.IsFavorite,
                            CreatedAt = r.CreatedAt,
                            UpdatedAt = r.UpdatedAt
                        }).ToList() ?? new List<RequestDto>();

                        // Add requests to our comprehensive list
                        if (requestDtos.Any())
                        {
                            allRequests.AddRange(requestDtos);
                        }

                        comprehensiveDataDto.Collections.Add(new CollectionDto
                        {
                            Id = fullCollection.Id,
                            Name = fullCollection.Name ?? "Unnamed Collection",
                            Description = fullCollection.Description,
                            EnvironmentId = fullCollection.EnvironmentId,
                            CreatedAt = fullCollection.CreatedAt,
                            UpdatedAt = fullCollection.UpdatedAt,
                            Requests = requestDtos
                        });

                        // Capture the environment ID if associated with this collection
                        if (fullCollection.EnvironmentId.HasValue && fullCollection.EnvironmentId.Value > 0)
                        {
                            // If multiple collections have different environment IDs, this might pick the last one.
                            // Ideally, frontend should only send collections from the *same* environment here.
                            associatedEnvironmentId = fullCollection.EnvironmentId.Value;
                        }
                    }
                }
                // Set the first request as the active request in the DTO (if any exist)
                if (allRequests.Any())
                {
                    comprehensiveDataDto.Request = allRequests.First();
                }
                // If collections were processed and an associated environment ID was found, fetch the environment details
                if (associatedEnvironmentId.HasValue && comprehensiveDataDto.Environment == null) // Only fetch if Environment wasn't already populated
                {
                    var associatedEnvironment = await _context.Environments
                                                       .AsNoTracking()
                                                       .FirstOrDefaultAsync(e => e.Id == associatedEnvironmentId.Value);

                    if (associatedEnvironment != null)
                    {
                        comprehensiveDataDto.Environment = new EnvironmentDto
                        {
                            Id = associatedEnvironment.Id,
                            Name = associatedEnvironment.Name ?? "Unnamed Environment",
                            IsActive = associatedEnvironment.IsActive,
                            Variables = !string.IsNullOrEmpty(associatedEnvironment.Variables)
                                        ? JsonSerializer.Deserialize<Dictionary<string, string>>(associatedEnvironment.Variables) ?? new Dictionary<string, string>()
                                        : new Dictionary<string, string>(),
                            CreatedAt = associatedEnvironment.CreatedAt,
                            UpdatedAt = associatedEnvironment.UpdatedAt
                        };
                    }
                }
                // Prevent fallback logic for single request
                data.Request = null;
            }
            // 3. Handle single Request if provided by ID (ONLY if no environment or collections were targeted)
            else if (data.Request != null && data.Request.Id > 0) // Assuming RequestDto has Id
            {
                // ... (existing logic for handling single request) ...
                var fullRequest = await _context.Requests
                                          .AsNoTracking()
                                          .FirstOrDefaultAsync(r => r.Id == data.Request.Id);

                if (fullRequest != null)
                {
                    comprehensiveDataDto.Request = new RequestDto
                    {
                        Id = fullRequest.Id,
                        CollectionId = fullRequest.CollectionId,
                        Name = fullRequest.Name ?? "Unnamed Request",
                        Description = fullRequest.Description,
                        Method = fullRequest.Method ?? "GET",
                        Url = fullRequest.Url ?? string.Empty,
                        Headers = !string.IsNullOrEmpty(fullRequest.Headers)
                                  ? JsonSerializer.Deserialize<Dictionary<string, string>>(fullRequest.Headers) ?? new Dictionary<string, string>()
                                  : new Dictionary<string, string>(),
                        AuthType = fullRequest.AuthType,
                        AuthConfig = !string.IsNullOrEmpty(fullRequest.AuthConfig)
                                     ? JsonSerializer.Deserialize<object>(fullRequest.AuthConfig)
                                     : null,
                        Params = !string.IsNullOrEmpty(fullRequest.Params)
                                 ? JsonSerializer.Deserialize<Dictionary<string, string>>(fullRequest.Params) ?? new Dictionary<string, string>()
                                 : new Dictionary<string, string>(),
                        Body = fullRequest.Body,
                        Tests = fullRequest.Tests,
                        IsFavorite = fullRequest.IsFavorite, // Keep original favorite status? Or default to false?
                        CreatedAt = fullRequest.CreatedAt,
                        UpdatedAt = fullRequest.UpdatedAt
                    };

                    // Try to fetch associated collection and environment if request has CollectionId
                    if (fullRequest.CollectionId.HasValue)
                    {
                        var parentCollection = await _context.Collections
                                                    .Include(c => c.Environment) // Include environment if needed
                                                    .AsNoTracking()
                                                    .FirstOrDefaultAsync(c => c.Id == fullRequest.CollectionId.Value);
                        if (parentCollection != null)
                        {
                            // Optionally add collection info (though not strictly needed if only request is shared)
                            // comprehensiveDataDto.Collections = new List<CollectionDto> { /* map parentCollection */ };

                            // Fetch and add environment info if it exists and wasn't added already
                            if (parentCollection.EnvironmentId.HasValue && comprehensiveDataDto.Environment == null)
                            {
                                var env = parentCollection.Environment; // Use included environment
                                if (env == null) // If not included, fetch separately
                                {
                                    env = await _context.Environments.AsNoTracking().FirstOrDefaultAsync(e => e.Id == parentCollection.EnvironmentId.Value);
                                }

                                if (env != null)
                                {
                                    comprehensiveDataDto.Environment = new EnvironmentDto
                                    {
                                        Id = env.Id,
                                        Name = env.Name ?? "Unnamed Environment",
                                        IsActive = env.IsActive,
                                        Variables = !string.IsNullOrEmpty(env.Variables)
                                                    ? JsonSerializer.Deserialize<Dictionary<string, string>>(env.Variables) ?? new Dictionary<string, string>()
                                                    : new Dictionary<string, string>(),
                                        CreatedAt = env.CreatedAt,
                                        UpdatedAt = env.UpdatedAt
                                    };
                                }
                            }
                        }
                    }
                }
            }

            // 4. Handle History (seems independent, keep as is)
            if (data.History != null && data.History.Any())
            {
                comprehensiveDataDto.History = data.History;
            }

            // Final check and serialization
            string jsonDataToSave;
            // Ensure Request is populated if possible (e.g., from first collection) only if not set already
            if (comprehensiveDataDto.Request == null && comprehensiveDataDto.Collections != null && comprehensiveDataDto.Collections.Any())
            {
                var firstCollectionWithRequests = comprehensiveDataDto.Collections.FirstOrDefault(c => c.Requests != null && c.Requests.Any());
                if (firstCollectionWithRequests != null)
                {
                    comprehensiveDataDto.Request = firstCollectionWithRequests.Requests.First();
                }
            }
            // Ensure Environment is populated if possible (e.g., from first collection's envId) only if not set already
            if (comprehensiveDataDto.Environment == null && comprehensiveDataDto.Collections != null && comprehensiveDataDto.Collections.Any())
            {
                var envId = comprehensiveDataDto.Collections.FirstOrDefault(c => c.EnvironmentId.HasValue)?.EnvironmentId;
                if (envId.HasValue)
                {
                    // Avoid fetching again if already fetched during collection processing
                    var env = await _context.Environments
                                    .AsNoTracking()
                                    .FirstOrDefaultAsync(e => e.Id == envId.Value);
                    if (env != null)
                    {
                        comprehensiveDataDto.Environment = new EnvironmentDto
                        {
                            Id = env.Id,
                            Name = env.Name ?? "Unnamed Environment",
                            IsActive = env.IsActive, // Use actual IsActive state
                            Variables = !string.IsNullOrEmpty(env.Variables)
                                        ? JsonSerializer.Deserialize<Dictionary<string, string>>(env.Variables) ?? new Dictionary<string, string>()
                                        : new Dictionary<string, string>(),
                            CreatedAt = env.CreatedAt,
                            UpdatedAt = env.UpdatedAt
                        };
                    }
                }
            }


            jsonDataToSave = JsonSerializer.Serialize(comprehensiveDataDto);

            var sharedDataEntity = new SharedData
            {
                ShareId = shareId,
                DataJson = jsonDataToSave,
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

            // First, save environment if available (to get its ID for collections)
            int? newEnvironmentId = null;
            if (sharedDataDto.Environment != null)
            {
                // Check if user already has an environment with this name to avoid duplicates
                var existingEnv = await _context.Environments
                    .FirstOrDefaultAsync(e => e.UserId == userId && e.Name == sharedDataDto.Environment.Name);

                if (existingEnv == null)
                {
                    var newEnvironment = new EnvironmentConfig
                    {
                        UserId = userId,
                        Name = sharedDataDto.Environment.Name,
                        IsActive = true, // Set as active since it's the current environment being imported
                        Variables = sharedDataDto.Environment.Variables != null
                            ? JsonSerializer.Serialize(sharedDataDto.Environment.Variables)
                            : null,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Environments.Add(newEnvironment);
                    await _context.SaveChangesAsync(); // Save immediately to get the ID
                    newEnvironmentId = newEnvironment.Id;
                }
                else
                {
                    newEnvironmentId = existingEnv.Id;
                }
            }            // Process and save shared data based on its content
            if (sharedDataDto.Request != null)
            {
                Console.WriteLine($"Creating standalone request: '{sharedDataDto.Request.Name}' ({sharedDataDto.Request.Method} {sharedDataDto.Request.Url})");
                var newRequest = new Request
                {
                    UserId = userId,
                    // Make sure CollectionId is properly set if it exists
                    CollectionId = sharedDataDto.Request.CollectionId,
                    Method = sharedDataDto.Request.Method,
                    Url = sharedDataDto.Request.Url,
                    Name = sharedDataDto.Request.Name,
                    Description = sharedDataDto.Request.Description,
                    Headers = sharedDataDto.Request.Headers != null ? JsonSerializer.Serialize(sharedDataDto.Request.Headers) : null,
                    Body = sharedDataDto.Request.Body,
                    AuthType = sharedDataDto.Request.AuthType,
                    AuthConfig = sharedDataDto.Request.AuthConfig != null ? JsonSerializer.Serialize(sharedDataDto.Request.AuthConfig) : null,
                    Params = sharedDataDto.Request.Params != null ? JsonSerializer.Serialize(sharedDataDto.Request.Params) : null,
                    Tests = sharedDataDto.Request.Tests,
                    IsFavorite = false, // Default to not favorite for imported requests
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Requests.Add(newRequest);
                await _context.SaveChangesAsync(); // Save immediately
                Console.WriteLine($"Saved standalone request with ID: {newRequest.Id}");
            }
            if (sharedDataDto.Collections != null && sharedDataDto.Collections.Any())
            {
                Console.WriteLine($"Processing {sharedDataDto.Collections.Count} collections");

                foreach (var collectionDto in sharedDataDto.Collections)
                {
                    // Check if this collection already exists for this user
                    var existingCollection = await _context.Collections
                        .FirstOrDefaultAsync(c => c.UserId == userId && c.Name == collectionDto.Name);

                    if (existingCollection != null)
                    {
                        Console.WriteLine($"Collection {collectionDto.Name} already exists, updating environment ID");
                        // Update the existing collection to use the new environment ID
                        if (newEnvironmentId.HasValue)
                        {
                            existingCollection.EnvironmentId = newEnvironmentId;
                            _context.Collections.Update(existingCollection);
                            await _context.SaveChangesAsync();
                        }
                        continue; // Skip the rest of creation
                    }

                    Console.WriteLine($"Creating new collection {collectionDto.Name}");
                    var newCollection = new Collection
                    {
                        UserId = userId,
                        Name = collectionDto.Name,
                        Description = collectionDto.Description,
                        // Use the newly created environment ID instead of the original one
                        EnvironmentId = newEnvironmentId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Requests = new List<Request>() // Initialize Requests list
                    };

                    _context.Collections.Add(newCollection);
                    await _context.SaveChangesAsync(); // Save to get the collection ID                    
                    // Add requests to this collection
                    if (collectionDto.Requests != null && collectionDto.Requests.Any())
                    {
                        Console.WriteLine($"Adding {collectionDto.Requests.Count} requests to collection {newCollection.Id}");
                        foreach (var requestDto in collectionDto.Requests)
                        {
                            Console.WriteLine($"Creating request: '{requestDto.Name}' ({requestDto.Method} {requestDto.Url}) for collection {newCollection.Id}");
                            var newRequest = new Request
                            {
                                CollectionId = newCollection.Id,
                                UserId = userId,
                                Name = requestDto.Name,
                                Description = requestDto.Description,
                                Method = requestDto.Method,
                                Url = requestDto.Url,
                                Headers = requestDto.Headers != null ? JsonSerializer.Serialize(requestDto.Headers) : null,
                                AuthType = requestDto.AuthType,
                                AuthConfig = requestDto.AuthConfig != null ? JsonSerializer.Serialize(requestDto.AuthConfig) : null,
                                Params = requestDto.Params != null ? JsonSerializer.Serialize(requestDto.Params) : null,
                                Body = requestDto.Body,
                                Tests = requestDto.Tests,
                                IsFavorite = false, // Default to not favorite
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            }; _context.Requests.Add(newRequest);
                        }
                        // Save requests for this collection immediately to ensure they are persisted
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"Saved {collectionDto.Requests.Count} requests for collection {newCollection.Id}");
                    }
                }
            }

            // Save any remaining changes
            await _context.SaveChangesAsync();
            Console.WriteLine("Data association completed successfully");
        }
    }
}