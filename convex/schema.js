import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users table for authentication and user data
    users: defineTable({
        name: v.string(),
        email: v.string(),
        passwordHash: v.string(),
        profileImage: v.optional(v.string()),
        role: v.string(), // "user", "admin", etc.
        createdAt: v.number(),
        lastLogin: v.optional(v.number()),
    }).index("by_email", ["email"]),

    // Mevcut 'apis' tablosunu koruyalım, belki başka bir yerde kullanılıyordur.
    apis: defineTable({
        method: v.string(),
        isReqAuth: v.boolean(),
        endpoint: v.string()
    }),    // API Test Aracı için Koleksiyonlar
    collections: defineTable({
        userId: v.id("users"),
        name: v.string(),
        description: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_name", ["name"])
        .index("by_userId", ["userId"]),

    // API Test Aracı için İstekler
    requests: defineTable({
        userId: v.id("users"),
        name: v.string(),
        description: v.optional(v.string()),
        collectionId: v.id("collections"),
        method: v.string(),
        url: v.string(),
        headers: v.optional(v.string()),
        params: v.optional(v.string()),
        body: v.optional(v.string()),
        isFavorite: v.optional(v.boolean()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_collectionId", ["collectionId"]) // Koleksiyona göre istekleri getirmek için index
        .index("by_name", ["name"]), // İsme göre arama için index    // İstek Geçmişi (History) - İsteğe bağlı olarak eklenebilir
    history: defineTable({
        userId: v.id("users"),
        requestId: v.optional(v.id("requests")),
        method: v.string(),
        url: v.string(),
        status: v.optional(v.number()),
        duration: v.optional(v.number()),
        responseSize: v.optional(v.number()),
        responseData: v.optional(v.string()), // JSON stringified response data
        responseHeaders: v.optional(v.string()), // JSON stringified response headers
        timestamp: v.number(),
        isTruncated: v.optional(v.boolean()),
    })
        .index("by_timestamp", ["timestamp"]),

    // Monitors table for API monitoring
    monitors: defineTable({
        name: v.string(),
        collectionId: v.id("collections"),
        collectionName: v.string(),
        interval: v.number(),
        method: v.string(),
        url: v.string(),
        headers: v.optional(v.string()),
        body: v.optional(v.string()),
        status: v.string(),
        uptime: v.string(),
        lastChecked: v.string(),
        responseTime: v.number(),
        createdAt: v.string(),
        metrics: v.optional(v.object({
            avgResponseTime: v.number(),
            requestCount: v.number(),
            errorRate: v.number(),
            statusCodes: v.array(v.object({
                code: v.number(),
                count: v.number()
            })),
            historicalData: v.array(v.object({
                timestamp: v.string(),
                responseTime: v.number(),
                status: v.number()
            }))
        }))
    }).index("by_collectionId", ["collectionId"]),
});
