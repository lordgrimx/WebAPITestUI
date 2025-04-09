'use client'
import React from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ConvexProvider } from "convex/react"
import { convex } from "@/convex/client"
import { AuthProvider } from "@/lib/auth-context"
import LoadingWrapper from "@/components/LoadingWrapper"

function Provider({ children }) {
    return (
        <ConvexProvider client={convex}>
            <NextThemesProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <AuthProvider>
                    <LoadingWrapper>
                        {children}
                    </LoadingWrapper>
                </AuthProvider>
            </NextThemesProvider>
        </ConvexProvider>
    )
}

export default Provider