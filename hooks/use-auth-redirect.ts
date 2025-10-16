import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isTokenExpired, clearAuthStorage, getTokenPayload } from '@/lib/auth-utils'

interface UseAuthRedirectOptions {
  redirectTo?: string
  allowedRoles?: string[]
  checkInterval?: number
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { 
    redirectTo = '/', 
    allowedRoles = [], 
    checkInterval = 60000 // Check every minute by default
  } = options
  
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      // Check for token in various possible storage keys
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('accessToken')
      
      if (!token) {
        console.log('No token found, redirecting to:', redirectTo)
        router.push(redirectTo)
        return false
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token expired, clearing storage and redirecting to:', redirectTo)
        clearAuthStorage()
        router.push(redirectTo)
        return false
      }

      // Check role authorization if specified
      if (allowedRoles.length > 0) {
        const payload = getTokenPayload(token)
        if (!payload) {
          console.log('Invalid token payload, clearing storage and redirecting to:', redirectTo)
          clearAuthStorage()
          router.push(redirectTo)
          return false
        }

        const userRole = payload.role?.toLowerCase()
        const isRoleAllowed = allowedRoles.some(role => 
          role.toLowerCase() === userRole
        )

        if (!isRoleAllowed) {
          console.log('User role not authorized, redirecting to dashboard')
          router.push('/dashboard')
          return false
        }
      }

      return true
    }

    // Initial check
    const isValid = checkAuthAndRedirect()
    
    if (!isValid) return

    // Set up periodic validation if token is initially valid
    const interval = setInterval(checkAuthAndRedirect, checkInterval)

    return () => clearInterval(interval)
  }, [router, redirectTo, allowedRoles, checkInterval])
}

// Simplified hook for pages that should redirect to home when no token
export function useRequireAuth(allowedRoles?: string[]) {
  return useAuthRedirect({
    redirectTo: '/',
    allowedRoles,
    checkInterval: 60000
  })
}

// Hook for pages that should redirect to login when no token  
export function useRequireLogin(allowedRoles?: string[]) {
  return useAuthRedirect({
    redirectTo: '/auth/login',
    allowedRoles,
    checkInterval: 60000
  })
}