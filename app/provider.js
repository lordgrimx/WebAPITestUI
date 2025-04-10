'use client'
import React from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { convex } from "@/convex/client"
import { ConvexProviderWithAuth0 } from "convex/react-auth0"
import { Auth0Provider } from "@auth0/auth0-react"
import { AuthProvider } from "@/lib/auth-context"
import LoadingWrapper from "@/components/LoadingWrapper"

function Provider({ children }) {
    // Get the URL for Auth0 redirects - using the current URL in the browser
    const redirectUri = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || 'http://localhost:3000';

    return (
        <Auth0Provider
            domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''}
            clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ''}
            authorizationParams={{
                redirect_uri: redirectUri
            }}
        >            <ConvexProviderWithAuth0 client={convex}>
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
            </ConvexProviderWithAuth0>
        </Auth0Provider>
    )
}

export default Provider