"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuth0 } from "@auth0/auth0-react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Use Auth0 hooks
    const { isAuthenticated, user, isLoading: auth0Loading, loginWithRedirect, logout: auth0Logout } = useAuth0();

    // Convex mutations and queries
    const createOrGetUser = useMutation(api.users.createOrGetUser);
    const userData = useQuery(api.users.getMe);

    // Create or get user when Auth0 authenticates
    useEffect(() => {
        const syncUser = async () => {
            if (isAuthenticated && user && !auth0Loading) {
                try {
                    // Create or get user in Convex
                    await createOrGetUser({
                        name: user.name || user.nickname || "User",
                        email: user.email,
                    });
                } catch (error) {
                    console.error("Error syncing user with Convex:", error);
                }
            }

            if (!auth0Loading) {
                setIsLoading(false);
            }
        };

        syncUser();
    }, [isAuthenticated, user, auth0Loading, createOrGetUser]);

    // Update current user when userData changes
    useEffect(() => {
        if (userData !== undefined) {
            setCurrentUser(userData);
        }
    }, [userData]);

    // Login function
    const login = () => {
        loginWithRedirect();
    };

    // Logout function
    const handleLogout = () => {
        auth0Logout({ returnTo: window.location.origin });
    };

    const value = {
        user: currentUser,
        isAuthenticated: !!currentUser,
        isLoading: isLoading || auth0Loading,
        login,
        logout: handleLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Define and export the useAuth hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Also export it as a named export and default
export { useAuth as default };
