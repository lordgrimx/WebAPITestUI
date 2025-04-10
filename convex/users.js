import { mutation, query } from "./_generated/server";
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
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", q => q.eq("email", args.email))
            .first();

        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            passwordHash: hashPassword(args.password),
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

        const token = generateToken(user._id, "2h"); // Generate JWT token

        // Return user data (excluding password hash)
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

// Get current user
export const getMe = query({
    args: {
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            return null;
        }

        const user = await ctx.db.get(args.userId);
        if (!user) {
            return null;
        }

        // Return user data (excluding password hash)
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
        userId: v.id("users"),
        name: v.optional(v.string()),
        profileImage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("User not found");
        }

        const updates = {};
        if (args.name !== undefined) updates.name = args.name;
        if (args.profileImage !== undefined) updates.profileImage = args.profileImage;

        await ctx.db.patch(args.userId, updates);
        return { success: true };
    },
});

// Change password
export const changePassword = mutation({
    args: {
        userId: v.id("users"),
        currentPassword: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Verify current password
        if (user.passwordHash !== hashPassword(args.currentPassword)) {
            throw new Error("Current password is incorrect");
        }

        // Update password
        await ctx.db.patch(args.userId, {
            passwordHash: hashPassword(args.newPassword),
        });

        return { success: true };
    },
});
