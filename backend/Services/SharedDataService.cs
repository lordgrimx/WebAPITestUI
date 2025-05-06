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
                            EnvironmentId = c.EnvironmentId, // Added to populate EnvironmentId from the parent collection
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
                            EnvironmentId = fullCollection.EnvironmentId ?? targetEnvironmentId, // MODIFIED: Fallback to targetEnvironmentId
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
                    int? requestEnvironmentId = null;
                    if (fullRequest.CollectionId.HasValue)
                    {
                        var parentCollectionForEnv = await _context.Collections
                                                        .AsNoTracking()
                                                        .FirstOrDefaultAsync(c => c.Id == fullRequest.CollectionId.Value);
                        if (parentCollectionForEnv != null && parentCollectionForEnv.EnvironmentId.HasValue)
                        {
                            requestEnvironmentId = parentCollectionForEnv.EnvironmentId;
                        }
                    }
                    // Fallback to the sharer's current environment ID if not found from collection
                    requestEnvironmentId = requestEnvironmentId ?? targetEnvironmentId;

                    comprehensiveDataDto.Request = new RequestDto
                    {
                        Id = fullRequest.Id,
                        CollectionId = fullRequest.CollectionId,
                        EnvironmentId = requestEnvironmentId, // MODIFIED: Set determined EnvironmentId
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
                    // Ensure the top-level Environment DTO is populated if not already and we have a requestEnvironmentId
                    if (comprehensiveDataDto.Environment == null && requestEnvironmentId.HasValue)
                    {
                        var envToSetForDto = await _context.Environments.AsNoTracking().FirstOrDefaultAsync(e => e.Id == requestEnvironmentId.Value);
                        if (envToSetForDto != null)
                        {
                            comprehensiveDataDto.Environment = new EnvironmentDto
                            {
                                Id = envToSetForDto.Id,
                                Name = envToSetForDto.Name ?? "Unnamed Environment",
                                IsActive = envToSetForDto.IsActive,
                                Variables = !string.IsNullOrEmpty(envToSetForDto.Variables)
                                            ? JsonSerializer.Deserialize<Dictionary<string, string>>(envToSetForDto.Variables) ?? new Dictionary<string, string>()
                                            : new Dictionary<string, string>(),
                                CreatedAt = envToSetForDto.CreatedAt,
                                UpdatedAt = envToSetForDto.UpdatedAt
                            };
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
                return;
            }

            int? newEnvironmentId = null;
            EnvironmentConfig? importerEnvironment = null;

            if (sharedDataDto.Environment != null)
            {
                importerEnvironment = await _context.Environments
                    .FirstOrDefaultAsync(e => e.UserId == userId && e.Name == sharedDataDto.Environment.Name);

                if (importerEnvironment == null)
                {
                    var newEnvironmentEntity = new EnvironmentConfig
                    {
                        UserId = userId,
                        Name = sharedDataDto.Environment.Name,
                        IsActive = true,
                        Variables = sharedDataDto.Environment.Variables != null
                            ? JsonSerializer.Serialize(sharedDataDto.Environment.Variables)
                            : null,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Environments.Add(newEnvironmentEntity);
                    await _context.SaveChangesAsync();
                    newEnvironmentId = newEnvironmentEntity.Id;
                    importerEnvironment = newEnvironmentEntity;
                }
                else
                {
                    newEnvironmentId = importerEnvironment.Id;
                }
            }

            Request? preparedStandaloneRequestEntity = null;

            if (sharedDataDto.Request != null)
            {
                preparedStandaloneRequestEntity = new Request
                {
                    UserId = userId,
                    CollectionId = null,
                    EnvironmentId = newEnvironmentId,
                    Name = sharedDataDto.Request.Name,
                    Description = sharedDataDto.Request.Description,
                    Method = sharedDataDto.Request.Method,
                    Url = sharedDataDto.Request.Url,
                    Headers = sharedDataDto.Request.Headers != null ? JsonSerializer.Serialize(sharedDataDto.Request.Headers) : null,
                    Body = sharedDataDto.Request.Body,
                    AuthType = sharedDataDto.Request.AuthType,
                    AuthConfig = sharedDataDto.Request.AuthConfig != null ? JsonSerializer.Serialize(sharedDataDto.Request.AuthConfig) : null,
                    Params = sharedDataDto.Request.Params != null ? JsonSerializer.Serialize(sharedDataDto.Request.Params) : null,
                    Tests = sharedDataDto.Request.Tests,
                    IsFavorite = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Requests.Add(preparedStandaloneRequestEntity);
                Console.WriteLine($"Prepared standalone request: '{preparedStandaloneRequestEntity.Name}' (Original Shared ID: {sharedDataDto.Request.Id})");
            }

            if (sharedDataDto.History != null && sharedDataDto.History.Any())
            {
                Console.WriteLine($"Processing {sharedDataDto.History.Count} history entries for user {userId}");
                foreach (var historyDto in sharedDataDto.History)
                {
                    var historyEntity = new History
                    {
                        UserId = userId,
                        RequestId = null, // Or try to find/link if necessary
                        EnvironmentId = newEnvironmentId,
                        Method = historyDto.Method,
                        Url = historyDto.Url,
                        Status = historyDto.StatusCode,
                        Duration = historyDto.Duration,
                        ResponseSize = historyDto.Size,
                        Response = historyDto.ResponseBody,
                        RequestHeaders = historyDto.RequestHeaders != null ? JsonSerializer.Serialize(historyDto.RequestHeaders) : null,
                        RequestBody = historyDto.RequestBody,
                        Timestamp = historyDto.Timestamp != default ? historyDto.Timestamp : DateTime.UtcNow // Ensure timestamp is valid
                    };
                    _context.HistoryEntries.Add(historyEntity);
                    Console.WriteLine($"Prepared history entry: {historyEntity.Method} {historyEntity.Url} (Timestamp: {historyEntity.Timestamp})");
                }
            }

            if (sharedDataDto.Collections != null && sharedDataDto.Collections.Any())
            {
                Console.WriteLine($"Processing {sharedDataDto.Collections.Count} collections for user {userId}");

                foreach (var collectionDto in sharedDataDto.Collections)
                {
                    Collection? importerCollection = await _context.Collections
                        .FirstOrDefaultAsync(c => c.UserId == userId && c.Name == collectionDto.Name);
                    int currentImporterCollectionId;

                    if (importerCollection == null)
                    {
                        importerCollection = new Collection
                        {
                            UserId = userId,
                            Name = collectionDto.Name,
                            Description = collectionDto.Description,
                            EnvironmentId = newEnvironmentId,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                            Requests = new List<Request>()
                        };
                        _context.Collections.Add(importerCollection);
                        await _context.SaveChangesAsync();
                        currentImporterCollectionId = importerCollection.Id;
                        Console.WriteLine($"Created new collection '{importerCollection.Name}' with ID {currentImporterCollectionId} for user {userId}");
                    }
                    else
                    {
                        currentImporterCollectionId = importerCollection.Id;
                        if (newEnvironmentId.HasValue && importerCollection.EnvironmentId != newEnvironmentId)
                        {
                            importerCollection.EnvironmentId = newEnvironmentId;
                            _context.Collections.Update(importerCollection);
                        }
                        Console.WriteLine($"Using existing collection '{importerCollection.Name}' with ID {currentImporterCollectionId} for user {userId}");
                    }

                    if (collectionDto.Requests != null && collectionDto.Requests.Any())
                    {
                        Console.WriteLine($"Processing {collectionDto.Requests.Count} requests for collection '{importerCollection.Name}' (ID: {currentImporterCollectionId})");
                        foreach (var requestDto in collectionDto.Requests)
                        {
                            // Check if this requestDto matches the prepared standalone request by properties
                            // This is a more robust check than relying on potentially unstable IDs from shared data.
                            bool matchesStandalone = preparedStandaloneRequestEntity != null &&
                                                     requestDto.Name == preparedStandaloneRequestEntity.Name &&
                                                     requestDto.Method == preparedStandaloneRequestEntity.Method &&
                                                     requestDto.Url == preparedStandaloneRequestEntity.Url &&
                                                     requestDto.Body == preparedStandaloneRequestEntity.Body &&
                                                     requestDto.AuthType == preparedStandaloneRequestEntity.AuthType &&
                                                     // Compare serialized JSON strings for complex types.
                                                     // Note: This assumes consistent serialization order/formatting.
                                                     // A more robust comparison might involve deserializing and comparing dictionaries/objects.
                                                     JsonSerializer.Serialize(requestDto.AuthConfig) == JsonSerializer.Serialize(preparedStandaloneRequestEntity.AuthConfig) &&
                                                     JsonSerializer.Serialize(requestDto.Headers) == JsonSerializer.Serialize(preparedStandaloneRequestEntity.Headers) &&
                                                     JsonSerializer.Serialize(requestDto.Params) == JsonSerializer.Serialize(preparedStandaloneRequestEntity.Params) &&
                                                     requestDto.Tests == preparedStandaloneRequestEntity.Tests; // Assuming Tests is a simple type or string

                            if (matchesStandalone)
                            {
                                // If it's the standalone request, update its collection/environment info
                                preparedStandaloneRequestEntity.CollectionId = currentImporterCollectionId;
                                preparedStandaloneRequestEntity.EnvironmentId = importerCollection.EnvironmentId;
                                // No need to add to context again, it was added when prepared
                                Console.WriteLine($"Linked prepared standalone request '{preparedStandaloneRequestEntity.Name}' to collection ID {currentImporterCollectionId}");
                            }
                            else
                            {
                                // If it's not the standalone request (or no standalone was prepared), create and add a new one
                                var newApiRequest = new Request
                                {
                                    UserId = userId,
                                    CollectionId = currentImporterCollectionId,
                                    EnvironmentId = importerCollection.EnvironmentId,
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
                                    IsFavorite = requestDto.IsFavorite,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                };
                                _context.Requests.Add(newApiRequest);
                                Console.WriteLine($"Prepared new request '{newApiRequest.Name}' for collection ID {currentImporterCollectionId}");
                            }
                        }
                    }
                }
            }

            if (preparedStandaloneRequestEntity != null && preparedStandaloneRequestEntity.CollectionId == null)
            {
                Console.WriteLine($"Standalone request '{preparedStandaloneRequestEntity.Name}' was not linked to any imported collection.");
            }

            await _context.SaveChangesAsync();
            Console.WriteLine("Data association completed with batched saves.");
        }
    }
}
