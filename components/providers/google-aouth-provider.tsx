"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
import { useEffect, useState, type ReactNode } from "react"

interface GoogleOAuthWrapperProps {
  children: ReactNode
}

export function GoogleOAuthWrapper({ children }: GoogleOAuthWrapperProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Log debug information when component mounts
    if (typeof window !== "undefined") {
      console.log("Google OAuth Provider - Current origin:", window.location.origin)
      console.log("Google OAuth Provider - Client ID status:", clientId ? "Set" : "Missing")
    }
  }, [clientId])

  // Prevent SSR for Google OAuth components
  if (!mounted) {
    return <>{children}</>
  }

  if (!clientId) {
    console.error("Google Client ID is not configured")
    console.log("Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable")
    return <>{children}</>
  }

  return (
    <GoogleOAuthProvider
      clientId={clientId as string}
      onScriptLoadError={() => console.error("Failed to load Google OAuth script")}
      onScriptLoadSuccess={(): void => console.log("Google OAuth script loaded successfully")}
    >
      {children}
    </GoogleOAuthProvider>
  )
}
