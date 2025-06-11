"use client"
import { useGoogleLogin } from "@react-oauth/google"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface GoogleLoginButtonProps {
  selectedRole?: string
  studentId?: string
  expertise?: string
  onSuccess?: (data: any) => void
  onRoleRequired?: () => void
  className?: string
  size?: "default" | "sm" | "lg"
  variant?: "default" | "outline"
  mode?: "login" | "signup"
}

export function GoogleLoginButton({
  selectedRole,
  studentId,
  expertise,
  onSuccess,
  onRoleRequired,
  className = "",
  size = "default",
  variant = "default",
  mode = "login",
}: GoogleLoginButtonProps) {
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user exists in database
  const checkUserExists = async (email: string) => {
    try {
      const response = await fetch("/api/user/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const data = await response.json()
        return { exists: data.exists, user: data.user }
      } else {
        return { exists: false, user: null }
      }
    } catch (error) {
      console.error("Error checking user existence:", error)
      return { exists: false, user: null }
    }
  }

  // Handle successful Google authentication
  const handleGoogleSuccess = async (tokenResponse: any) => {
    setGoogleLoading(true)

    try {
      const accessToken = tokenResponse.access_token

      if (!accessToken) {
        throw new Error("No access token received from Google")
      }

      // Get user info from Google
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!userInfoRes.ok) {
        throw new Error(`Failed to fetch user info: ${userInfoRes.status}`)
      }

      const userInfo = await userInfoRes.json()

      // Check if user exists
      const { exists, user } = await checkUserExists(userInfo.email)

      let userRole: string

      if (exists && user) {
        // Existing user
        userRole = user.role
        toast({
          title: "Welcome back!",
          description: `Signing you in as ${user.role}...`,
        })
      } else {
        // New user
        if (!selectedRole) {
          setGoogleLoading(false)
          if (onRoleRequired) {
            onRoleRequired()
          } else {
            toast({
              title: "Role Required",
              description: "Please select a role first.",
              variant: "destructive",
            })
          }
          return
        }
        userRole = selectedRole
      }

      // Proceed with login/signup
      const googleData = {
        username: userInfo.name || userInfo.given_name || "Google User",
        image: userInfo.picture || "",
        email: userInfo.email,
        password: "google-oauth-user",
        role: userRole.toLowerCase(),
        isExistingUser: exists,
        ...(userRole === "student" && studentId && { studentId }),
        ...(userRole === "mentor" && expertise && { expertise }),
      }

      const serverResponse = await fetch("/api/google-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleData),
      })

      const data = await serverResponse.json()

      if (serverResponse.ok) {
        localStorage.setItem("token", data.token)
        toast({
          title: "Login Successful",
          description: `Welcome! Redirecting to ${data.roleData.role} dashboard...`,
        })

        if (onSuccess) {
          onSuccess(data)
          return
        }

        // Default redirect
        switch (data.roleData.role.toLowerCase()) {
          case "coordinator":
            router.push("/dashboard/coordinator")
            break
          case "faculty":
            router.push("/dashboard/faculty")
            break
          case "student":
            router.push("/dashboard/student")
            break
          case "mentor":
            router.push("/dashboard/mentor")
            break
          default:
            router.push("/dashboard/coordinator")
        }
      } else {
        toast({
          title: "Google Login Failed",
          description: data.message || "Server error occurred",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Google Login Error:", error)
      toast({
        title: "Google Login Error",
        description: error.message || "Something went wrong during Google login.",
        variant: "destructive",
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  // Initialize Google login
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (error) => {
      console.error("Google login error:", error)
      setGoogleLoading(false)
      toast({
        title: "Google Sign-in Error",
        description: "Failed to authenticate with Google.",
        variant: "destructive",
      })
    },
    scope: "email profile",
    flow: "implicit",
  })

  const handleClick = () => {
    setGoogleLoading(true)
    googleLogin()
  }

  return (
    <Button onClick={handleClick} variant={variant} size={size} className={className} disabled={googleLoading}>
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {googleLoading ? "Processing..." : mode === "signup" ? "Sign up with Google" : "Continue with Google"}
    </Button>
  )
}
