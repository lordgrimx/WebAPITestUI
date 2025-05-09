"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';

const API_BASE_URL = 'https://webtestui-backend.onrender.com/api';

export const authAxios = axios.create({
    baseURL: API_BASE_URL,
});

// Update interceptor to use localStorage instead of cookies
authAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration
authAxios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            console.log('Token expired or unauthorized, logging out...');
            localStorage.removeItem('token');
            window.location.href = '/';
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    const logout = async () => {
        setIsLoading(true);
        localStorage.removeItem('token');
        setUserId(null);
        setCurrentUser(null);
        setIsLoading(false);
        window.location.href = '/';
    };

    // Check for existing session using localStorage token
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authAxios.get('/User/me');
                    if (response.data) {
                        setCurrentUser(response.data);
                        setUserId(response.data.id);
                    } else {
                        localStorage.removeItem('token');
                        setCurrentUser(null);
                        setUserId(null);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    localStorage.removeItem('token');
                    setCurrentUser(null);
                    setUserId(null);
                }
            }
            setIsLoading(false);
        };

        fetchUser();
    }, []);

    const handleLogin = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/Auth/login`, { email, password }); if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);

                const userResponse = await authAxios.get('/User/me');
                if (userResponse.data) {
                    setCurrentUser(userResponse.data);
                    setUserId(userResponse.data.id);
                    setIsLoading(false);
                    return { success: true };
                } else {
                    throw new Error("Failed to fetch user data after login.");
                }
            } else if (response.data && response.data.twoFactorRequired) {
                setIsLoading(false);
                return {
                    success: false,
                    requires2FA: true,
                    userId: response.data.userId,
                    message: response.data.message || "Two-factor authentication required."
                };
            }
            else {
                throw new Error(response.data?.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            setIsLoading(false);

            if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message.includes("Network Error")) {
                return {
                    success: false,
                    error: "Sunucuya bağlanılamıyor. Lütfen backend sunucusunun çalıştığından emin olun.",
                    details: "Backend sunucu https://webtestui-backend.onrender.com adresinde çalışıyor olmalıdır."
                };
            }

            return { success: false, error: error.response?.data?.message || error.message || "Login failed" };
        }
    };

    const handleRegister = async (name, email, password) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/Auth/register`, { name, email, password });

            if (response.data && response.data.success) {
                setIsLoading(false);
                return { success: true };
            } else {
                throw new Error(response.data?.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            setIsLoading(false);
            return { success: false, error: error.response?.data?.message || error.message || "Registration failed" };
        }
    }; const handle2FAVerification = async (userId, code) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${API_BASE_URL}/Auth/verify-2fa`, {
                userId: userId,
                code: code
            });

            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);

                const userResponse = await authAxios.get('/User/me');
                if (userResponse.data) {
                    setCurrentUser(userResponse.data);
                    setUserId(userResponse.data.id);
                    setIsLoading(false);
                    return { success: true };
                }
            }

            setIsLoading(false);
            return {
                success: false,
                error: response.data?.message || "Verification failed"
            };
        } catch (error) {
            console.error("2FA verification error:", error);
            setIsLoading(false);
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Verification failed"
            };
        }
    };

    const value = {
        user: currentUser,
        userId: userId,
        isAuthenticated: !!currentUser && !!localStorage.getItem('token'),
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
