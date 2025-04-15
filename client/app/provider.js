'use client'
import React from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth-context"
import { SettingsProvider } from "@/lib/settings-context"
import LoadingWrapper from "@/components/LoadingWrapper"

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
                        <LoadingWrapper>
                            {children}
                        </LoadingWrapper>
                    </SettingsProvider>
                </AuthProvider>
            </NextThemesProvider>
    )
}

export default Provider
