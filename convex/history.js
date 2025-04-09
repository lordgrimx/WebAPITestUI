import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Record a new history entry for an API request
export const recordHistory = mutation({
    args: {
        requestId: v.optional(v.id("requests")),
        method: v.string(),
        url: v.string(),
        status: v.optional(v.number()),
        duration: v.optional(v.number()),
        responseSize: v.optional(v.number()),
        responseData: v.optional(v.string()),
        responseHeaders: v.optional(v.string()),
        isTruncated: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const historyId = await ctx.db.insert("history", {
            requestId: args.requestId,
            method: args.method,
            url: args.url,
            status: args.status,
            duration: args.duration,
            isTruncated: args.isTruncated,
            responseSize: args.responseSize,
            responseData: args.responseData,
            responseHeaders: args.responseHeaders,
            timestamp: Date.now(),
        });

        return historyId;
    },
});

// Get recent history entries with optional limit
export const getRecentHistory = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;
        const history = await ctx.db
            .query("history")
            .withIndex("by_timestamp")
            .order("desc")
            .take(limit);
        return history;
    },
});

// Get history for a specific request
export const getHistoryByRequestId = query({
    args: { requestId: v.id("requests") },
    handler: async (ctx, args) => {
        const history = await ctx.db
            .query("history")
            .filter((q) => q.eq(q.field("requestId"), args.requestId))
            .order("desc")
            .collect();
        return history;
    },
});

// Get history within a date range
export const getHistoryByDateRange = query({
    args: {
        startDate: v.number(),
        endDate: v.number(),
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 100;
        const history = await ctx.db
            .query("history")
            .withIndex("by_timestamp")
            .filter((q) =>
                q.and(
                    q.gte(q.field("timestamp"), args.startDate),
                    q.lte(q.field("timestamp"), args.endDate)
                )
            )
            .order("desc")
            .take(limit);
        return history;
    },
});

// Delete history entry by ID
export const deleteHistoryEntry = mutation({
    args: { id: v.id("history") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return args.id;
    },
});

// Clear history entries older than a certain date
export const clearOldHistory = mutation({
    args: { olderThan: v.number() },
    handler: async (ctx, args) => {
        const oldEntries = await ctx.db
            .query("history")
            .withIndex("by_timestamp")
            .filter((q) => q.lt(q.field("timestamp"), args.olderThan))
            .collect();

        let deletedCount = 0;
        for (const entry of oldEntries) {
            await ctx.db.delete(entry._id);
            deletedCount++;
        }

        return { deletedCount };
    },
});
