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

// Create a new request
export const createRequest = mutation({
    args: {
        collectionId: v.id("collections"),
        name: v.string(),
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
        const historyId = await ctx.db.insert("history", {
            ...args,
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
