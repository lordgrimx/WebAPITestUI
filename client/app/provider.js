'use client'

import React, { useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { AuthProvider } from "@/lib/auth-context"
import { SettingsProvider } from "@/lib/settings-context"
import { EnvironmentProvider } from "@/lib/environment-context"
import { RequestProvider } from "@/lib/request-context"
import LoadingWrapper from "@/components/LoadingWrapper"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"
import { useSettings } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"
import Header from "@/components/Header"
import LoginModal from "@/components/modals/LoginModal"
import SignupModal from "@/components/modals/SignupModal"
import { usePathname, useRouter } from 'next/navigation'; // Ekleyin

// Dil ayarlarını yöneten bir sarmalayıcı bileşen
function LanguageWrapper({ children }) {
    const { settings } = useSettings();
    const { user } = useAuth();

    useEffect(() => {
        // Kullanıcının dil ayarını öncelikli olarak kullan, yoksa global ayardan al
        const userLanguage = user?.language || settings.language || 'en';
        if (i18n.language !== userLanguage) {
            i18n.changeLanguage(userLanguage);
        }
    }, [settings.language, user?.language]);

    return children;
}

function MainLayout({ children }) {
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    
    useEffect(() => {
        // Ana sayfadaysa ve giriş yapmışsa home'a yönlendir
        if (pathname === '/' && isAuthenticated) {
            router.push('/home');
        }
        // Home sayfasındaysa ve giriş yapmamışsa ana sayfaya yönlendir
        else if (pathname === '/home' && !isAuthenticated) {
            router.push('/');
        }
    }, [pathname, isAuthenticated, router]);

    // Ana sayfada header'ı gösterme
    const shouldShowHeader = pathname !== '/';
    
    return (
        <>
            {shouldShowHeader && (
                <Header 
                    darkMode={theme === 'dark'} 
                    setDarkMode={(isDark) => setTheme(isDark ? 'dark' : 'light')}
                    openLoginModal={() => setShowLoginModal(true)}
                    openSignupModal={() => setShowSignupModal(true)}
                />
            )}
            {children}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToSignup={() => {
                    setShowLoginModal(false);
                    setShowSignupModal(true);
                }}
            />
            <SignupModal
                isOpen={showSignupModal}
                onClose={() => setShowSignupModal(false)}
                onSwitchToLogin={() => {
                    setShowSignupModal(false);
                    setShowLoginModal(true);
                }}
            />
        </>
    );
}

function Provider({ children }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <SettingsProvider>
                    <EnvironmentProvider>
                        <RequestProvider>
                            <I18nextProvider i18n={i18n}>
                                <LanguageWrapper>
                                    <LoadingWrapper>
                                        {children}
                                    </LoadingWrapper>
                                </LanguageWrapper>
                            </I18nextProvider>
                        </RequestProvider>
                    </EnvironmentProvider>
                </SettingsProvider>
            </AuthProvider>
        </NextThemesProvider>
    )
}

export default Provider
