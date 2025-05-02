using System;
using System.Collections.Generic;
using WebTestUI.Backend.DTOs; // Assuming other DTOs are in this namespace

namespace WebTestUI.Backend.DTOs
{
    // DTO for the data payload to be shared
    // DTO for a history item when sharing, excluding response details
    public class SharedHistoryItemDto
    {
        public string? Method { get; set; }
        public string? Url { get; set; }
        public string? RequestName { get; set; }
        public Dictionary<string, string>? RequestHeaders { get; set; }
        public string? RequestBody { get; set; }
    }

    // DTO for the data payload to be shared
    public class SharedDataDto
    {
        public RequestDto? Request { get; set; }
        public EnvironmentDto? Environment { get; set; }
        public List<CollectionDto>? Collections { get; set; }
        public List<SharedHistoryItemDto>? History { get; set; }
    }

    // DTO for the response containing the share ID
    public class ShareLinkResponseDto
    {
        public string ShareId { get; set; } = string.Empty;
    }

    // Reusing existing DTOs for nested data
    // public class RequestDto { ... } // Defined in RequestDtos.cs
    // public class EnvironmentDto { ... } // Defined in HistoryAndEnvironmentDtos.cs
    // public class CollectionDto { ... } // Defined in CollectionDtos.cs
    // public class HistoryDto { ... } // Defined in HistoryAndEnvironmentDtos.cs
}