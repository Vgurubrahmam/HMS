"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Badge as BadgeIcon,
  Edit,
  Calendar,
  Users
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import ProfileForm from "@/components/ProfileForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function CoordinatorProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to view your profile",
          variant: "destructive",
        })
        return
      }

      // Decode token to get user ID
      const { jwtDecode } = await import("jwt-decode")
      const decoded: any = jwtDecode(token)
      const userId = decoded.id || decoded.userId

      if (!userId) {
        toast({
          title: "Error",
          description: "Unable to identify user",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/profiles/${userId}`)
      if (response.ok) {
        const { data } = await response.json()
        setProfile(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile)
    setIsEditModalOpen(false)
    toast({
      title: "Success",
      description: "Profile updated successfully",
    })
  }

  if (loading) {
    return (
      <DashboardLayout userRole="coordinator">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout userRole="coordinator">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No profile found</p>
            <Button onClick={fetchProfile}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="coordinator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your coordinator profile information</p>
          </div>
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <ProfileForm 
                userProfile={{
                  username: profile.username || "",
                  userId: profile.userId || "",
                  email: profile.email || "",
                  role: profile.role || "coordinator",
                  phone: profile.phone || "",
                  gender: profile.gender || "",
                  image: profile.image || "",
                  department: profile.department || "",
                  managementRole: profile.managementRole || "",
                  employeeId: profile.employeeId || "",
                }} 
                onProfileUpdate={handleProfileUpdate}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={profile.image || "/placeholder.svg"} alt={profile.username} />
                <AvatarFallback className="text-lg">
                  {profile.username?.charAt(0)?.toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{profile.username || "Coordinator"}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mt-2">
                  {profile.role?.charAt(0)?.toUpperCase() + profile.role?.slice(1) || "Coordinator"}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{profile.email || "No email provided"}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{profile.department}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeIcon className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Management Role</label>
                  <p className="mt-1">{profile.managementRole || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <p className="mt-1">{profile.department || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Employee ID</label>
                  <p className="mt-1">{profile.employeeId || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="mt-1 capitalize">{profile.gender || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p className="mt-1 font-mono text-sm">{profile.userId || "Not available"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Profile Created</label>
                <p className="mt-1">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Not available"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="mt-1">
                  {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "Not available"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Profile Image URL</label>
                <p className="mt-1 text-sm text-blue-600 break-all">
                  {profile.image || "No image URL provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
