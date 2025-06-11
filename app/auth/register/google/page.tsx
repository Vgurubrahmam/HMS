"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Code2, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { GoogleLoginButton } from "@/components/google-login-button"

export default function GoogleRegisterPage() {
  const [role, setRole] = useState("")
  const [studentId, setStudentId] = useState("")
  const [expertise, setExpertise] = useState("")
  const [showRoleRequiredMessage, setShowRoleRequiredMessage] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleSignupSuccess = (data: any) => {
    toast({
      title: "Account Created Successfully!",
      description: `Welcome to HackathonMS! Your ${data.roleData.role} account has been created.`,
    })

    // Redirect to appropriate dashboard
    router.push(`/dashboard/${data.roleData.role.toLowerCase()}`)
  }

  const handleRoleRequired = () => {
    setShowRoleRequiredMessage(true)
    toast({
      title: "Role Required",
      description: "Please select a role and fill in any required information before signing up with Google.",
      variant: "destructive",
    })
  }

  const isFormValid = () => {
    if (!role) return false
    if (role === "student" && !studentId) return false
    if (role === "mentor" && !expertise) return false
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-start">
              <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
                <Code2 className="h-8 w-8 text-blue-600" />
                <CardTitle>Sign up with Google</CardTitle>
              </Link>
            </div>
            <CardDescription>Create your HackathonMS account using Google</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    setRole(value)
                    setShowRoleRequiredMessage(false)
                    // Reset role-specific fields when role changes
                    setStudentId("")
                    setExpertise("")
                  }}
                >
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

              {/* Student ID field for students */}
              {role === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="studentId">
                    Student ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="studentId"
                    placeholder="Enter your student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Expertise field for mentors */}
              {role === "mentor" && (
                <div className="space-y-2">
                  <Label htmlFor="expertise">
                    Expertise Areas <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expertise"
                    placeholder="e.g., Web Development, AI/ML, Mobile Apps"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Show validation message */}
              {showRoleRequiredMessage && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Complete Required Fields</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please fill in all required information before continuing with Google signup.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Signup Button */}
              <GoogleLoginButton
                selectedRole={role}
                onSuccess={handleGoogleSignupSuccess}
                onRoleRequired={handleRoleRequired}
                className="w-full h-12"
                size="lg"
              />

              {/* Form validation indicator */}
              {role && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {isFormValid() ? (
                      <span className="text-green-600">✓ Ready to sign up with Google</span>
                    ) : (
                      <span className="text-orange-600">Please complete all required fields above</span>
                    )}
                  </p>
                </div>
              )}

              {/* Alternative Signup Options */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/register">Sign up with Email & Password</Link>
              </Button>
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
              <div className="text-center">
                <Button variant="ghost" asChild>
                  <Link href="/auth/register">
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
