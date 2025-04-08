import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all collections
export const getCollections = query({
    handler: async (ctx) => {
        const collections = await ctx.db.query("collections").collect();
        return collections;
    },
});

// Get a single collection by ID
export const getCollection = query({
    args: { id: v.id("collections") },
    handler: async (ctx, args) => {
        const collection = await ctx.db.get(args.id);
        return collection;
    },
});

// Add a new collection
export const addCollection = mutation({
    args: {
        name: v.string()
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        const collectionId = await ctx.db.insert("collections", {
            name: args.name,
            createdAt: now,
            updatedAt: now,
        });

        return collectionId;
    },
});

// Update a collection
export const updateCollection = mutation({
    args: {
        id: v.id("collections"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;

        const collection = await ctx.db.get(id);
        if (!collection) {
            throw new Error("Collection not found");
        }

        updates.updatedAt = Date.now();

        await ctx.db.patch(id, updates);
        return id;
    },
});

// Delete a collection
export const deleteCollection = mutation({
    args: { id: v.id("collections") },
    handler: async (ctx, args) => {
        // First, delete all requests associated with this collection
        const requests = await ctx.db
            .query("requests")
            .withIndex("by_collectionId", q => q.eq("collectionId", args.id))
            .collect();

        // Delete each request
        for (const request of requests) {
            await ctx.db.delete(request._id);
        }

        // Then delete the collection itself
        await ctx.db.delete(args.id);
        return args.id;
    },
});
