using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.Data.Entities;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class RequestService : IRequestService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IHistoryService _historyService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<RequestService> _logger;

        public RequestService(
            ApplicationDbContext dbContext,
            IHistoryService historyService,
            IHttpClientFactory httpClientFactory,
            ILogger<RequestService> logger)
        {
            _dbContext = dbContext;
            _historyService = historyService;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<IEnumerable<RequestDto>> GetUserRequestsAsync(string userId)
        {
            try
            {
                var requests = await _dbContext.Requests
                    .Include(r => r.Collection)
                    .Where(r => r.UserId == userId)
                    .OrderByDescending(r => r.UpdatedAt)
                    .ToListAsync();

                return requests.Select(MapToRequestDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı istekleri alınırken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<RequestDto>> GetCollectionRequestsAsync(int collectionId, string userId)
        {
            try
            {
                var collection = await _dbContext.Collections
                    .FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == userId);

                if (collection == null)
                {
                    return Enumerable.Empty<RequestDto>();
                }

                var requests = await _dbContext.Requests
                    .Include(r => r.Collection)
                    .Where(r => r.CollectionId == collectionId && r.UserId == userId)
                    .OrderBy(r => r.Name)
                    .ToListAsync();

                return requests.Select(MapToRequestDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Koleksiyon istekleri alınırken bir hata oluştu: {CollectionId}, {UserId}", collectionId, userId);
                throw;
            }
        }

        public async Task<RequestDto> GetRequestByIdAsync(int id, string userId)
        {
            try
            {
                var request = await _dbContext.Requests
                    .Include(r => r.Collection)
                    .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

                if (request == null)
                {
                    return null;
                }

                return MapToRequestDto(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstek alınırken bir hata oluştu: {RequestId}, {UserId}", id, userId);
                throw;
            }
        }

        public async Task<RequestDto> CreateRequestAsync(CreateRequestDto model, string userId)
        {
            try
            {
                // Koleksiyonu kontrol et
                if (model.CollectionId.HasValue)
                {
                    var collection = await _dbContext.Collections
                        .FirstOrDefaultAsync(c => c.Id == model.CollectionId.Value && c.UserId == userId);

                    if (collection == null)
                    {
                        throw new InvalidOperationException("Belirtilen koleksiyon bulunamadı veya erişim izniniz yok.");
                    }
                }

                var request = new Request
                {
                    UserId = userId,
                    CollectionId = model.CollectionId,
                    Name = model.Name,
                    Description = model.Description ?? "",
                    Method = model.Method,
                    Url = model.Url,
                    Headers = model.Headers != null ? JsonSerializer.Serialize(model.Headers) : null,
                    AuthType = model.AuthType ?? "none",
                    AuthConfig = model.AuthConfig,
                    Params = model.Params != null ? JsonSerializer.Serialize(model.Params) : null,
                    Body = model.Body,
                    Tests = model.Tests,
                    IsFavorite = model.IsFavorite,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _dbContext.Requests.Add(request);
                await _dbContext.SaveChangesAsync();

                // İlişkili koleksiyonu yükle
                if (request.CollectionId.HasValue)
                {
                    await _dbContext.Entry(request).Reference(r => r.Collection).LoadAsync();
                }

                return MapToRequestDto(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstek oluşturulurken bir hata oluştu: {UserId}", userId);
                throw;
            }
        }

        public async Task<RequestDto> UpdateRequestAsync(int id, UpdateRequestDto model, string userId)
        {
            try
            {
                var request = await _dbContext.Requests
                    .Include(r => r.Collection)
                    .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

                if (request == null)
                {
                    return null;
                }

                // Koleksiyonu kontrol et
                if (model.CollectionId.HasValue && model.CollectionId != request.CollectionId)
                {
                    var collection = await _dbContext.Collections
                        .FirstOrDefaultAsync(c => c.Id == model.CollectionId.Value && c.UserId == userId);

                    if (collection == null)
                    {
                        throw new InvalidOperationException("Belirtilen koleksiyon bulunamadı veya erişim izniniz yok.");
                    }

                    request.CollectionId = model.CollectionId;
                }

                // Güncelleme
                if (!string.IsNullOrEmpty(model.Name))
                {
                    request.Name = model.Name;
                }

                if (model.Description != null)
                {
                    request.Description = model.Description;
                }

                if (!string.IsNullOrEmpty(model.Method))
                {
                    request.Method = model.Method;
                }

                if (!string.IsNullOrEmpty(model.Url))
                {
                    request.Url = model.Url;
                }

                if (model.Headers != null)
                {
                    request.Headers = JsonSerializer.Serialize(model.Headers);
                }

                if (model.AuthType != null)
                {
                    request.AuthType = model.AuthType;
                }

                if (model.AuthConfig != null)
                {
                    request.AuthConfig = model.AuthConfig;
                }

                if (model.Params != null)
                {
                    request.Params = JsonSerializer.Serialize(model.Params);
                }

                if (model.Body != null)
                {
                    request.Body = model.Body;
                }

                if (model.Tests != null)
                {
                    request.Tests = model.Tests;
                }

                if (model.IsFavorite.HasValue)
                {
                    request.IsFavorite = model.IsFavorite.Value;
                }

                request.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                if (request.CollectionId.HasValue)
                {
                    await _dbContext.Entry(request).Reference(r => r.Collection).LoadAsync();
                }

                return MapToRequestDto(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstek güncellenirken bir hata oluştu: {RequestId}, {UserId}", id, userId);
                throw;
            }
        }

        public async Task<bool> DeleteRequestAsync(int id, string userId)
        {
            try
            {
                var request = await _dbContext.Requests
                    .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

                if (request == null)
                {
                    return false;
                }

                _dbContext.Requests.Remove(request);
                await _dbContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "İstek silinirken bir hata oluştu: {RequestId}, {UserId}", id, userId);
                throw;
            }
        }

        public async Task<ExecuteRequestResultDto> ExecuteRequestAsync(int id, string userId)
        {
            try
            {
                var request = await _dbContext.Requests
                    .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

                if (request == null)
                {
                    return null;
                }

                var executeRequestDto = new ExecuteRequestDto
                {
                    Method = request.Method,
                    Url = request.Url,
                    Headers = request.Headers != null
                        ? JsonSerializer.Deserialize<Dictionary<string, string>>(request.Headers)
                        : new Dictionary<string, string>(),
                    Params = request.Params != null
                        ? JsonSerializer.Deserialize<Dictionary<string, string>>(request.Params)
                        : new Dictionary<string, string>(),
                    Body = request.Body,
                    AuthType = request.AuthType,
                    AuthConfig = request.AuthConfig
                };

                // Execute the request and return the result
                return await ExecuteRequestAsync(executeRequestDto, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Request execution failed: {RequestId}, {UserId}", id, userId);
                throw;
            }
        }

        public async Task<ExecuteRequestResultDto> ExecuteRequestAsync(ExecuteRequestDto request, string userId)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var startTime = DateTime.UtcNow;

                // Prepare request URL with query parameters
                var uriBuilder = new UriBuilder(request.Url);
                if (request.Params != null && request.Params.Count > 0)
                {
                    var query = new StringBuilder(uriBuilder.Query.TrimStart('?'));
                    foreach (var param in request.Params)
                    {
                        if (query.Length > 0)
                            query.Append('&');

                        query.Append(Uri.EscapeDataString(param.Key));
                        query.Append('=');
                        query.Append(Uri.EscapeDataString(param.Value));
                    }
                    uriBuilder.Query = query.ToString();
                }

                // Create HTTP request message
                var httpRequestMessage = new HttpRequestMessage
                {
                    Method = new HttpMethod(request.Method),
                    RequestUri = uriBuilder.Uri
                };

                // Add headers
                if (request.Headers != null)
                {
                    foreach (var header in request.Headers)
                    {
                        httpRequestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value);
                    }
                }

                // Add authentication if specified
                if (!string.IsNullOrEmpty(request.AuthType) && request.AuthType.ToLower() != "none")
                {
                    await AddAuthenticationToRequest(httpRequestMessage, request.AuthType, request.AuthConfig);
                }

                // Add request body for appropriate methods
                if (!string.IsNullOrEmpty(request.Body) &&
                    (request.Method.Equals("POST", StringComparison.OrdinalIgnoreCase) ||
                     request.Method.Equals("PUT", StringComparison.OrdinalIgnoreCase) ||
                     request.Method.Equals("PATCH", StringComparison.OrdinalIgnoreCase)))
                {
                    httpRequestMessage.Content = new StringContent(request.Body, Encoding.UTF8, "application/json");
                }

                // Execute request
                var response = await httpClient.SendAsync(httpRequestMessage);
                var endTime = DateTime.UtcNow;
                var duration = (int)(endTime - startTime).TotalMilliseconds;

                // Read response
                var responseContent = await response.Content.ReadAsStringAsync();
                var responseSize = responseContent.Length;

                // Record history
                var historyDto = new RecordHistoryDto
                {
                    RequestId = null, // Optional: Can be set to a RequestId if needed
                    Method = request.Method,
                    Url = request.Url,
                    Status = (int)response.StatusCode,
                    Duration = duration,
                    ResponseSize = responseSize,
                    Response = responseContent
                };

                await _historyService.RecordHistoryAsync(historyDto, userId);

                // Return the result
                return new ExecuteRequestResultDto
                {
                    StatusCode = (int)response.StatusCode,
                    Headers = response.Headers.ToDictionary(h => h.Key, h => string.Join(", ", h.Value)),
                    Body = responseContent,
                    Duration = duration,
                    Size = responseSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Request execution failed: {UserId}", userId);
                throw;
            }
        }

        private async Task AddAuthenticationToRequest(HttpRequestMessage request, string authType, string authConfig)
        {
            try
            {
                if (string.IsNullOrEmpty(authConfig))
                {
                    return;
                }

                switch (authType.ToLower())
                {
                    case "basic":
                        var basicAuthConfig = JsonSerializer.Deserialize<BasicAuthDto>(authConfig);
                        if (basicAuthConfig != null && !string.IsNullOrEmpty(basicAuthConfig.Username))
                        {
                            var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes(
                                $"{basicAuthConfig.Username}:{basicAuthConfig.Password ?? ""}"));
                            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);
                        }
                        break;

                    case "bearer":
                        var bearerAuthConfig = JsonSerializer.Deserialize<BearerAuthDto>(authConfig);
                        if (bearerAuthConfig != null && !string.IsNullOrEmpty(bearerAuthConfig.Token))
                        {
                            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearerAuthConfig.Token);
                        }
                        break;

                    case "apikey":
                        var apiKeyConfig = JsonSerializer.Deserialize<ApiKeyAuthDto>(authConfig);
                        if (apiKeyConfig != null && !string.IsNullOrEmpty(apiKeyConfig.Key) && !string.IsNullOrEmpty(apiKeyConfig.Value))
                        {
                            if (apiKeyConfig.AddTo.Equals("header", StringComparison.OrdinalIgnoreCase))
                            {
                                request.Headers.Add(apiKeyConfig.Key, apiKeyConfig.Value);
                            }
                            else if (apiKeyConfig.AddTo.Equals("query", StringComparison.OrdinalIgnoreCase))
                            {
                                var uriBuilder = new UriBuilder(request.RequestUri);
                                var query = System.Web.HttpUtility.ParseQueryString(uriBuilder.Query);
                                query[apiKeyConfig.Key] = apiKeyConfig.Value;
                                uriBuilder.Query = query.ToString();
                                request.RequestUri = uriBuilder.Uri;
                            }
                        }
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding authentication to request");
                // Continue without authentication rather than failing the request
            }
        }

        private static RequestDto MapToRequestDto(Request request)
        {
            return new RequestDto
            {
                Id = request.Id,
                UserId = request.UserId,
                CollectionId = request.CollectionId,
                CollectionName = request.Collection?.Name,
                Name = request.Name,
                Description = request.Description,
                Method = request.Method,
                Url = request.Url,
                Headers = request.Headers != null
                    ? JsonSerializer.Deserialize<Dictionary<string, string>>(request.Headers)
                    : new Dictionary<string, string>(),
                AuthType = request.AuthType,
                AuthConfig = request.AuthConfig,
                Params = request.Params != null
                    ? JsonSerializer.Deserialize<Dictionary<string, string>>(request.Params)
                    : new Dictionary<string, string>(),
                Body = request.Body,
                Tests = request.Tests,
                IsFavorite = request.IsFavorite,
                CreatedAt = request.CreatedAt,
                UpdatedAt = request.UpdatedAt
            };
        }
    }
}
