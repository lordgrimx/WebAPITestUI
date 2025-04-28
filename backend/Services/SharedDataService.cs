using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using WebTestUI.Backend.DTOs;
using WebTestUI.Backend.Services.Interfaces;

namespace WebTestUI.Backend.Services
{
    public class SharedDataService : ISharedDataService
    {
        // Using ConcurrentDictionary for thread-safe in-memory storage
        private readonly ConcurrentDictionary<string, SharedDataDto> _sharedData = new ConcurrentDictionary<string, SharedDataDto>();

        public Task<string> SaveSharedDataAsync(SharedDataDto data)
        {
            // Generate a unique ID (e.g., a GUID or a shorter random string)
            // Using a simple GUID for now, could be shortened for URLs
            string shareId = Guid.NewGuid().ToString("N");

            // Store the data in the dictionary
            _sharedData[shareId] = data;

            // In a real application, you might add expiration logic here
            // For this example, data stays in memory until the app restarts

            return Task.FromResult(shareId);
        }

        public Task<SharedDataDto?> GetSharedDataAsync(string shareId)
        {
            // Retrieve data from the dictionary
            _sharedData.TryGetValue(shareId, out var data);

            return Task.FromResult(data);
        }
    }
}