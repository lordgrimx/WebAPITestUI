"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // Login mutation
    const login = useMutation(api.users.login);

    // Register mutation
    const register = useMutation(api.users.register);

    // Use getMe query properly
    const user = useQuery(api.users.getMe, userId ? { userId } : "skip");    // Logout function
    const logout = () => {
        // Show loading page before reload
        localStorage.setItem("showLoading", "true");
        localStorage.removeItem("userId");
        setUserId(null);
        setCurrentUser(null);
        window.location.reload(); // Reload the page to reflect the login state
    };    // Check for existing user session on mount
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            setIsLoading(false);
        }
    }, []);

    // Update current user when the user query result changes
    useEffect(() => {
        if (user !== undefined) {
            if (user) {
                setCurrentUser(user);
            } else {
                // Clear invalid session
                localStorage.removeItem("userId");
                setUserId(null);
                setCurrentUser(null);
            }
            setIsLoading(false);
        }
    }, [user]);

    // Login handler
    const handleLogin = async (email, password) => {
        try {
            const result = await login({ email, password });
            if (result && result.userId) {
                localStorage.setItem("userId", result.userId);
                setCurrentUser(result);
                return { success: true };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: error.message };
        }
    };

    // Register handler
    const handleRegister = async (name, email, password) => {
        try {
            const result = await register({ name, email, password });
            if (result && result.userId) {
                // Auto login after registration
                return await handleLogin(email, password);
            }
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        user: currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
