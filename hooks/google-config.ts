// Google OAuth configuration
export const GOOGLE_CONFIG = {
  // For development
  redirectUri: process.env.NODE_ENV === "production" ? "https://hms-livid.vercel.app" : "http://localhost:3000",

  // Scopes needed
  scopes: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
}

export const getGoogleRedirectUri = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return GOOGLE_CONFIG.redirectUri
}
