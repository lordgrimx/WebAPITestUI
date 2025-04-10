import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import generateToken from "../lib/jwt-utils"; // Import the JWT utility functions

// Helper function to hash passwords (in a real app, use a proper hashing library)
function hashPassword(password) {
    // This is just for demo purposes, in production use bcrypt or similar
    return password + "_hashed";
}

// Register a new user
export const register = mutation({
    args: {
        name: v.string(),
        email: v.string(),
    },
    // This will be updated to use Convex Auth context in a moment
    handler: async (ctx, args) => {
        // Get auth info
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const tokenIdentifier = identity.tokenIdentifier;

        // Check if user already exists by token identifier
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_token", q => q.eq("tokenIdentifier", tokenIdentifier))
            .first();

        if (existingUser) {
            // Update last login time
            await ctx.db.patch(existingUser._id, {
                lastLogin: Date.now(),
            });

            return {
                userId: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                profileImage: existingUser.profileImage,
            };
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            tokenIdentifier,
            role: "user", // Default role
            createdAt: Date.now(),
        });

        return { userId };
    },
});

// Login user
export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // Find user by email
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", q => q.eq("email", args.email))
            .first();

        if (!user) {
            throw new Error("Invalid email or password");
        }

        // Check password
        if (user.passwordHash !== hashPassword(args.password)) {
            throw new Error("Invalid email or password");
        }

        // Update last login time
        await ctx.db.patch(user._id, {
            lastLogin: Date.now(),
        });

        return {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            token, // Include token in the response
        };
    },
});

// Get the currently authenticated user
export const getMe = query({
    args: {},
    handler: async (ctx) => {
        // Get auth info from Convex
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const tokenIdentifier = identity.tokenIdentifier;

        // Find user by token identifier
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", q => q.eq("tokenIdentifier", tokenIdentifier))
            .first();

        if (!user) {
            return null;
        }

        // Return user data
        return {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
        };
    },
});

// Update user profile
export const updateProfile = mutation({
    args: {
        name: v.optional(v.string()),
        profileImage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Get auth info
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const tokenIdentifier = identity.tokenIdentifier;

        // Find user by token identifier
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", q => q.eq("tokenIdentifier", tokenIdentifier))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        // Update profile fields
        const updates = {};
        if (args.name !== undefined) updates.name = args.name;
        if (args.profileImage !== undefined) updates.profileImage = args.profileImage;

        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
            await ctx.db.patch(user._id, updates);
        }
        return {
            userId: user._id,
            ...updates
        };
    },
});

// Remove the changePassword mutation as we no longer need it with Auth0
// Password reset and changes will be handled through Auth0