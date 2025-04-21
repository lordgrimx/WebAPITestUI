'use client'
import React, { useEffect } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth-context"
import { SettingsProvider } from "@/lib/settings-context"
import { EnvironmentProvider } from "@/lib/environment-context"
import LoadingWrapper from "@/components/LoadingWrapper"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"
import { useSettings } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"

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
                        <I18nextProvider i18n={i18n}>
                            <LanguageWrapper>
                                <LoadingWrapper>
                                    {children}
                                </LoadingWrapper>
                            </LanguageWrapper>
                        </I18nextProvider>
                    </EnvironmentProvider>
                </SettingsProvider>
            </AuthProvider>
        </NextThemesProvider>
    )
}

export default Provider
