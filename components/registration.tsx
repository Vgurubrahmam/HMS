"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface RegistrationFormProps {
  onSuccess?: (data: any) => void
  className?: string
}

export function RegistrationForm({ onSuccess, className = "" }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    studentId: "",
    expertise: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Submitting registration:", { ...formData, password: "[REDACTED]" })

      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("Response status:", res.status)

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Registration failed:", errorData)
        toast({
          title: "Registration Failed",
          description: errorData.message || "Something went wrong",
          variant: "destructive",
        })
        return
      }

      const data = await res.json()
      console.log("Registration successful:", data)

      toast({
        title: "Success!",
        description: data.message || "Your account has been created. Please sign in.",
      })

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "",
        studentId: "",
        expertise: "",
      })

      if (onSuccess) {
        onSuccess(data)
        return
      }

      // Default redirect to login
      router.push("/auth/login")
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong during registration.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Full Name</Label>
          <Input
            id="username"
            placeholder="Enter your full name"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)} required>
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
        </div>
      </div>

      {formData.role === "student" && (
        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID</Label>
          <Input
            id="studentId"
            placeholder="Enter your student ID"
            value={formData.studentId}
            onChange={(e) => handleInputChange("studentId", e.target.value)}
            required
          />
        </div>
      )}

      {formData.role === "mentor" && (
        <div className="space-y-2">
          <Label htmlFor="expertise">Expertise Areas</Label>
          <Input
            id="expertise"
            placeholder="e.g., Web Development, AI/ML, Mobile Apps"
            value={formData.expertise}
            onChange={(e) => handleInputChange("expertise", e.target.value)}
            required
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  )
}
