"use client"

import type React from "react"
import { useGoogleLogin } from "@react-oauth/google"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code2, ArrowLeft, Github } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LoginPageAlternative() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Regular login handler (unchanged)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        toast({
          title: "Login Failed",
          description: errorData.message || "Invalid credentials",
          variant: "destructive",
        })
        return
      }

      const data = await res.json()
      localStorage.setItem("token", data.token)

      toast({
        title: "Login Successful",
        description: `Welcome back! Redirecting to ${data.roleData.role} dashboard...`,
      })

      // Redirect based on role
      const userRole = data.roleData.role.toLowerCase()
      switch (userRole) {
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Google login using authorization code flow
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      setGoogleLoading(true)
      // console.log("Google auth code received:", codeResponse.code)

      try {
        // Send the authorization code to your backend
        const response = await fetch("/api/google-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: codeResponse.code,
            role: role || null,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          localStorage.setItem("token", data.token)
          toast({
            title: "Login Successful",
            description: `Welcome! Redirecting to ${data.roleData.role} dashboard...`,
          })

          // Redirect based on role
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
            description: data.message || "Authentication failed",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        // console.error("Google login error:", error)
        toast({
          title: "Google Login Error",
          description: "Something went wrong during Google login.",
          variant: "destructive",
        })
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: (error) => {
      // console.error("Google login error:", error)
      setGoogleLoading(false)
      toast({
        title: "Google Sign-in Error",
        description: "Failed to authenticate with Google.",
        variant: "destructive",
      })
    },
  })

  const handleGoogleLoginClick = () => {
    setGoogleLoading(true)
    googleLogin()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-start">
              <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
                <Code2 className="h-8 w-8 text-blue-600" />
                <CardTitle>Welcome Back</CardTitle>
              </Link>
            </div>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Role selection is required for regular login and first-time Google sign-in
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleGoogleLoginClick}
                variant="outline"
                className="w-full"
                disabled={loading || googleLoading}
              >
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
                {googleLoading ? "Signing in..." : "Google"}
              </Button>
              <Button variant="outline" type="button" disabled={loading || googleLoading}>
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="text-blue-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
              <div className="mt-4 text-center">
                <Button variant="ghost" asChild>
                  <Link href="/">
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
