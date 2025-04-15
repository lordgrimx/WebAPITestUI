"use client";

import { createContext, useContext, useState, useEffect } from "react";
// import { useMutation, useQuery, useAction } from "convex/react"; // Kaldırıldı
// import { api } from "../convex/_generated/api"; // Kaldırıldı
import Cookies from 'js-cookie';
import axios from 'axios'; // Axios eklendi

// TODO: API base URL'ini yapılandırmadan al
const API_BASE_URL = 'http://localhost:5296/api'; // Backend URL'i

const authAxios = axios.create({
    baseURL: API_BASE_URL,
});

// Axios interceptor ile token ekleme
authAxios.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token'); // Token'ı cookie'den al
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null); // userId state'i kalabilir, cookie'den alınacak

    // TODO: Backend API çağrılarını implement et
    // const login = useAction(api.users.login); // Kaldırıldı
    // const register = useMutation(api.users.register); // Kaldırıldı
    // const verify2FA = useAction(api.users.verifyAndGetToken); // Kaldırıldı
    // const user = useQuery(api.users.getMe, userId ? { userId } : "skip"); // Kaldırıldı

    // Logout function
    const logout = async () => {
        setIsLoading(true);

        // TODO: Backend logout endpoint'ini çağır (gerekirse)
        // await authAxios.post('/Auth/logout'); // Örnek

        // Call the Next.js API route to clear the httpOnly cookie
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        // Clear client-side cookies
        Cookies.remove("userId"); // Bu cookie artık gereksiz olabilir, token yeterli
        Cookies.remove("token"); // Client-side token'ı temizle (varsa)

        setUserId(null); // State'i temizle
        setCurrentUser(null); // State'i temizle
        setIsLoading(false);

        // Ana sayfaya yönlendir
        window.location.href = '/';
    };

    // Check for existing user session on mount using token
    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get('token'); // Token'ı cookie'den al
            if (token) {
                try {
                    // TODO: Backend'den kullanıcı bilgilerini al ('/User/me' veya benzeri)
                    const response = await authAxios.get('/User/me'); // Örnek endpoint
                    if (response.data) {
                        setCurrentUser(response.data);
                        setUserId(response.data.id); // Backend'den gelen kullanıcı ID'si
                    } else {
                        // Token geçersizse veya kullanıcı bulunamazsa cookie'leri temizle
                        Cookies.remove('token');
                        setCurrentUser(null);
                        setUserId(null);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // Hata durumunda (örn. 401 Unauthorized) cookie'leri temizle
                    Cookies.remove('token');
                    setCurrentUser(null);
                    setUserId(null);
                }
            }
            setIsLoading(false);
        };

        fetchUser();
    }, []); // Sadece component mount edildiğinde çalışır    // Login handler (Backend ile)
    const handleLogin = async (email, password) => {
        setIsLoading(true);
        try {
            // TODO: Backend login endpoint'ini çağır ('/Auth/login')
            const response = await axios.post(`${API_BASE_URL}/Auth/login`, { email, password });

            if (response.data && response.data.token) {                // Token'ı cookie'ye kaydet
                Cookies.set('token', response.data.token, {
                    secure: process.env.NODE_ENV === "production",
                    expires: response.data.expiresInMinutes / (60 * 24), // Dakikayı güne çevir
                    sameSite: 'lax', // 'lax' kullanarak Next.js API routes erişimine izin ver
                    path: '/'
                });

                // Session API'sının kullanabilmesi için aynı token'ı sunucu tarafı cookie olarak da ayarla
                fetch('/api/auth/set-cookie', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: response.data.token, expiresInMinutes: response.data.expiresInMinutes }),
                    credentials: 'include',
                });

                // Kullanıcı bilgilerini al ve state'i güncelle
                // TODO: Login sonrası kullanıcı bilgilerini backend'den al ('/User/me')
                const userResponse = await authAxios.get('/User/me'); // Token artık interceptor ile ekleniyor
                if (userResponse.data) {
                    setCurrentUser(userResponse.data);
                    setUserId(userResponse.data.id);
                    setIsLoading(false);
                    return { success: true };
                } else {
                    throw new Error("Failed to fetch user data after login.");
                }
            } else if (response.data && response.data.requiresTwoFactor) {
                // TODO: 2FA işlemini handle et (şimdilik hata döndür)
                setIsLoading(false);
                return { success: false, requires2FA: true, error: "Two-factor authentication required." };
            }
            else {
                throw new Error(response.data?.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            setIsLoading(false);

            // Improved error handling for connection issues
            if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message.includes("Network Error")) {
                return {
                    success: false,
                    error: "Sunucuya bağlanılamıyor. Lütfen backend sunucusunun çalıştığından emin olun.",
                    details: "Backend sunucu http://localhost:5296 adresinde çalışıyor olmalıdır."
                };
            }

            return { success: false, error: error.response?.data?.message || error.message || "Login failed" };
        }
    };

    // Register handler (Backend ile)
    const handleRegister = async (name, email, password) => {
        setIsLoading(true);
        try {
            // TODO: Backend register endpoint'ini çağır ('/Auth/register')
            const response = await axios.post(`${API_BASE_URL}/Auth/register`, { name, email, password });

            if (response.data && response.data.success) {
                // Başarılı kayıt sonrası otomatik login yapabilir veya login sayfasına yönlendirebiliriz.
                // Şimdilik sadece başarı mesajı döndürelim.
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
    };

    // Handle 2FA verification (Backend ile)
    const handle2FAVerification = async (userId, code) => {
        // TODO: Backend 2FA doğrulama endpoint'ini implement et ('/Auth/verify-2fa')
        console.warn("2FA verification not implemented yet for backend.");
        return { success: false, error: "2FA not implemented" };
        /* Örnek implementasyon:
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/Auth/verify-2fa`, { userId, code });
            if (response.data && response.data.token) {
                Cookies.set('token', response.data.token, { ... }); // Cookie ayarla
                const userResponse = await authAxios.get('/User/me'); // Kullanıcıyı al
                setCurrentUser(userResponse.data);
                setUserId(userResponse.data.id);
                setIsLoading(false);
                return { success: true };
            } else {
                 throw new Error(response.data?.message || "Invalid 2FA code");
            }
        } catch (error) {
             console.error("2FA verification error:", error);
             setIsLoading(false);
             return { success: false, error: error.response?.data?.message || error.message || "2FA verification failed" };
        }
        */
    };

    const value = {
        user: currentUser,
        userId: userId, // userId'yi de context'e ekleyelim
        isAuthenticated: !!currentUser && !!Cookies.get('token'), // Token varlığını da kontrol et
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
