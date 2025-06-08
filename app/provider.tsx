
"use client"
import { GoogleOAuthProvider } from '@react-oauth/google'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="904912428371-46sen39an131fceefh98mhrh3beovktj.apps.googleusercontent.com">
      {children}
    </GoogleOAuthProvider>
  )
}
