import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all requests for a specific collection
export const getRequestsByCollection = query({
    args: { collectionId: v.id("collections") },
    handler: async (ctx, args) => {
        const requests = await ctx.db
            .query("requests")
            .withIndex("by_collectionId", q => q.eq("collectionId", args.collectionId))
            .collect();
        return requests;
    },
});

// Get a single request by ID
export const getRequestById = query({
    args: { id: v.id("requests") },
    handler: async (ctx, args) => {
        const request = await ctx.db.get(args.id);
        return request;
    },
});

// Get a request by exact URL match - compare full URLs including paths
export const getRequestByUrl = query({
    args: { url: v.string() },
    handler: async (ctx, args) => {
        // Parse the URL to ensure we're comparing apples to apples
        let urlObj;
        try {
            urlObj = new URL(args.url);
        } catch (e) {
            console.error("Invalid URL in getRequestByUrl:", args.url);
            return null; // Return null for invalid URLs
        }

        // Normalize the URL to ensure consistent comparison
        const normalizedUrl = args.url.trim();

        // Find all requests
        const requests = await ctx.db
            .query("requests")
            .collect();

        // Find a match with exact URL (case-sensitive)
        const matchingRequest = requests.find(req => {
            // Early return if URL is missing
            if (!req.url) return false;

            try {
                // Compare the full URLs including the path
                return req.url.trim() === normalizedUrl;
            } catch (e) {
                console.error("Error comparing URLs:", e);
                return false;
            }
        });

        return matchingRequest || null;
    },
});

// Create a new request
export const createRequest = mutation({
    args: {
        userId: v.id("users"),
        collectionId: v.id("collections"),
        name: v.string(),
        description: v.optional(v.string()),
        method: v.string(),
        url: v.string(),
        headers: v.optional(v.string()),
        params: v.optional(v.string()),
        body: v.optional(v.string()),
        isFavorite: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        console.log("Creating request with args:", args);

        // Ensure collection exists
        const collection = await ctx.db.get(args.collectionId);
        if (!collection) {
            throw new Error("Collection not found");
        }

        const requestId = await ctx.db.insert("requests", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });

        return requestId;
    },
});

// Update an existing request
export const updateRequest = mutation({
    args: {
        id: v.id("requests"),
        name: v.optional(v.string()),
        method: v.optional(v.string()),
        url: v.optional(v.string()),
        headers: v.optional(v.string()),
        params: v.optional(v.string()),
        body: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;

        const request = await ctx.db.get(id);
        if (!request) {
            throw new Error("Request not found");
        }

        updates.updatedAt = Date.now();

        await ctx.db.patch(id, updates);
        return id;
    },
});

// Delete a request
export const deleteRequest = mutation({
    args: { id: v.id("requests") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return args.id;
    },
});

// Record request in history
export const recordHistory = mutation({
    args: {
        requestId: v.optional(v.id("requests")),
        method: v.string(),
        url: v.string(),
        status: v.optional(v.number()),
        duration: v.optional(v.number()),
        responseSize: v.optional(v.number()),
        headers: v.optional(v.string()),
        params: v.optional(v.string()),
        body: v.optional(v.string()),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Use the provided requestId if available
        let requestId = args.requestId;
        // Don't try to find a matching request by URL - this was causing the issue
        // when different endpoints from the same base URL were being treated as the same

        const historyId = await ctx.db.insert("history", {
            ...args,
            requestId, // Use the found requestId or keep it null
            timestamp: Date.now(),
        });

        return historyId;
    },
});

// Get recent request history
export const getRecentRequests = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;
        const history = await ctx.db
            .query("history")
            .withIndex("by_timestamp")
            .order("desc")
            .take(limit);
        return history;
    },
});

export const getRequestsByCollectionId = query({
    args: { collectionId: v.id("collections") },
    handler: async (ctx, args) => {
        const requests = await ctx.db
            .query("requests")
            .filter((q) => q.eq(q.field("collectionId"), args.collectionId))
            .collect();
        return requests;
    },
});
