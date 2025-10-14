"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Calendar, 
  Trophy, 
  User, 
  Search, 
  Filter, 
  MoreVertical,
  Plus,
  Eye,
  Edit,
  UserPlus,
  MessageSquare,
  Settings,
  ArrowLeft,
  Loader2,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTeams } from "@/hooks/use-teams"
import { useCurrentUser } from "@/hooks/use-current-user"
import Link from "next/link"
import { useState, useMemo } from "react"

export default function StudentTeamsPage() {
  const { userData, loading: userLoading } = useCurrentUser()
  const currentUserId = userData?.id
  const { teams, loading: teamsLoading } = useTeams({ limit: 50 })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const loading = teamsLoading || userLoading

  // Filter teams where the current user is a member or team lead
  const myTeams = useMemo(() => {
    return teams.filter((team: any) => 
      team.members?.some((member: any) => member._id === currentUserId) || 
      team.teamLead?._id === currentUserId
    )
  }, [teams, currentUserId])

  // Filter teams based on search and status
  const filteredTeams = useMemo(() => {
    let filtered = myTeams

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((team: any) =>
        team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.hackathon?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((team: any) => 
        team.status?.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    return filtered
  }, [myTeams, searchTerm, statusFilter])

  // Get team statistics
  const teamStats = useMemo(() => {
    const totalTeams = myTeams.length
    const activeTeams = myTeams.filter((t: any) => t.status === "Active").length
    const completedTeams = myTeams.filter((t: any) => t.status === "Completed").length
    const leadershipRoles = myTeams.filter((t: any) => t.teamLead?._id === currentUserId).length
    const averageProgress = totalTeams > 0 
      ? Math.round(myTeams.reduce((sum: number, team: any) => sum + (team.progress || 0), 0) / totalTeams)
      : 0

    return {
      totalTeams,
      activeTeams,
      completedTeams,
      leadershipRoles,
      averageProgress
    }
  }, [myTeams, currentUserId])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSubmissionStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-green-100 text-green-800"
      case "in progress":
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "not started":
      case "not-started":
        return "bg-gray-100 text-gray-800"
      case "under review":
      case "under-review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Not specified"
    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return "Invalid date"
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading teams...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/student">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">My Teams</h1>
              <p className="text-gray-600">Manage your hackathon teams and track progress</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/student/hackathons">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Join New Team
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalTeams}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600">{teamStats.activeTeams} active</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Leadership Roles</CardTitle>
              <User className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.leadershipRoles}</div>
              <p className="text-xs text-gray-600 mt-1">Teams you lead</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Projects</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.completedTeams}</div>
              <p className="text-xs text-gray-600 mt-1">Successfully finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Progress</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.averageProgress}%</div>
              <p className="text-xs text-gray-600 mt-1">Across all teams</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search teams, projects, or hackathons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All ({myTeams.length})
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  Active ({teamStats.activeTeams})
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("completed")}
                >
                  Completed ({teamStats.completedTeams})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams List */}
        <div className="space-y-4">
          {filteredTeams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm || statusFilter !== "all" ? "No teams found" : "No teams yet"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Join hackathons to be part of teams and collaborate on projects"
                  }
                </p>
                {(!searchTerm && statusFilter === "all") && (
                  <Link href="/dashboard/student/hackathons">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Browse Hackathons
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTeams.map((team: any) => (
              <Card key={team._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{team.name}</h3>
                        {team.teamLead?._id === currentUserId && (
                          <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                            Team Lead
                          </Badge>
                        )}
                        <Badge className={getStatusColor(team.status)}>
                          {team.status}
                        </Badge>
                        <Badge className={getSubmissionStatusColor(team.submissionStatus)}>
                          {team.submissionStatus}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{team.hackathon?.title}</p>
                      <p className="text-sm text-gray-500">
                        📅 Created: {formatDate(team.createdAt)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {team.teamLead?._id === currentUserId && (
                          <>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Team
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Invite Members
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Team Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-4">
                    {/* Project Info */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Project: {team.projectTitle || "Untitled Project"}</h4>
                      {team.projectDescription && (
                        <p className="text-sm text-gray-600">{team.projectDescription}</p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="text-gray-600">{team.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(team.progress || 0)}`}
                          style={{ width: `${team.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Team Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{team.members?.length || 0} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{team.teamLead?.username || "No lead"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{team.room || "No room"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{team.mentor?.name || "No mentor"}</span>
                      </div>
                    </div>

                    {/* Members List */}
                    {team.members && team.members.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Team Members:</h5>
                        <div className="flex flex-wrap gap-2">
                          {team.members.map((member: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {member.username || member.name || `Member ${index + 1}`}
                              {member._id === team.teamLead?._id && " (Lead)"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View Project
                        </Button>
                        {team.teamLead?._id === currentUserId && (
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {team.submissionStatus === "Submitted" && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Submitted
                          </div>
                        )}
                        {team.status === "Active" && team.progress < 100 && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Clock className="h-3 w-3" />
                            In Progress
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}