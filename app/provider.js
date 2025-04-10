'use client'
import React from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { convex } from "@/convex/client"
import { ConvexAuthProvider } from "@convex-dev/auth/react"
import { AuthProvider } from "@/lib/auth-context"
import LoadingWrapper from "@/components/LoadingWrapper"

function Provider({ children }) {
    return (
        <ConvexAuthProvider client={convex}>
            <AuthProvider>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <LoadingWrapper>
                        {children}
                    </LoadingWrapper>
                </NextThemesProvider>
            </AuthProvider>
        </ConvexAuthProvider>
    )
}

export default Provider