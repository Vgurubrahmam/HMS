"use client"

import { useState } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUsers } from "@/hooks/use-users"
import { useTeams } from "@/hooks/use-teams"

export default function CoordinatorMentorsPage() {
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [newMentor, setNewMentor] = useState({
    name: "",
    email: "",
    department: "",
    phone: "",
    bio: "",
    expertise: [] as string[],
    role: "mentor",
  })

  const { toast } = useToast()

  const { users: mentors, loading: mentorsLoading, createUser } = useUsers({ role: "mentor" })
  const { teams } = useTeams()

  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"]

  const handleCreateMentor = async () => {
    try {
      if (!newMentor.name || !newMentor.email || !newMentor.department) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const response = await createUser(newMentor)

      if (response.success) {
        setIsCreateDialogOpen(false)
        setNewMentor({
          name: "",
          email: "",
          department: "",
          phone: "",
          bio: "",
          expertise: [],
          role: "mentor",
        })
        toast({
          title: "Mentor Added",
          description: "New mentor has been successfully added.",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create mentor",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const getMentorTeams = (mentorId: string) => {
    return teams.filter((team: any) => team.mentor?._id === mentorId)
  }

  const filteredMentors = mentors.filter((mentor: any) => {
    const matchesSearch =
      (mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (mentor.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesDepartment = departmentFilter === "all" || mentor.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  if (mentorsLoading) {
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
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newMentor.name}
                      onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                      placeholder="Enter full name"
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

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={newMentor.bio}
                    onChange={(e) => setNewMentor({ ...newMentor, bio: e.target.value })}
                    placeholder="Enter mentor bio and background"
                    rows={3}
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
                          <AvatarImage src={mentor.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {mentor.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{mentor.name}</CardTitle>
                          <CardDescription>{mentor.department}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedMentor(mentor)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
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
                          <Button variant="outline" size="sm" className="flex-1">
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
                                  <AvatarImage src={mentor.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {mentor.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{mentor.name}</p>
                                  <p className="text-sm text-gray-600">Mentor</p>
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
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="h-4 w-4" />
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
                            <AvatarImage src={mentor.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {mentor.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{mentor.name}</CardTitle>
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
                          <Button variant="outline" size="sm" className="mt-2">
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
                <DialogTitle>{selectedMentor.name}</DialogTitle>
                <DialogDescription>{selectedMentor.department} Department</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedMentor.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {selectedMentor.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedMentor.name}</h3>
                    <p className="text-gray-600">{selectedMentor.department}</p>
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

                {selectedMentor.bio && (
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedMentor.bio}</p>
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
                  <Button variant="outline" className="flex-1">
                    <Users className="mr-2 h-4 w-4" />
                    Assign Team
                  </Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
