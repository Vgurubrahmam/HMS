"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ProfileFormProps {
  userProfile: {
    username: string
    userId: string
    email: string
    role: string
    phone?: string
    gender?: string
    image?: string
    // Student specific fields
    branch?: string
    year?: string
    github?: string
    // Faculty specific fields
    department?: string
    designation?: string
    specialization?: string
    // Mentor specific fields
    expertise?: string[]
    company?: string
    experience?: string
    // Coordinator specific fields
    managementRole?: string
    employeeId?: string
  }
  onProfileUpdate: (updatedProfile: any) => void
}

export default function ProfileForm({ userProfile, onProfileUpdate }: ProfileFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    username: userProfile?.username || "",
    userId: userProfile?.userId || "",
    email: userProfile?.email || "",
    role: userProfile?.role || "",
    phone: userProfile?.phone || "",
    gender: userProfile?.gender || "",
    image: userProfile?.image || "",
    // Student fields
    branch: userProfile?.branch || "",
    year: userProfile?.year || "",
    github: userProfile?.github || "",
    // Faculty fields
    department: userProfile?.department || "",
    designation: userProfile?.designation || "",
    specialization: userProfile?.specialization || "",
    // Mentor fields
    expertise: Array.isArray(userProfile?.expertise) ? userProfile.expertise.join(", ") : userProfile?.expertise || "",
    company: userProfile?.company || "",
    experience: userProfile?.experience || "",
    // Coordinator fields
    managementRole: userProfile?.managementRole || "",
    employeeId: userProfile?.employeeId || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/profiles/${formData.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      onProfileUpdate(formData)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderCommonFields = () => (
    <>
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="username">Full Name</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="userId">User ID</Label>
        <Input
          id="userId"
          name="userId"
          value={formData.userId}
          disabled
          required
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="gender">Gender</Label>
        <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="image">Profile Image URL</Label>
        <Input
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Enter profile image URL"
        />
      </div>
    </>
  )

  const renderStudentFields = () => (
    <>
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="branch">Branch</Label>
        <Input
          id="branch"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          placeholder="Enter your branch"
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="year">Year</Label>
        <Select value={formData.year} onValueChange={(value) => handleSelectChange("year", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1st Year</SelectItem>
            <SelectItem value="2">2nd Year</SelectItem>
            <SelectItem value="3">3rd Year</SelectItem>
            <SelectItem value="4">4th Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="github">GitHub Profile</Label>
        <Input
          id="github"
          name="github"
          value={formData.github}
          onChange={handleChange}
          placeholder="Enter your GitHub profile URL"
        />
      </div>
    </>
  )

  const renderFacultyFields = () => (
    <>
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Enter your department"
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="designation">Designation</Label>
        <Input
          id="designation"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          placeholder="Enter your designation"
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="specialization">Specialization</Label>
        <Input
          id="specialization"
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          placeholder="Enter your specialization"
        />
      </div>
    </>
  )

  const renderMentorFields = () => (
    <>
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="expertise">Areas of Expertise</Label>
        <Input
          id="expertise"
          name="expertise"
          value={formData.expertise}
          onChange={handleChange}
          placeholder="Enter your areas of expertise (comma-separated)"
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Enter your company name"
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="experience">Years of Experience</Label>
        <Input
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="Enter years of experience"
        />
      </div>
    </>
  )

  const renderCoordinatorFields = () => (
    <>
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="managementRole">Management Role</Label>
        <Input
          id="managementRole"
          name="managementRole"
          value={formData.managementRole}
          onChange={handleChange}
          placeholder="Enter your management role"
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Enter your department"
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="employeeId">Employee ID</Label>
        <Input
          id="employeeId"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          placeholder="Enter your employee ID"
        />
      </div>
    </>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Common fields for all roles */}
      {renderCommonFields()}

      {/* Role-specific fields */}
      {formData.role === "student" && renderStudentFields()}
      {formData.role === "faculty" && renderFacultyFields()}
      {formData.role === "mentor" && renderMentorFields()}
      {formData.role === "coordinator" && renderCoordinatorFields()}

      <Button type="submit" className="w-full">Save Changes</Button>
    </form>
  )
}
