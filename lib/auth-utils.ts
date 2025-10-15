import { jwtDecode } from "jwt-decode"

export interface TokenPayload {
  id?: string
  userId?: string
  username?: string
  email?: string
  role?: string
  exp?: number
  iat?: number
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: TokenPayload = jwtDecode(token)
    const currentTime = Date.now() / 1000 // Convert to seconds
    
    return decoded.exp ? decoded.exp < currentTime : true
  } catch (error) {
    console.error("Error decoding token:", error)
    return true // Treat invalid tokens as expired
  }
}

export function getTokenPayload(token: string): TokenPayload | null {
  try {
    return jwtDecode(token)
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

export function clearAuthStorage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
    localStorage.removeItem("userProfile")
    localStorage.removeItem("googleUserProfile")
  }
}

export function getValidToken(): string | null {
  if (typeof window === "undefined") return null
  
  const token = localStorage.getItem("token")
  if (!token) return null
  
  if (isTokenExpired(token)) {
    clearAuthStorage()
    return null
  }
  
  return token
}

export function requireAuth(): TokenPayload | null {
  const token = getValidToken()
  if (!token) return null
  
  return getTokenPayload(token)
}