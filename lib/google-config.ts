// Google OAuth configuration
export const GOOGLE_CONFIG = {
  // Get the correct redirect URI based on environment
  redirectUri:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : "https://hms-livid.vercel.app" // Your actual deployed URL
        : "http://localhost:3000",

  // Scopes needed
  scopes: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
}

export const getGoogleRedirectUri = () => {
  if (typeof window !== "undefined") {
    // Client-side: use the current origin
    return window.location.origin
  }

  // Server-side: use environment-based configuration
  return GOOGLE_CONFIG.redirectUri
}

// Helper function to get all possible redirect URIs for Google Console setup
export const getAllRedirectUris = () => {
  return [
    "http://localhost:3000",
    "https://hms-livid.vercel.app", // Your production URL
    // Add any other domains you might use
  ]
}
