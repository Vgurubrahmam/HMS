"use client"

import { useEffect, useState, type ReactNode } from "react"

interface ClientOnlyGoogleAuthProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientOnlyGoogleAuth({ children, fallback }: ClientOnlyGoogleAuthProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-center">
            <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading Google authentication...</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
