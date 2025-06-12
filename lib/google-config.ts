// Replace this file completely - it has the wrong redirect URI logic
export const GOOGLE_CONFIG = {
  redirectUri: typeof window !== "undefined" ? window.location.origin : 
    process.env.NODE_ENV === "production" ? "https://your-actual-vercel-url.vercel.app" : "http://localhost:3000",
  scopes: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
}