"use client"

import { useTokenExpiration } from "@/hooks/use-token-expiration"

interface TokenExpirationGuardProps {
  /** How often to check token expiration in milliseconds (default: 30 seconds) */
  checkInterval?: number
  /** Custom redirect path when token expires (default: "/") */
  redirectPath?: string
  /** Whether to show debug logs (default: false) */
  debug?: boolean
}

/**
 * Component that automatically monitors token expiration and handles logout
 * Add this to your layout to ensure users are automatically logged out when their token expires
 */
export function TokenExpirationGuard({ 
  checkInterval = 30000, // 30 seconds
  redirectPath = "/",
  debug = false 
}: TokenExpirationGuardProps) {
  // This hook will automatically handle token expiration checking
  useTokenExpiration({
    checkInterval,
    redirectOnExpiration: true,
    redirectPath,
    debug
  })

  // This component doesn't render anything - it just runs the token check logic
  return null
}