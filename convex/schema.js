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
    }),

    // API Test Aracı için Koleksiyonlar
    collections: defineTable({
        name: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_name", ["name"]), // İsimle arama için index

    // API Test Aracı için İstekler
    requests: defineTable({
        name: v.string(),
        collectionId: v.id("collections"), // Bir koleksiyona ait olabilir
        method: v.string(), // GET, POST, PUT, DELETE, etc.
        url: v.string(),
        headers: v.optional(v.string()), // JSON stringified headers
        params: v.optional(v.string()), // JSON stringified query parameters
        body: v.optional(v.string()), // Request body
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_collectionId", ["collectionId"]) // Koleksiyona göre istekleri getirmek için index
        .index("by_name", ["name"]), // İsme göre arama için index    // İstek Geçmişi (History) - İsteğe bağlı olarak eklenebilir
    history: defineTable({
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
        .index("by_timestamp", ["timestamp"])
});
