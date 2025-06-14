"use client"

import { useGoogleLogin } from "@react-oauth/google"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code2, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ClientOnlyGoogleAuth } from "@/components/client-only-google-auth"

interface ExistingUser {
  email: string
  role: string
  username: string
}

function GoogleLoginContent() {
  const [role, setRole] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showRoleRequiredMessage, setShowRoleRequiredMessage] = useState(false)
  const [checkingUser, setCheckingUser] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user exists in database
  const checkUserExists = async (email: string): Promise<{ exists: boolean; user: ExistingUser | null }> => {
    try {
      setCheckingUser(true)
      const response = await fetch("/api/user/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const data = await response.json()
        return { exists: data.exists, user: data.user }
      } else {
        console.error("Error checking user existence")
        return { exists: false, user: null }
      }
    } catch (error) {
      console.error("Error checking user existence:", error)
      return { exists: false, user: null }
    } finally {
      setCheckingUser(false)
    }
  }

  // Handle successful Google authentication
  const handleGoogleSuccess = async (tokenResponse: any) => {
    setGoogleLoading(true)
    // console.log("Google login response received")

    try {
      const accessToken = tokenResponse.access_token

      if (!accessToken) {
        throw new Error("No access token received from Google")
      }

      // Get user info from Google
      // console.log("Fetching user info from Google...")
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!userInfoRes.ok) {
        const errorText = await userInfoRes.text()
        console.error("Google API error:", errorText)
        throw new Error(`Failed to fetch user info: ${userInfoRes.status}`)
      }

      const userInfo = await userInfoRes.json()
      // console.log("Google user info received:", { email: userInfo.email, name: userInfo.name })

      // Check if user exists in our database
      // console.log("Checking if user exists in database...")
      const { exists, user } = await checkUserExists(userInfo.email)

      let userRole: string

      if (exists && user) {
        // User exists, use their existing role
        // console.log("✅ Existing user found, using stored role:", user.role)
        userRole = user.role
        toast({
          title: "Welcome back!",
          description: `Signing you in as ${user.role}...`,
        })
        setShowRoleRequiredMessage(false)
      } else {
        // New user, check if role is selected
        // console.log("❌ New user detected, checking role selection...")
        if (!role) {
          setGoogleLoading(false)
          setShowRoleRequiredMessage(true)
          toast({
            title: "Role Required",
            description: "Since this is your first time signing in with Google, please select a role first.",
            variant: "destructive",
          })
          return
        }
        userRole = role
        // console.log("✅ New user with selected role:", role)
        toast({
          title: "Creating account...",
          description: `Setting up your ${role} account...`,
        })
        setShowRoleRequiredMessage(false)
      }

      // Proceed with login/signup
      const googleData = {
        username: userInfo.name || userInfo.given_name || "Google User",
        image: userInfo.picture || "",
        email: userInfo.email,
        password: "google-oauth-user",
        role: userRole.toLowerCase(),
        isExistingUser: exists,
      }

      // console.log("Sending data to server with role:", userRole)
      const serverResponse = await fetch("/api/google-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleData),
      })

      const data = await serverResponse.json()
      // console.log("Server response:", data)

      if (serverResponse.ok) {
        localStorage.setItem("token", data.token)
        toast({
          title: "Login Successful",
          description: `Welcome! Redirecting to ${data.roleData.role} dashboard...`,
        })

        // Redirect based on the user's role
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
        // console.error("Server error:", data)
        toast({
          title: "Google Login Failed",
          description: data.message || "Server error occurred",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      // console.error("Google Login Error:", error)
      toast({
        title: "Google Login Error",
        description: error.message || "Something went wrong during Google login.",
        variant: "destructive",
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  // Handle Google login errors
  const handleGoogleError = (error: any) => {
    console.error("Google login error:", error)
    setGoogleLoading(false)
    toast({
      title: "Google Sign-in Error",
      description: "Failed to authenticate with Google. Please try again.",
      variant: "destructive",
    })
  }

  // Initialize Google login
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    scope: "email profile",
    flow: "implicit",
  })

  // Handle Google login button click
  const handleGoogleLoginClick = () => {
    setGoogleLoading(true)
    setShowRoleRequiredMessage(false)
    googleLogin()
  }

  return (
    <div className="space-y-6">
      {/* Role Selection for New Users */}
      <div className="space-y-2">
        <Label htmlFor="role">
          Role Selection
          {showRoleRequiredMessage && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role (required for new accounts)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coordinator">Coordinator</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Role selection is only required for first-time Google sign-in. Existing users will use their stored role
          automatically.
        </p>
      </div>

      {/* Show role required message */}
      {showRoleRequiredMessage && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Role Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Since this is your first time signing in with Google, please select a role above before continuing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-in Button */}
      <Button
        onClick={handleGoogleLoginClick}
        className="w-full h-12"
        disabled={googleLoading || checkingUser}
        size="lg"
      >
        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
        {googleLoading ? "Signing in..." : checkingUser ? "Checking account..." : "Continue with Google"}
      </Button>

      {/* Alternative Login Options */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link href="/auth/login">Sign in with Email & Password</Link>
      </Button>
    </div>
  )
}

export default function GoogleLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-start">
              <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
                <Code2 className="h-8 w-8 text-blue-600" />
                <CardTitle>Sign in with Google</CardTitle>
              </Link>
            </div>
            <CardDescription>Continue with your Google account to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientOnlyGoogleAuth>
              <GoogleLoginContent />
            </ClientOnlyGoogleAuth>

            <div className="flex justify-between items-center mt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="text-blue-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
              <div className="text-center">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
