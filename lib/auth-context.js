"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);    // Login action
    const login = useAction(api.users.login);

    // Register mutation
    const register = useMutation(api.users.register);

    // 2FA verification action
    const verify2FA = useAction(api.users.verifyAndGetToken);

    // Use getMe query properly
    const user = useQuery(api.users.getMe, userId ? { userId } : "skip");    // Logout function
    const logout = async () => {
        setIsLoading(true);

        // Call the logout API route to clear the cookies
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        // Clear the client-side userId cookie
        Cookies.remove("userId");

        setUserId(null);
        setCurrentUser(null);
        setIsLoading(false);

        // Ana sayfaya yönlendir
        window.location.href = '/';
    };

    // Check for existing user session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Önce client tarafındaki userId cookie'sini kontrol edelim
                const storedUserId = Cookies.get("userId");

                if (storedUserId) {
                    // Client tarafında userId varsa, bunu server tarafındaki token ile doğrulayalım
                    const response = await fetch('/api/auth/session', {
                        credentials: 'include'
                    });
                    const data = await response.json();

                    if (data.userId) {
                        // Session geçerliyse userId'yi ayarlayalım
                        setUserId(data.userId);
                    } else {
                        // Session geçerli değilse cookie'leri temizleyelim
                        Cookies.remove("userId");
                        setIsLoading(false);
                    }
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Session check error:", error);
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    // Update current user when the user query result changes
    useEffect(() => {
        if (user !== undefined) {
            if (user) {
                setCurrentUser(user);
            } else {
                // Clear invalid session
                Cookies.remove("userId");
                Cookies.remove("token");
                setUserId(null);
                setCurrentUser(null);
            }
            setIsLoading(false);
        }
    }, [user]);    // Login handler
    const handleLogin = async (email, password) => {
        try {
            const result = await login({ email, password }); // Call the Convex action

            // Check if the login action returned a userId
            if (!result || !result.userId) {
                // Handle case where login action failed or didn't return userId
                return { success: false, error: result?.error || "Invalid credentials or login failed" };
            }

            // Check if 2FA is required based on the action's response
            if (result.twoFactorEnabled) {
                // Return information needed to trigger the 2FA modal
                return {
                    success: true,
                    requires2FA: true,
                    userId: result.userId,
                    email: email // Pass email for the 2FA modal if needed
                };
            } else {
                // If 2FA is NOT required, proceed with setting the session token
                // API route'u çağırarak token oluştur ve cookie'ye kaydet
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: result.userId }),
                    credentials: 'include'
                });

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error || 'Login failed');
                }

                // Client cookie olarak sadece userId'yi ayarlayalım
                Cookies.set("userId", result.userId, {
                    secure: process.env.NODE_ENV === "production",
                    expires: 2 / 24, // 2 hours in days
                    sameSite: "strict",
                    path: "/"
                });

                setUserId(result.userId);
                setCurrentUser(result);
                return { success: true };
            }
            return { success: false, error: "Invalid credentials" };
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
            return { success: false, error: "Registration failed" };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, error: error.message };
        }
    };    // Handle 2FA verification
    const handle2FAVerification = async (userId, code) => {
        try {
            // Call the Convex action to verify the code and get user data + token
            const result = await verify2FA({ userId, code });

            // Check if verification was successful and returned necessary data
            if (result && result.userId && result.token) {
                // Verification successful, now set the session cookies

                // 1. Set the httpOnly token cookie via the API route
                //    (We still use the login route for consistency, it just sets the cookie)
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Send the userId obtained from the successful 2FA verification
                    body: JSON.stringify({ userId: result.userId }),
                    credentials: 'include' // Important for sending/receiving cookies
                });

                const data = await response.json();
                if (!data.success) {
                    // Handle potential errors during cookie setting
                    throw new Error(data.error || 'Failed to set session token after 2FA');
                }

                // 2. Set the client-accessible userId cookie
                Cookies.set("userId", result.userId, {
                    secure: process.env.NODE_ENV === "production",
                    expires: 2 / 24, // 2 hours in days
                    sameSite: "strict",
                    path: "/"
                });

                // Update the auth context state
                setUserId(result.userId);
                // Set the current user based on the data returned from verify2FA
                // Exclude the token from the currentUser state object if desired
                const { token, ...userData } = result;
                setCurrentUser(userData);

                return { success: true };
            } else {
                // Handle verification failure (invalid code, expired, etc.)
                return { success: false, error: result?.error || "Invalid verification code" };
            }
        } catch (error) {
            console.error("2FA verification error:", error);
            // Return a generic error or the specific error message
            return { success: false, error: error.message || "An error occurred during 2FA verification." };
        }
    };

    const value = {
        user: currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout,
        verify2FA: handle2FAVerification
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
