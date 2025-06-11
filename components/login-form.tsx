"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface LoginFormProps {
  onSuccess?: (data: any) => void
  showRoleSelection?: boolean
  className?: string
}

export function LoginForm({ onSuccess, showRoleSelection = true, className = "" }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Attempting login for:", email)

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Login failed:", errorData)
        toast({
          title: "Login Failed",
          description: errorData.message || "Invalid credentials",
          variant: "destructive",
        })
        return
      }

      const data = await res.json()
      console.log("Login successful")

      toast({
        title: "Login Successful",
        description: `Welcome back! Redirecting to ${data.roleData.role} dashboard...`,
      })

      // Store token
      localStorage.setItem("token", data.token)

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data)
        return
      }

      // Default redirect behavior
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
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className={`space-y-4 ${className}`}>
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

      {showRoleSelection && (
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
          <p className="text-xs text-muted-foreground mt-1">Role selection is required for login</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
