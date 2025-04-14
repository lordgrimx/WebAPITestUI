import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { hashPassword } from "@/lib/jwt-utils"; // Assuming hashPassword is here

// Helper to generate a simple 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Mutation to generate and store a temporary code (simulates sending email)
export const generateAndStoreTempCode = internalMutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const code = generateCode();
        const expiry = Date.now() + CODE_EXPIRY_MS;
        await ctx.db.patch(args.userId, {
            twoFactorCode: code,
            twoFactorCodeExpiry: expiry,
        });
        // In a real app, you'd trigger an email send action here
        console.log(`SIMULATED: 2FA Code for user ${args.userId}: ${code}`); // Log code for testing
        return { success: true };
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
            phone: user.phone,
            address: user.address,
            website: user.website,
            twoFactorEnabled: user.twoFactorEnabled,
            profileImageId: user.profileImageId,
        };
    },
});

// Modify loginMutation to check for 2FA
export const loginMutation = internalMutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!user || user.passwordHash !== hashPassword(args.password)) {
            throw new Error("Invalid email or password");
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
            // Don't update lastLogin yet, return 2FA required status
            return { twoFactorRequired: true, userId: user._id };
        } else {
            // 2FA not enabled, proceed with normal login
            await ctx.db.patch(user._id, {
                lastLogin: Date.now(),
                // Clear any stale 2FA codes
                twoFactorCode: undefined,
                twoFactorCodeExpiry: undefined,
            });
            // Return full user data needed by the client
            return {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                phone: user.phone,
                address: user.address,
                website: user.website,
                twoFactorEnabled: user.twoFactorEnabled,
                profileImageId: user.profileImageId,
            };
        }
    },
});

// Modify login action to handle 2FA step
export const login = action({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const userData = await ctx.runMutation(internal.users.loginMutation, args);

        if (userData.twoFactorRequired) {
            // Trigger code generation (simulates email sending)
            await ctx.runMutation(internal.users.generateAndStoreTempCode, { userId: userData.userId });
            // Return only the indicator and userId
            return { twoFactorRequired: true, userId: userData.userId };
        } else {
            // Normal login: Generate token and return full data
            const tokenData = await ctx.runAction(internal.generateToken.generateToken, {
                userId: userData.userId.toString(),
            });
            return {
                ...userData,
                token: tokenData.token,
            };
        }
    },
});

// Mutation to verify the code and complete login
export const verifyCodeAndLogin = internalMutation({
    args: {
        userId: v.id("users"),
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        // Check code and expiry
        if (
            !user.twoFactorCode ||
            !user.twoFactorCodeExpiry ||
            user.twoFactorCode !== args.code ||
            Date.now() > user.twoFactorCodeExpiry
        ) {
            // Clear expired/invalid code attempt
            await ctx.db.patch(args.userId, {
                twoFactorCode: undefined,
                twoFactorCodeExpiry: undefined
            });
            throw new Error("Invalid or expired 2FA code.");
        }

        // Code is valid, complete login
        await ctx.db.patch(user._id, {
            lastLogin: Date.now(),
            twoFactorCode: undefined, // Clear the code after successful use
            twoFactorCodeExpiry: undefined,
        });

        // Return necessary user data (similar to non-2FA loginMutation success)
        return {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            phone: user.phone,
            address: user.address,
            website: user.website,
            twoFactorEnabled: user.twoFactorEnabled,
            profileImageId: user.profileImageId,
        };
    },
});

// Action to combine verification and token generation
export const verifyAndGetToken = action({
    args: {
        userId: v.id("users"),
        code: v.string(),
    },
    handler: async (ctx, args) => {
        // Verify the code first
        const userData = await ctx.runMutation(internal.users.verifyCodeAndLogin, args);

        // If verification succeeded, generate the token
        const tokenData = await ctx.runAction(internal.generateToken.generateToken, {
            userId: userData.userId.toString(),
        });

        // Return combined user data and token
        return {
            ...userData,
            token: tokenData.token,
        };
    }
});

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

// Ensure updateProfile handles twoFactorEnabled
export const updateProfile = mutation({
    args: {
        userId: v.id("users"),
        name: v.optional(v.string()),
        // profileImage: v.optional(v.string()), // This might be deprecated if using setProfileImage
        phone: v.optional(v.string()),
        address: v.optional(v.string()),
        website: v.optional(v.string()),
        twoFactorEnabled: v.optional(v.boolean()), // Make sure this is included
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        const updates = {};
        if (args.name !== undefined) updates.name = args.name;
        // if (args.profileImage !== undefined) updates.profileImage = args.profileImage; // Handled by setProfileImage
        if (args.phone !== undefined) updates.phone = args.phone;
        if (args.address !== undefined) updates.address = args.address;
        if (args.website !== undefined) updates.website = args.website;
        if (args.twoFactorEnabled !== undefined) {
            updates.twoFactorEnabled = args.twoFactorEnabled;
            // If disabling 2FA, clear any related codes/secrets
            if (!args.twoFactorEnabled) {
                updates.twoFactorCode = undefined;
                updates.twoFactorCodeExpiry = undefined;
                // updates.twoFactorSecret = undefined; // If using TOTP later
            }
        }

        await ctx.db.patch(args.userId, updates);
        // If enabling 2FA for the first time, maybe send a confirmation? (Requires email action)
        // if (args.twoFactorEnabled && !user.twoFactorEnabled) {
        //   // Trigger confirmation email action
        // }
        return { success: true };
    },
});

// Modify changePassword to potentially require 2FA
export const changePassword = mutation({
    args: {
        userId: v.id("users"),
        currentPassword: v.string(),
        newPassword: v.string(),
        // twoFactorCode: v.optional(v.string()), // Add if requiring 2FA for password change
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        // Verify current password
        if (user.passwordHash !== hashPassword(args.currentPassword)) {
            throw new Error("Current password is incorrect");
        }

        // --- Optional: Add 2FA check for password change ---
        // if (user.twoFactorEnabled) {
        //   if (!args.twoFactorCode) throw new Error("2FA code required");
        //   // Verify the code (similar logic to verifyCodeAndLogin)
        //   if (
        //     !user.twoFactorCode || !user.twoFactorCodeExpiry ||
        //     user.twoFactorCode !== args.twoFactorCode || Date.now() > user.twoFactorCodeExpiry
        //   ) {
        //     // Consider clearing the code here too? Or maybe not for password change?
        //     throw new Error("Invalid or expired 2FA code.");
        //   }
        //   // Clear code after successful use if desired for password change
        //   await ctx.db.patch(args.userId, { twoFactorCode: undefined, twoFactorCodeExpiry: undefined });
        // }
        // --- End Optional 2FA check ---

        // Update password
        await ctx.db.patch(args.userId, {
            passwordHash: hashPassword(args.newPassword),
        });

        return { success: true };
    },
});

// Set profile image for a user with both the storage ID and the image URL
export const setProfileImage = mutation({
    args: {
        userId: v.id("users"),
        storageId: v.id("_storage"),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Update the user with the new profile image info
        await ctx.db.patch(args.userId, {
            profileImage: args.imageUrl,
            profileImageId: args.storageId,
        });

        return {
            success: true,
            imageUrl: args.imageUrl
        };
    },
});
