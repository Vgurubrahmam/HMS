"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, Trophy, MessageSquare, Clock, Star, BookOpen, Loader2, Plus, Eye, RefreshCw } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { getValidToken } from "@/lib/auth-utils"

function MentorDashboardContent() {
  const { userData, loading: userLoading } = useCurrentUser()
  const { toast } = useToast()
  const currentUserId = userData?.id
  const [mentorTeams, setMentorTeams] = useState<any[]>([])
  const [mentorSessions, setMentorSessions] = useState<any[]>([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(true)

  const loading = userLoading || loadingTeams || loadingSessions

  // Fetch mentor-specific teams data
  useEffect(() => {
    if (userData?.id) {
      fetchMentorTeams()
      fetchMentorSessions()
    }
  }, [userData?.id])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!userData?.id) return

    const interval = setInterval(() => {
      fetchMentorTeams()
      fetchMentorSessions()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [userData?.id])

  const fetchMentorTeams = async () => {
    try {
      setLoadingTeams(true)
      const token = getValidToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/mentors/${currentUserId}/teams`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMentorTeams(data.teams || [])
      } else {
        throw new Error('Failed to fetch mentor teams')
      }
    } catch (error) {
      console.error('Error fetching mentor teams:', error)
      toast({
        title: "Error",
        description: "Failed to load your teams",
        variant: "destructive"
      })
      setMentorTeams([])
    } finally {
      setLoadingTeams(false)
    }
  }

  const fetchMentorSessions = async () => {
    try {
      setLoadingSessions(true)
      const token = getValidToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/mentors/${userData?.id}/sessions`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMentorSessions(data.data || [])
      } else {
        console.error('Failed to fetch mentor sessions')
        toast({
          title: "Error",
          description: "Failed to fetch mentor sessions data", 
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching mentor sessions:', error)
      toast({
        title: "Error",
        description: "Network error while fetching sessions data",
        variant: "destructive", 
      })
    } finally {
      setLoadingSessions(false)
    }
  }

  // Calculate dynamic stats from real mentor teams data
  const stats = useMemo(() => {
    const activeTeams = mentorTeams.filter((team: any) => 
      team.status === "Active" || team.status === "In Progress" || !team.status
    )
    const completedTeams = mentorTeams.filter((team: any) => 
      team.status === "Completed"
    )
    const averageProgress = mentorTeams.length > 0 
      ? Math.round(mentorTeams.reduce((sum: number, team: any) => sum + (team.progress || 0), 0) / mentorTeams.length)
      : 0
    
    // Get unique hackathons mentored
    const hackathonsMentored = new Set(
      mentorTeams
        .filter((team: any) => team.hackathon?._id)
        .map((team: any) => team.hackathon._id)
    ).size

    return [
      {
        title: "Total Teams",
        value: mentorTeams.length.toString(),
        change: `${activeTeams.length} active`,
        icon: Users,
        color: "text-blue-600",
      },
      {
        title: "Hackathons Mentored", 
        value: hackathonsMentored.toString(),
        change: `${activeTeams.length} ongoing`,
        icon: Calendar,
        color: "text-green-600",
      },
      {
        title: "Avg. Progress",
        value: `${averageProgress}%`,
        change: "Across all teams",
        icon: Trophy,
        color: "text-purple-600",
      },
      {
        title: "Success Rate",
        value: mentorTeams.length > 0 ? `${Math.round((completedTeams.length / mentorTeams.length) * 100)}%` : "0%",
        change: `${completedTeams.length} completed`,
        icon: Star,
        color: "text-orange-600",
      },
    ]
  }, [mentorTeams])

  // Get active teams with enhanced data from real mentor teams
  const activeTeams = useMemo(() => {
    return mentorTeams
      .map((team: any) => ({
        id: team._id,
        name: team.name || "Unnamed Team",
        hackathon: team.hackathon?.title || "Unknown Hackathon",
        members: team.members?.length || 0,
        progress: team.progress || 0,
        lastUpdate: formatLastUpdate(team.updatedAt || team.createdAt),
        status: getTeamStatusLabel(team.progress || 0, team.status),
        projectTitle: team.projectTitle || "No Project Title",
        room: team.room || "Not Assigned",
        team: team
      }))
      .slice(0, 5) // Show top 5
  }, [mentorTeams])

  // Get real upcoming meetings from mentor sessions
  const upcomingMeetings = useMemo(() => {
    return mentorSessions
      .filter((session: any) => 
        session.status === "Scheduled" && 
        new Date(session.scheduledAt) > new Date()
      )
      .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 3)
      .map((session: any) => ({
        team: session.team?.name || "Unknown Team",
        time: formatMeetingTime(session.scheduledAt),
        topic: session.title || "Mentoring Session",
        type: session.type || "Meeting",
        teamId: session.team?._id,
        sessionId: session._id
      }))
  }, [mentorSessions])

  // Get recent messages/communications from teams
  const recentMessages = useMemo(() => {
    return activeTeams.slice(0, 3).map((team, index) => ({
      team: team.name,
      member: team.team.members?.[0]?.username || team.team.project?.teamLead || "Team Lead",
      message: getRecentMessage(team.progress, index),
      time: getMessageTime(index),
      unread: index === 0, // First message is unread
      teamId: team.id,
      avatar: team.team.members?.[0]?.image || "/placeholder.svg"
    }))
  }, [activeTeams])

  

  // Helper functions
  function formatLastUpdate(dateString: string) {
    if (!dateString) return "No updates"
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  function formatMeetingTime(dateString: string) {
    if (!dateString) return "TBD"
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 24) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffInDays === 1) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffInDays < 7) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return `${dayNames[date.getDay()]}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString() + `, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
  }

  function getTeamStatusLabel(progress: number, submissionStatus?: string) {
    if (submissionStatus === "Submitted") return "Completed"
    if (progress >= 80) return "Excellent"
    if (progress >= 60) return "On Track"
    if (progress >= 30) return "Needs Attention"
    return "Just Started"
  }

  function getNextMeetingTime(index: number) {
    const times = ["Today, 3:00 PM", "Tomorrow, 10:00 AM", "Wed, 2:00 PM"]
    return times[index] || "TBD"
  }

  function getNextMeetingTopic(progress: number) {
    if (progress >= 80) return "Final Demo Preparation"
    if (progress >= 60) return "Progress Review & Next Steps"
    if (progress >= 30) return "Technical Challenge Discussion"
    return "Project Planning & Goal Setting"
  }

  function getMeetingType(progress: number) {
    if (progress >= 80) return "Demo Prep"
    if (progress >= 60) return "Progress Review"
    if (progress >= 30) return "Technical Support"
    return "Planning Session"
  }

  function getRecentMessage(progress: number, index: number) {
    const messages = [
      "Need help with the final integration",
      "Demo slides are ready for review",
      "API implementation is complete"
    ]
    return messages[index] || "Ready for next mentoring session"
  }

  function getMessageTime(index: number) {
    const times = ["1 hour ago", "3 hours ago", "5 hours ago"]
    return times[index] || "Recently"
  }

  if (loading) {
    return (
      <DashboardLayout userRole="mentor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading mentor dashboard...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
            <p className="text-gray-600">Guide your teams to hackathon success</p>
          </div>
          <div className="flex gap-2">
            
            
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
                Message Teams
            </Button>
          </div>
        </div>

        

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-600 mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Teams */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Teams</CardTitle>
                <CardDescription>Teams you're currently mentoring</CardDescription>
              </div>
              <Link href="/dashboard/mentor/teams">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeTeams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No active teams assigned yet</p>
                    <p className="text-sm">Teams will appear here when you're assigned as a mentor</p>
                  </div>
                ) : (
                  activeTeams.map((team) => (
                    <div key={team.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-sm text-gray-600">{team.hackathon}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3" />
                            {team.members} members • Last update: {team.lastUpdate}
                          </p>
                        </div>
                        <Badge
                          variant={
                            team.status === "Excellent"
                              ? "default"
                              : team.status === "On Track"
                                ? "secondary"
                                : team.status === "Completed"
                                ? "default"
                                : "destructive"
                          }
                          className={
                            team.status === "Excellent"
                              ? "bg-green-100 text-green-800"
                              : team.status === "On Track"
                                ? "bg-blue-100 text-blue-800"
                                : team.status === "Completed"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {team.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{team.progress}%</span>
                        </div>
                        <Progress value={team.progress} className="h-2" />
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Link href={`/dashboard/mentor/teams`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Scheduled mentoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No meetings scheduled</p>
                    <p className="text-sm">Schedule meetings with your teams</p>
                  </div>
                ) : (
                  upcomingMeetings.map((meeting, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{meeting.team}</h4>
                          <p className="text-sm text-gray-600">{meeting.topic}</p>
                        </div>
                        <Badge variant="outline">{meeting.type}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meeting.time}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest communications from your teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent messages</p>
                  <p className="text-sm">Messages from your teams will appear here</p>
                </div>
              ) : (
                recentMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                      message.unread ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>
                          {message.member
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="font-medium text-sm">{message.member}</p>
                            <p className="text-xs text-gray-500">{message.team}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{message.time}</span>
                            {message.unread && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common mentoring tools and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard/mentor/teams">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <Users className="h-6 w-6 mb-2" />
                  Team Progress
                </Button>
              </Link>
             
              <Link href="/dashboard/mentor/guidance">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <BookOpen className="h-6 w-6 mb-2" />
                  Guidance Tools
                </Button>
              </Link>
              <Link href="/dashboard/mentor/progress">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <Trophy className="h-6 w-6 mb-2" />
                  View Progress
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function MentorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["mentor"]}>
      <MentorDashboardContent />
    </ProtectedRoute>
  )
}
