"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from 'js-cookie';
import api from './axios-config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const handleLogin = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;

            if (data.requires2FA) {
                return {
                    success: true,
                    requires2FA: true,
                    userId: data.userId
                };
            }

            if (data.token) {
                Cookies.set('authToken', data.token, { expires: 2/24 });
                setCurrentUser(data.user);
                return { success: true };
            }

            return { success: false, error: "Invalid response from server" };
        } catch (error) {
            console.error("Login error:", error);
            return { 
                success: false, 
                error: error.response?.data?.message || error.message 
            };
        }
    };

    const handleRegister = async (name, email, password) => {
        try {
            const response = await api.post('/auth/register', { 
                name, 
                email, 
                password 
            });
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || error.message 
            };
        }
    };

    const handle2FAVerification = async (userId, code) => {
        try {
            const response = await api.post('/auth/verify-2fa', { 
                userId, 
                code 
            });
            const data = response.data;

            if (data.token) {
                Cookies.set('authToken', data.token, { expires: 2/24 });
                setCurrentUser(data.user);
                return { success: true };
            }

            return { success: false, error: "Verification failed" };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || error.message 
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            Cookies.remove('authToken');
            setCurrentUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('authToken');
            if (token) {
                try {
                    const response = await api.get('/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.data?.user) {
                        setCurrentUser(response.data.user);
                    } else {
                        throw new Error('Invalid user data received');
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    Cookies.remove('authToken');
                    setCurrentUser(null);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

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
