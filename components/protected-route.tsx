"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isTokenExpired, clearAuthStorage, getTokenPayload } from "@/lib/auth-utils"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/auth/login" 
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      
      if (!token) {
        router.push(redirectTo)
        return
      }

      if (isTokenExpired(token)) {
        clearAuthStorage()
        router.push(redirectTo)
        return
      }

      const payload = getTokenPayload(token)
      if (!payload) {
        clearAuthStorage()
        router.push(redirectTo)
        return
      }

      // Check role authorization if roles are specified
      if (allowedRoles.length > 0) {
        const userRole = payload.role?.toLowerCase()
        const isRoleAllowed = allowedRoles.some(role => 
          role.toLowerCase() === userRole || 
          (role.toLowerCase() === "coordinator" && userRole === "coordinator")
        )

        if (!isRoleAllowed) {
          router.push("/dashboard") // Redirect to general dashboard
          return
        }
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()

    // Set up periodic token check (less frequent since we have global checker)
    const interval = setInterval(checkAuth, 120000) // Check every 2 minutes

    return () => clearInterval(interval)
  }, [router, allowedRoles, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute