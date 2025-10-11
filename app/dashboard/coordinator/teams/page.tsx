"use client"

import { useState,useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  MessageSquare,
  Award,
  Loader2,
  Search,
  Filter,
  UserMinus,
  Crown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTeams } from "@/hooks/use-teams"
import { useHackathons } from "@/hooks/use-hackathons"
import { useUsers } from "@/hooks/use-users"

export default function CoordinatorTeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading,setLoading]=useState(false)
  const [teams, setTeams] = useState<any[]>([])

  const [newTeam, setNewTeam] = useState({
    name: "",
    hackathon: "",
    projectTitle: "",
    projectDescription: "",
    room: "",
    teamLead: "",
    members: [] as string[],
  })
const formmatedTeam={
  name: newTeam.name,
    hackathon: newTeam.hackathon,
    projectTitle: newTeam.projectTitle,
    projectDescription: newTeam.projectDescription,
    room: newTeam.room,
    teamLead: newTeam.teamLead,
    members: newTeam.members,
}
  const { toast } = useToast()

  const { loading: teamsLoading, error: teamsError, createTeam, updateTeam, deleteTeam } = useTeams() as {
    teams: any[],
    loading: boolean,
    error: any,
    createTeam: any,
    updateTeam: any,
    deleteTeam: any,
  }
  const [hackathons,setHackathons] = useState([])
  const { users: students } = useUsers({ role: "student" })
  const { users: mentors } = useUsers({ role: "mentor" })
 const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    hackathonId: '',
    mentorId: '',
    status: 'all',
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "Inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      case "Planning":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
// get hackathons methods
 useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await fetch("/api/hackathons", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        })
        const data = await res.json()

        if (res.ok) {
          setHackathons(data.data)
          // toast({
          //   title: "Success",
          //   description: "Hackathons fetched successfully",
          // })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.message || "Error feteching hackthons"
          })
        }

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Something went wrong while fetching hackathons"

        })
      } finally {
        setLoading(false)
      }
    }
    fetchHackathons()
  }, [])
  const handleCreateTeam = async (e: React.FormEvent) => {
     e.preventDefault();
    setLoading(true);
  try {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formmatedTeam),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create team');
    }

    fetchTeams();
    setNewTeam({
      name: "",
      hackathon: "",
      projectTitle: "",
      projectDescription: "",
      room: "",
      teamLead: "",
      members: [],
    });
    setSelectedTeam(null); // Clear edit-related state
    setIsCreateDialogOpen(false);
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || 'An unexpected error occurred',
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
// get teams method
useEffect(()=>{
    fetchTeams()

},[])
  const fetchTeams = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/teams`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok && data.data) { 
        setTeams(data.data);
        // toast({
        //   title: 'Success',
        //   description: data.message || 'Teams fetched successfully',
        // });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Failed to fetch teams',
        });
      }
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Something went wrong while fetching teams',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [filters, pagination.page]); // Re-fetch when filters or page change

  // Optional: Handle filter changes (e.g., from input fields or dropdowns)
  interface TeamFilters {
    hackathonId: string;
    mentorId: string;
    status: string;
  }

  type HandleFilterChange = (newFilters: Partial<TeamFilters>) => void;

  const handleFilterChange: HandleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  // Optional: Handle page change
  interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev: Pagination) => ({ ...prev, page: newPage }));
  };

  const handleAddMember = async (teamId: string, memberId: string) => {
    try {
      const team = teams.find((t: any) => t._id === teamId)
      if (!team) return

      const updatedMembers = [...(team.members?.map((m: any) => m._id) || []), memberId]

      const response = await updateTeam(teamId, { members: updatedMembers })

      if (response.success) {
        toast({
          title: "Member Added",
          description: "Team member has been successfully added.",
        })
        setIsAddMemberDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to add member",
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

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    try {
      const team = teams.find((t: any) => t._id === teamId)
      if (!team) return

      const updatedMembers = team.members?.filter((m: any) => m._id !== memberId).map((m: any) => m._id) || []

      const response = await updateTeam(teamId, { members: updatedMembers })

      if (response.success) {
        toast({
          title: "Member Removed",
          description: "Team member has been successfully removed.",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to remove member",
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

  const handleDeleteTeam = async (id: string) => {
    try {
      const response = await deleteTeam(id)

      if (response.success) {
        toast({
          title: "Team Deleted",
          description: "Team has been successfully deleted.",
        })
        fetchTeams()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete team",
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

  const filteredTeams = teams.filter((team: any) => {
    const matchesSearch =
      (team.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (team.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === "all" || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  if (teamsLoading) {
    return (
      <DashboardLayout userRole="coordinator">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading teams...</span>
        </div>
      </DashboardLayout>
    )
  }

  // if (teamsError) {
  //   return (
  //     <DashboardLayout userRole="coordinator">
  //       <div className="text-center py-8">
  //         <p className="text-red-600">Error: {teamsError}</p>
  //       </div>
  //     </DashboardLayout>
  //   )
  // }

  return (
    <DashboardLayout userRole="coordinator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Create, manage, and monitor hackathon teams</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button> 
                <Plus className="mr-2 h-4 w-4" />
                Create Team

              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>Form a new team for a hackathon</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { handleCreateTeam(e); }}>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name *</Label>
                    <Input
                      id="teamName"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="Enter team name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hackathon">Hackathon *</Label>
                    <Select
                      value={newTeam.hackathon}
                      onValueChange={(value) => setNewTeam({ ...newTeam, hackathon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hackathon" />
                      </SelectTrigger>
                      <SelectContent>
                        {hackathons?.map((hackathon: any) => (
                          <SelectItem key={hackathon._id} value={hackathon._id}>
                            {hackathon.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    value={newTeam.projectTitle}
                    onChange={(e) => setNewTeam({ ...newTeam, projectTitle: e.target.value })}
                    placeholder="Enter project title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <Textarea
                    id="projectDescription"
                    value={newTeam.projectDescription}
                    onChange={(e) => setNewTeam({ ...newTeam, projectDescription: e.target.value })}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamLead">Team Lead *</Label>
                    <Select
                      value={newTeam.teamLead}
                      onValueChange={(value) => setNewTeam({ ...newTeam, teamLead: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team lead" />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.map((student: any) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.name} - {student.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Assigned Room</Label>
                    <Select value={newTeam.room} onValueChange={(value) => setNewTeam({ ...newTeam, room: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lab A-101">Lab A-101</SelectItem>
                        <SelectItem value="Lab B-205">Lab B-205</SelectItem>
                        <SelectItem value="Lab C-301">Lab C-301</SelectItem>
                        <SelectItem value="Conference Room 1">Conference Room 1</SelectItem>
                        <SelectItem value="Conference Room 2">Conference Room 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Team Members</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {students
                      .filter((student: any) => student._id !== newTeam.teamLead)
                      .map((student: any) => (
                        <div key={student._id} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={student._id}
                            checked={newTeam.members.includes(student._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewTeam({
                                  ...newTeam,
                                  members: [...newTeam.members, student._id],
                                })
                              } else {
                                setNewTeam({
                                  ...newTeam,
                                  members: newTeam.members.filter((id) => id !== student._id),
                                })
                              }
                            }}
                          />
                          <Label htmlFor={student._id} className="text-sm">
                            {student.name} - {student.email}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button  type="submit">Create Team</Button>
              </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
            <div className="grid gap-6">
              {filteredTeams?.map((team: any) => (
                <Card key={team._id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{team.name}</CardTitle>
                        <CardDescription className="mt-1">{team.hackathon?.title}</CardDescription>
                        <p className="text-sm font-medium text-gray-900 mt-2">{team.projectTitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(team.status)}>{team.status}</Badge>
                        <Badge className={getSubmissionStatusColor(team.submissionStatus)}>
                          {team.submissionStatus}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(team)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTeam(team._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Team Members */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Team Members ({team.members?.length || 0})
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTeamForMembers(team)
                              setIsAddMemberDialogOpen(true)
                            }}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Add Member
                          </Button>
                        </div>
                        {/* <div className="flex flex-wrap gap-2">
                          {team.members?.map((member: any) => (
                            member && (
                              <div key={member._id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 group">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {member.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-1">
                                    <p className="text-xs font-medium">{member.name}</p>
                                    {member._id === team.teamLead?._id && <Crown className="h-3 w-3 text-yellow-500" />}
                                  </div>
                                  <p className="text-xs text-gray-500">{member.role}</p>
                                </div>
                                {member._id !== team.teamLead?._id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                    onClick={() => handleRemoveMember(team._id, member._id)}
                                  >
                                    <UserMinus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )
                          ))}
                        </div> */}
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Project Progress</span>
                          <span>{team.progress}%</span>
                        </div>
                        <Progress value={team.progress} className="h-2" />
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Mentor:</span>
                          <p className="font-medium">{team.mentor?.name || "Not assigned"}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Room:</span>
                          <p className="font-medium">{team.room || "Not assigned"}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message Team
                        </Button>
                        <Button variant="outline" size="sm">
                          <Award className="h-3 w-3 mr-1" />
                          View Submission
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Team</th>
                        <th className="text-left p-4">Hackathon</th>
                        <th className="text-left p-4">Members</th>
                        <th className="text-left p-4">Progress</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeams.map((team: any) => (
                        <tr key={team._id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-sm text-gray-600">{team.projectTitle}</p>
                            </div>
                          </td>
                          <td className="p-4">{team.hackathon?.title}</td>
                          <td className="p-4">
                            {/* <div className="flex -space-x-2">
                              {team.members?.slice(0, 3).map((member: any) => (
                                <Avatar key={member._id} className="h-6 w-6 border-2 border-white">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">
                                    {member.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {team.members?.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                                  +{team.members.length - 3}
                                </div>
                              )}
                            </div> */}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Progress value={team.progress} className="w-16 h-2" />
                              <span className="text-sm">{team.progress}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(team.status)}>{team.status}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(team)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteTeam(team._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredTeams.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No teams found. Create your first team to get started!</p>
            </CardContent>
          </Card>
        )}

        {/* Add Member Dialog */}
        <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>Add a new member to {selectedTeamForMembers?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {students
                .filter(
                  (student: any) => !selectedTeamForMembers?.members?.some((member: any) => member._id === student._id),
                )
                .map((student: any) => (
                  <div key={student._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {student.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAddMember(selectedTeamForMembers._id, student._id)}>
                      Add
                    </Button>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Details Modal */}
        {selectedTeam && (
          <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedTeam.name}</DialogTitle>
                <DialogDescription>{selectedTeam.hackathon?.title}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Project Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium">{selectedTeam.projectTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusColor(selectedTeam.status)}>{selectedTeam.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span>{selectedTeam.room || "Not assigned"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span>{selectedTeam.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Mentor Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span>{selectedTeam.mentor?.name || "Not assigned"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{selectedTeam.mentor?.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Team Members</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTeam.members?.map((member: any) => (
                      <div key={member?._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member?.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member?.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="font-medium">{member?.name}</p>
                              {member?._id === selectedTeam.teamLead?._id && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{member?.role}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{member?.email}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTeam.projectDescription && (
                  <div>
                    <h4 className="font-medium mb-3">Project Description</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedTeam.projectDescription}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
