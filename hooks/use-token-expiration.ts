"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { isTokenExpired, clearAuthStorage } from "@/lib/auth-utils"

interface UseTokenExpirationOptions {
  /** How often to check token expiration in milliseconds (default: 30 seconds) */
  checkInterval?: number
  /** Whether to redirect to home page on expiration (default: true) */
  redirectOnExpiration?: boolean
  /** Custom redirect path (default: "/") */
  redirectPath?: string
  /** Whether to show console logs for debugging (default: false) */
  debug?: boolean
}

/**
 * Hook that automatically checks for token expiration and handles logout
 * This runs in the background and will automatically redirect users when their token expires
 */
export function useTokenExpiration(options: UseTokenExpirationOptions = {}) {
  const {
    checkInterval = 30000, // Check every 30 seconds
    redirectOnExpiration = true,
    redirectPath = "/",
    debug = false
  } = options

  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTokenRef = useRef<string | null>(null)

  useEffect(() => {
    const checkTokenExpiration = () => {
      // Only run on client side
      if (typeof window === "undefined") return

      const token = localStorage.getItem("token")
      
      // If no token exists, no need to check
      if (!token) {
        if (debug) console.log("No token found, stopping expiration check")
        return
      }

      // Check if token has changed (user logged in/out in another tab)
      if (lastTokenRef.current !== token) {
        lastTokenRef.current = token
        if (debug) console.log("Token changed, updating reference")
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        if (debug) console.log("Token expired, clearing storage and redirecting")
        
        // Clear all auth-related storage
        clearAuthStorage()
        
        // Redirect to specified path
        if (redirectOnExpiration) {
          router.push(redirectPath)
        }
        
        // Clear the interval since user is logged out
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else {
        if (debug) {
          // Show time remaining until expiration
          try {
            const decoded: any = JSON.parse(atob(token.split('.')[1]))
            const expiresAt = decoded.exp * 1000
            const timeRemaining = expiresAt - Date.now()
            const minutesRemaining = Math.floor(timeRemaining / 60000)
            console.log(`Token expires in ${minutesRemaining} minutes`)
          } catch (error) {
            console.log("Could not decode token for debug info")
          }
        }
      }
    }

    // Initial check
    checkTokenExpiration()

    // Set up interval to check periodically
    intervalRef.current = setInterval(checkTokenExpiration, checkInterval)

    // Listen for storage events (token changes in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (debug) console.log("Token changed in another tab")
        checkTokenExpiration()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router, checkInterval, redirectOnExpiration, redirectPath, debug])

  // Return a function to manually trigger the check
  return {
    checkNow: () => {
      const token = localStorage.getItem("token")
      if (token && isTokenExpired(token)) {
        clearAuthStorage()
        if (redirectOnExpiration) {
          router.push(redirectPath)
        }
        return true // Token was expired
      }
      return false // Token is still valid
    }
  }
}