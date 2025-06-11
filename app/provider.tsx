"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
import type { ReactNode } from "react"

interface GoogleOAuthWrapperProps {
  children: ReactNode
}

export function Providers({ children }: GoogleOAuthWrapperProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId || clientId.trim() === "") {
    console.error("❌ Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env file.")
    return <>{children}</>
  }

  console.log("✅ Google Client ID loaded successfully.")

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
