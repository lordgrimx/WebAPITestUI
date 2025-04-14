import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
// Removing the StorageId import that's causing the error

// Generate a URL to upload a file to
export const generateUploadUrl = mutation({
    args: {
        // We don't need any arguments to generate an upload URL
    },
    handler: async (ctx) => {
        // Generate a temporary upload URL
        return await ctx.storage.generateUploadUrl();
    },
});

// Store the file in Convex storage and return its storageId
export const saveProfileImage = action({
    args: {
        userId: v.id("users"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        // Get the URL with which we can download the file from Convex storage
        const url = await ctx.storage.getUrl(args.storageId);

        // Get the user's existing profile image storageId, if any
        const user = await ctx.runQuery("users:getMe", { userId: args.userId });
        const existingImageId = user?.profileImageId;

        // Create a record in the users table with the storageId
        // and update the user's profile with a direct URL to the image
        const result = await ctx.runMutation("users:setProfileImage", {
            userId: args.userId,
            storageId: args.storageId,
            imageUrl: url,
        });

        // If there was an existing image, delete it to save storage space
        if (existingImageId) {
            try {
                await ctx.runMutation("storage:deleteProfileImage", {
                    storageId: existingImageId,
                });
            } catch (error) {
                // If deletion fails, log error but don't fail the overall operation
                console.error("Failed to delete old profile image:", error);
            }
        }

        return { imageUrl: url };
    },
});

// Delete an existing profile image
export const deleteProfileImage = mutation({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        await ctx.storage.delete(args.storageId);
        return { success: true };
    },
});
