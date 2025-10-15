"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  UserCheck,
  Plus,
  Edit,
  Eye,
  MessageSquare,
  Users,
  Loader2,
  Search,
  Filter,
  Star,
  Mail,
  Phone,
  Trash2,
  RefreshCw,
  UserPlus,
  Link as LinkIcon,
  Save,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"
import { getValidToken } from "@/lib/auth-utils"

function CoordinatorMentorsContent() {
  const [mentors, setMentors] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [unassignedTeams, setUnassignedTeams] = useState<any[]>([])
  const [loadingMentors, setLoadingMentors] = useState(true)
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [editingMentor, setEditingMentor] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
  const [selectedTeamsForAssignment, setSelectedTeamsForAssignment] = useState<string[]>([])
  const [assignmentMentor, setAssignmentMentor] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [newMentor, setNewMentor] = useState({
    username: "",
    email: "",
    department: "",
    phone: "",
    designation: "",
    specialization: "",
    expertise: [] as string[],
    company: "",
    experience: "",
    gender: "",
    image: "",
  })

  const { toast } = useToast()

  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"]

  // Fetch all data on component mount
  useEffect(() => {
    fetchMentors()
    fetchTeams()
  }, [])

  const fetchMentors = async () => {
    try {
      setLoadingMentors(true)
      const token = getValidToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/mentors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setMentors(data.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch mentors",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching mentors:', error)
      toast({
        title: "Error",
        description: "Failed to fetch mentors",
        variant: "destructive",
      })
    } finally {
      setLoadingMentors(false)
    }
  }

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true)
      const token = getValidToken()
      if (!token) return

      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTeams(data.data || [])
        setUnassignedTeams((data.data || []).filter((team: any) => !team.mentor))
      } else {
        toast({
          title: "Error", 
          description: "Failed to fetch teams",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast({
        title: "Error",
        description: "Failed to fetch teams", 
        variant: "destructive",
      })
    } finally {
      setLoadingTeams(false)
    }
  }

  const refreshData = async () => {
    await Promise.all([fetchMentors(), fetchTeams()])
    toast({
      title: "Data Refreshed",
      description: "Mentor and team data has been updated.",
    })
  }

  const handleCreateMentor = async () => {
    try {
      if (!newMentor.username || !newMentor.email || !newMentor.department) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const token = getValidToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newMentor),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setNewMentor({
          username: "",
          email: "",
          department: "",
          phone: "",
          designation: "",
          specialization: "",
          expertise: [],
          company: "",
          experience: "",
          gender: "",
          image: "",
        })
        await fetchMentors()
        toast({
          title: "Success",
          description: "New mentor has been successfully added.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to create mentor",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating mentor:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleUpdateMentor = async () => {
    try {
      if (!editingMentor?.username || !editingMentor?.email || !editingMentor?.department) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/mentors/${editingMentor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingMentor),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingMentor(null)
        await fetchMentors()
        toast({
          title: "Success",
          description: "Mentor has been successfully updated.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to update mentor",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating mentor:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMentor = async (mentorId: string) => {
    try {
      const response = await fetch(`/api/mentors/${mentorId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchMentors()
        await fetchTeams() // Refresh teams as mentor assignments may have changed
        toast({
          title: "Success",
          description: "Mentor has been successfully deleted.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete mentor",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting mentor:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleAssignTeams = async () => {
    try {
      if (!assignmentMentor || selectedTeamsForAssignment.length === 0) {
        toast({
          title: "Error",
          description: "Please select teams to assign",
          variant: "destructive",
        })
        return
      }

      const promises = selectedTeamsForAssignment.map(teamId =>
        fetch(`/api/teams/${teamId}/assign-mentor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mentorId: assignmentMentor._id }),
        })
      )

      const responses = await Promise.all(promises)
      const allSuccessful = responses.every(response => response.ok)

      if (allSuccessful) {
        setIsAssignmentDialogOpen(false)
        setSelectedTeamsForAssignment([])
        setAssignmentMentor(null)
        await fetchTeams()
        toast({
          title: "Success",
          description: `Successfully assigned ${selectedTeamsForAssignment.length} team(s) to ${assignmentMentor.username}.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Some team assignments failed. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error assigning teams:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during team assignment",
        variant: "destructive",
      })
    }
  }

  const handleUnassignTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/unassign-mentor`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchTeams()
        toast({
          title: "Success",
          description: "Team has been unassigned from mentor.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to unassign team",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error unassigning team:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const getMentorTeams = (mentorId: string) => {
    return teams.filter((team: any) => team.mentor?._id === mentorId || team.mentor?.id === mentorId)
  }

  const filteredMentors = mentors.filter((mentor: any) => {
    const matchesSearch =
      (mentor.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (mentor.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (mentor.department?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (mentor.expertise?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())) || false)
    const matchesDepartment = departmentFilter === "all" || mentor.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const startEdit = (mentor: any) => {
    setEditingMentor({ ...mentor })
    setIsEditDialogOpen(true)
  }

  const startAssignment = (mentor: any) => {
    setAssignmentMentor(mentor)
    setSelectedTeamsForAssignment([])
    setIsAssignmentDialogOpen(true)
  }

  const loading = loadingMentors || loadingTeams

  if (loading) {
    return (
      <DashboardLayout userRole="coordinator">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading mentors...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Mentor Management</h1>
            <p className="text-gray-600">Manage mentors and their team assignments</p>
          </div>
          <div className="flex gap-2">
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Mentor
              </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Mentor</DialogTitle>
                  <DialogDescription>Add a new mentor to the platform</DialogDescription>
                </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={newMentor.username}
                      onChange={(e) => setNewMentor({ ...newMentor, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMentor.email}
                      onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={newMentor.department}
                      onValueChange={(value) => setNewMentor({ ...newMentor, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newMentor.phone}
                      onChange={(e) => setNewMentor({ ...newMentor, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={newMentor.designation}
                      onChange={(e) => setNewMentor({ ...newMentor, designation: e.target.value })}
                      placeholder="Enter designation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience</Label>
                    <Input
                      id="experience"
                      value={newMentor.experience}
                      onChange={(e) => setNewMentor({ ...newMentor, experience: e.target.value })}
                      placeholder="e.g., 5 years"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newMentor.company}
                      onChange={(e) => setNewMentor({ ...newMentor, company: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={newMentor.gender}
                      onValueChange={(value) => setNewMentor({ ...newMentor, gender: value })}
                    >
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Textarea
                    id="specialization"
                    value={newMentor.specialization}
                    onChange={(e) => setNewMentor({ ...newMentor, specialization: e.target.value })}
                    placeholder="Enter area of specialization"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">Expertise Areas</Label>
                  <Input
                    id="expertise"
                    value={newMentor.expertise.join(", ")}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, expertise: e.target.value.split(", ").filter(Boolean) })
                    }
                    placeholder="Enter expertise areas separated by commas"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMentor}>Add Mentor</Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Mentors</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mentors.length}</div>
              <p className="text-xs text-gray-600 mt-1">Active mentors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Assigned Teams</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.filter((team: any) => team.mentor).length}</div>
              <p className="text-xs text-gray-600 mt-1">Teams with mentors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unassigned Teams</CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.filter((team: any) => !team.mentor).length}</div>
              <p className="text-xs text-gray-600 mt-1">Need mentors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Teams/Mentor</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mentors.length > 0
                  ? Math.round((teams.filter((team: any) => team.mentor).length / mentors.length) * 10) / 10
                  : 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Teams per mentor</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search mentors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="assignments">Team Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor: any) => {
                const mentorTeams = getMentorTeams(mentor._id)
                return (
                  <Card key={mentor._id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={mentor.image || "/placeholder.svg"} />
                          <AvatarFallback>
                            {mentor.username
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{mentor.username}</CardTitle>
                          <CardDescription>{mentor.department}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedMentor(mentor)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => startEdit(mentor)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Mentor</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {mentor.name}? This action cannot be undone.
                                  All team assignments will be removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMentor(mentor._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{mentor.email}</span>
                        </div>
                        {mentor.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{mentor.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Assigned Teams:</span>
                          <Badge variant="outline">{mentorTeams.length}</Badge>
                        </div>

                        {mentor.expertise && mentor.expertise.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Expertise:</p>
                            <div className="flex flex-wrap gap-1">
                              {mentor.expertise.slice(0, 3).map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {mentor.expertise.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{mentor.expertise.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => startAssignment(mentor)}>
                            <Users className="h-3 w-3 mr-1" />
                            Assign Team
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Mentor</th>
                        <th className="text-left p-4">Department</th>
                        <th className="text-left p-4">Contact</th>
                        <th className="text-left p-4">Teams</th>
                        <th className="text-left p-4">Expertise</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMentors.map((mentor: any) => {
                        const mentorTeams = getMentorTeams(mentor._id)
                        return (
                          <tr key={mentor._id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={mentor.image || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {mentor.username
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{mentor.username}</p>
                                  <p className="text-sm text-gray-600">{mentor.designation || "Mentor"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">{mentor.department}</td>
                            <td className="p-4">
                              <div className="text-sm">
                                <p>{mentor.email}</p>
                                {mentor.phone && <p className="text-gray-600">{mentor.phone}</p>}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">{mentorTeams.length} teams</Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {mentor.expertise?.slice(0, 2).map((skill: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {mentor.expertise?.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{mentor.expertise.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedMentor(mentor)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => startEdit(mentor)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => startAssignment(mentor)}>
                                  <Users className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Trash2 className="h-4 w-4" />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Mentor</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete {mentor.username}? This action cannot be undone.
                                          All team assignments will be removed.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteMentor(mentor._id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="grid gap-6">
              {mentors.map((mentor: any) => {
                const mentorTeams = getMentorTeams(mentor._id)
                return (
                  <Card key={mentor._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={mentor.image || "/placeholder.svg"} />
                            <AvatarFallback>
                              {mentor.username
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{mentor.username}</CardTitle>
                            <CardDescription>{mentor.department}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">{mentorTeams.length} teams</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {mentorTeams.length > 0 ? (
                        <div className="space-y-3">
                          {mentorTeams.map((team: any) => (
                            <div key={team._id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{team.name}</p>
                                <p className="text-sm text-gray-600">{team.projectTitle}</p>
                                <p className="text-xs text-gray-500">{team.hackathon?.title}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{team.members?.length || 0} members</Badge>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No teams assigned</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => startAssignment(mentor)}>
                            Assign Team
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        {filteredMentors.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No mentors found. Add your first mentor to get started!</p>
            </CardContent>
          </Card>
        )}

        {/* Mentor Details Modal */}
        {selectedMentor && (
          <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedMentor.username}</DialogTitle>
                <DialogDescription>{selectedMentor.department} Department</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedMentor.image || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {selectedMentor.username
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedMentor.username}</h3>
                    <p className="text-gray-600">{selectedMentor.department}</p>
                    {selectedMentor.designation && (
                      <p className="text-sm text-gray-500">{selectedMentor.designation}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedMentor.email}
                      </span>
                      {selectedMentor.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedMentor.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedMentor.specialization && (
                  <div>
                    <h4 className="font-medium mb-2">Specialization</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedMentor.specialization}</p>
                  </div>
                )}

                {selectedMentor.company && (
                  <div>
                    <h4 className="font-medium mb-2">Company</h4>
                    <p className="text-sm text-gray-700">{selectedMentor.company}</p>
                  </div>
                )}

                {selectedMentor.experience && (
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <p className="text-sm text-gray-700">{selectedMentor.experience}</p>
                  </div>
                )}

                {selectedMentor.expertise && selectedMentor.expertise.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Expertise Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.expertise.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Assigned Teams ({getMentorTeams(selectedMentor._id).length})</h4>
                  {getMentorTeams(selectedMentor._id).length > 0 ? (
                    <div className="space-y-2">
                      {getMentorTeams(selectedMentor._id).map((team: any) => (
                        <div key={team._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{team.name}</p>
                            <p className="text-sm text-gray-600">{team.projectTitle}</p>
                            <p className="text-xs text-gray-500">{team.hackathon?.title}</p>
                          </div>
                          <Badge variant="outline">{team.members?.length || 0} members</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">No teams assigned yet</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => startAssignment(selectedMentor)}>
                    <Users className="mr-2 h-4 w-4" />
                    Assign Team
                  </Button>
                  <Button variant="outline" onClick={() => startEdit(selectedMentor)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Mentor Dialog */}
        {editingMentor && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Mentor</DialogTitle>
                <DialogDescription>Update mentor information</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-username">Username *</Label>
                    <Input
                      id="edit-username"
                      value={editingMentor.username || ""}
                      onChange={(e) => setEditingMentor({ ...editingMentor, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingMentor.email || ""}
                      onChange={(e) => setEditingMentor({ ...editingMentor, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-department">Department *</Label>
                    <Select
                      value={editingMentor.department || ""}
                      onValueChange={(value) => setEditingMentor({ ...editingMentor, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input
                      id="edit-phone"
                      value={editingMentor.phone || ""}
                      onChange={(e) => setEditingMentor({ ...editingMentor, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-designation">Designation</Label>
                    <Input
                      id="edit-designation"
                      value={editingMentor.designation || ""}
                      onChange={(e) => setEditingMentor({ ...editingMentor, designation: e.target.value })}
                      placeholder="Enter designation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-experience">Experience</Label>
                    <Input
                      id="edit-experience"
                      value={editingMentor.experience || ""}
                      onChange={(e) => setEditingMentor({ ...editingMentor, experience: e.target.value })}
                      placeholder="e.g., 5 years"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-company">Company</Label>
                    <Input
                      id="edit-company"
                      value={editingMentor.company || ""}
                      onChange={(e) => setEditingMentor({ ...editingMentor, company: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select
                      value={editingMentor.gender || ""}
                      onValueChange={(value) => setEditingMentor({ ...editingMentor, gender: value })}
                    >
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-specialization">Specialization</Label>
                  <Textarea
                    id="edit-specialization"
                    value={editingMentor.specialization || ""}
                    onChange={(e) => setEditingMentor({ ...editingMentor, specialization: e.target.value })}
                    placeholder="Enter area of specialization"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-expertise">Expertise Areas</Label>
                  <Input
                    id="edit-expertise"
                    value={(editingMentor.expertise || []).join(", ")}
                    onChange={(e) =>
                      setEditingMentor({ 
                        ...editingMentor, 
                        expertise: e.target.value.split(", ").filter(Boolean) 
                      })
                    }
                    placeholder="Enter expertise areas separated by commas"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateMentor}>
                  <Save className="mr-2 h-4 w-4" />
                  Update Mentor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Team Assignment Dialog */}
        {assignmentMentor && (
          <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Assign Teams to {assignmentMentor.username}</DialogTitle>
                <DialogDescription>
                  Select teams to assign to this mentor. Unassigned teams are shown below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {unassignedTeams.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {unassignedTeams.map((team: any) => (
                      <div key={team._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={selectedTeamsForAssignment.includes(team._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTeamsForAssignment([...selectedTeamsForAssignment, team._id])
                            } else {
                              setSelectedTeamsForAssignment(
                                selectedTeamsForAssignment.filter(id => id !== team._id)
                              )
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{team.name || "Unnamed Team"}</p>
                          <p className="text-sm text-gray-600">{team.projectTitle || team.hackathon?.title || "Unknown Project"}</p>
                          <p className="text-xs text-gray-500">
                            {team.members?.length || 0} members
                          </p>
                        </div>
                        <Badge variant="outline">
                          {team.category || "No Category"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No unassigned teams available</p>
                    <p className="text-sm">All teams are currently assigned to mentors</p>
                  </div>
                )}
                
                {selectedTeamsForAssignment.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      Selected {selectedTeamsForAssignment.length} team(s) for assignment
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignTeams}
                  disabled={selectedTeamsForAssignment.length === 0}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Assign {selectedTeamsForAssignment.length} Team(s)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function CoordinatorMentorsPage() {
  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <CoordinatorMentorsContent />
    </ProtectedRoute>
  )
}
