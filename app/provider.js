'use client'
import React from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ConvexProvider } from "convex/react"
import { convex } from "@/convex/client"

function Provider({ children }) {
    return (
        <ConvexProvider client={convex}>
            <NextThemesProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </NextThemesProvider>
        </ConvexProvider>
    )
}

export default Provider