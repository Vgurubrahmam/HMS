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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<any>(null)
  const [editingTeam, setEditingTeam] = useState<any>(null)
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
    status: "Active",
    submissionStatus: "Planning",
    progress: 0,
  })
const formmatedTeam={
  name: newTeam.name,
    hackathon: newTeam.hackathon,
    projectTitle: newTeam.projectTitle,
    projectDescription: newTeam.projectDescription,
    room: newTeam.room,
    teamLead: newTeam.teamLead,
    members: newTeam.members,
    status: newTeam.status,
    submissionStatus: newTeam.submissionStatus,
    progress: newTeam.progress,
}

  const handleEditTeam = (team: any) => {
    setEditingTeam(team);
    setNewTeam({
      name: team.name || "",
      hackathon: team.hackathon?._id || "",
      projectTitle: team.projectTitle || "",
      projectDescription: team.projectDescription || "",
      room: team.room || "",
      teamLead: team.teamLead?._id || "",
      members: team.members?.filter((m: any) => m && m._id).map((m: any) => m._id) || [],
      status: team.status || "Active",
      submissionStatus: team.submissionStatus || "Planning",
      progress: team.progress || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Updating team with data:', formmatedTeam);
      console.log('Team ID:', editingTeam._id);
      
      const response = await fetch(`/api/teams/${editingTeam._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formmatedTeam),
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (!response.ok) {
        console.error('Update failed with status:', response.status);
        throw new Error(data.error || data.details || 'Failed to update team');
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
        status: "Active",
        submissionStatus: "Planning",
        progress: 0,
      });
      setEditingTeam(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Team updated successfully",
      });
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
    hackathonId: 'all',
    mentorId: 'all',
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
    console.log('Creating team with data:', formmatedTeam);
    
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formmatedTeam),
    });

    const data = await response.json();
    console.log('Create response:', data);

    if (!response.ok) {
      console.error('Create failed with status:', response.status);
      throw new Error(data.error || data.details || 'Failed to create team');
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
      status: "Active",
      submissionStatus: "Planning",
      progress: 0,
    });
    setSelectedTeam(null); // Clear edit-related state
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Team created successfully",
    });
    
    // Small delay before fetching to ensure database consistency
    setTimeout(() => {
      fetchTeams();
    }, 500);
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

      // Build query parameters for filtering
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.hackathonId && filters.hackathonId !== 'all') queryParams.append('hackathon', filters.hackathonId);
      if (filters.mentorId && filters.mentorId !== 'all') queryParams.append('mentor', filters.mentorId);
      if (filters.status !== 'all') queryParams.append('status', filters.status);

      const res = await fetch(`/api/teams?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      console.log('Fetch teams response:', data);

      if (res.ok && data.success && data.data) { 
        const filteredTeams = Array.isArray(data.data) ? data.data.filter((team: any) => team && team._id) : [];
        console.log('Filtered teams:', filteredTeams);
        console.log('First team:', filteredTeams[0]);
        console.log('First team members:', filteredTeams[0]?.members);
        console.log('First team members type:', typeof filteredTeams[0]?.members);
        console.log('First team member example:', filteredTeams[0]?.members?.[0]);
        
        setTeams(filteredTeams);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 1
        }));
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || data.message || 'Failed to fetch teams',
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

      const updatedMembers = [...(team.members?.filter((m: any) => m && m._id).map((m: any) => m._id) || []), memberId]

      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: updatedMembers })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Member Added",
          description: "Team member has been successfully added.",
        })
        setIsAddMemberDialogOpen(false)
        fetchTeams(); // Refresh teams list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add member",
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

      const updatedMembers = team.members?.filter((m: any) => m && m._id && m._id !== memberId).map((m: any) => m._id) || []

      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: updatedMembers })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Member Removed",
          description: "Team member has been successfully removed.",
        })
        fetchTeams(); // Refresh teams list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to remove member",
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
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Team Deleted",
          description: "Team has been successfully deleted.",
        })
        fetchTeams()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete team",
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

  const filteredTeams = teams?.filter((team: any) => {
    if (!team || !team._id) return false;
    const matchesSearch =
      (team.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (team.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === "all" || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || []

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
                        {hackathons?.filter((hackathon: any) => hackathon && hackathon._id).map((hackathon: any) => (
                          <SelectItem key={hackathon._id} value={hackathon._id}>
                            {hackathon.title || "Untitled Hackathon"}
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
                        {students?.filter((student: any) => student && student._id).map((student: any) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.name || "Unknown"} - {student.email || "No email"}
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Team Status</Label>
                    <Select value={newTeam.status} onValueChange={(value) => setNewTeam({ ...newTeam, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="submissionStatus">Submission Status</Label>
                    <Select value={newTeam.submissionStatus} onValueChange={(value) => setNewTeam({ ...newTeam, submissionStatus: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select submission status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progress">Progress (%)</Label>
                    <Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={newTeam.progress}
                      onChange={(e) => setNewTeam({ ...newTeam, progress: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Team Members</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {students
                      ?.filter((student: any) => student && student._id && student._id !== newTeam.teamLead)
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

        {/* Edit Team Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
              <DialogDescription>Update team information and settings</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateTeam}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editTeamName">Team Name *</Label>
                    <Input
                      id="editTeamName"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="Enter team name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editHackathon">Hackathon *</Label>
                    <Select
                      value={newTeam.hackathon}
                      onValueChange={(value) => setNewTeam({ ...newTeam, hackathon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hackathon" />
                      </SelectTrigger>
                      <SelectContent>
                        {hackathons?.filter((hackathon: any) => hackathon && hackathon._id).map((hackathon: any) => (
                          <SelectItem key={hackathon._id} value={hackathon._id}>
                            {hackathon.title || "Untitled Hackathon"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editProjectTitle">Project Title *</Label>
                  <Input
                    id="editProjectTitle"
                    value={newTeam.projectTitle}
                    onChange={(e) => setNewTeam({ ...newTeam, projectTitle: e.target.value })}
                    placeholder="Enter project title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editProjectDescription">Project Description</Label>
                  <Textarea
                    id="editProjectDescription"
                    value={newTeam.projectDescription}
                    onChange={(e) => setNewTeam({ ...newTeam, projectDescription: e.target.value })}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editTeamLead">Team Lead *</Label>
                    <Select
                      value={newTeam.teamLead}
                      onValueChange={(value) => setNewTeam({ ...newTeam, teamLead: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team lead" />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.filter((student: any) => student && student._id).map((student: any) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.name || "Unknown"} - {student.email || "No email"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRoom">Assigned Room</Label>
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editStatus">Team Status</Label>
                    <Select value={newTeam.status} onValueChange={(value) => setNewTeam({ ...newTeam, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSubmissionStatus">Submission Status</Label>
                    <Select value={newTeam.submissionStatus} onValueChange={(value) => setNewTeam({ ...newTeam, submissionStatus: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select submission status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editProgress">Progress (%)</Label>
                    <Input
                      id="editProgress"
                      type="number"
                      min="0"
                      max="100"
                      value={newTeam.progress}
                      onChange={(e) => setNewTeam({ ...newTeam, progress: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Team Members</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                    {students
                      ?.filter((student: any) => student && student._id && student._id !== newTeam.teamLead)
                      .map((student: any) => (
                        <div key={student._id} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`edit-${student._id}`}
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
                          <Label htmlFor={`edit-${student._id}`} className="text-sm">
                            {student.name} - {student.email}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update Team
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.hackathonId} onValueChange={(value) => handleFilterChange({ hackathonId: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Hackathons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hackathons</SelectItem>
              {hackathons?.filter((h: any) => h && h._id).map((hackathon: any) => (
                <SelectItem key={hackathon._id} value={hackathon._id}>
                  {hackathon.title || "Untitled"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.mentorId} onValueChange={(value) => handleFilterChange({ mentorId: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Mentors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mentors</SelectItem>
              {mentors?.filter((m: any) => m && m._id).map((mentor: any) => (
                <SelectItem key={mentor._id} value={mentor._id}>
                  {mentor.name || mentor.username || "Unknown Mentor"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => handleFilterChange({ status: value })}>
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
                          <Button variant="ghost" size="sm" onClick={() => {
                            console.log('Selected team for viewing:', team);
                            console.log('Team members:', team.members);
                            console.log('Team members length:', team.members?.length);
                            setSelectedTeam(team);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditTeam(team)}>
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
                            Team Members ({team.members?.filter((m: any) => m && m._id).length || 0})
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
                        <div className="flex flex-wrap gap-2">
                          {team.members?.filter((member: any) => member && member._id).map((member: any) => (
                            <div key={member._id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 group min-w-0">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={member.image || member.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {(member.name || member.username || "?")
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium truncate">
                                    {member.name || member.username || "Unknown"}
                                  </p>
                                  {member._id === team.teamLead?._id && <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{member.email || "No email"}</p>
                                <p className="text-xs text-blue-600 capitalize">{member.role || "Member"}</p>
                                {member.skills && member.skills.length > 0 && (
                                  <p className="text-xs text-gray-400 truncate">
                                    {Array.isArray(member.skills) ? member.skills.slice(0, 2).join(", ") : member.skills}
                                  </p>
                                )}
                              </div>
                              {member._id !== team.teamLead?._id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 flex-shrink-0"
                                  onClick={() => handleRemoveMember(team._id, member._id)}
                                >
                                  <UserMinus className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
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
                            <div className="flex -space-x-2">
                              {team.members?.filter((member: any) => member && member._id).slice(0, 3).map((member: any) => (
                                <Avatar key={member._id} className="h-6 w-6 border-2 border-white">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">
                                    {member.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("") || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {(team.members?.filter((member: any) => member && member._id).length || 0) > 3 && (
                                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                                  +{(team.members?.filter((member: any) => member && member._id).length || 0) - 3}
                                </div>
                              )}
                            </div>
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
                              <Button variant="ghost" size="sm" onClick={() => handleEditTeam(team)}>
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages} ({pagination.total} teams)
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
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
                  (student: any) => student && student._id && !selectedTeamForMembers?.members?.some((member: any) => member && member._id === student._id),
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
                  <h4 className="font-medium mb-3">Team Members ({selectedTeam.members?.filter((m: any) => m && m._id).length || 0})</h4>
                  <div className="grid gap-3">
                    {selectedTeam.members?.filter((member: any) => member && member._id).map((member: any) => (
                      <div key={member._id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.image || member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {(member.name || member.username || "?")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-lg">{member.name || member.username || "Unknown"}</p>
                            {member._id === selectedTeam.teamLead?._id && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Team Lead
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span> {member.email || "Not provided"}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Role:</span> {member.role || "Member"}
                            </p>
                            {member.skills && member.skills.length > 0 && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Skills:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(Array.isArray(member.skills) ? member.skills : [member.skills]).slice(0, 5).map((skill: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {Array.isArray(member.skills) && member.skills.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{member.skills.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {member._id !== selectedTeam.teamLead?._id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(selectedTeam._id, member._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
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
