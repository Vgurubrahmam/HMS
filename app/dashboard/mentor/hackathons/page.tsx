"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Trophy, 
  Calendar, 
  Users, 
  Clock,
  MapPin,
  DollarSign,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Target,
  Loader2
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTeams } from "@/hooks/use-teams"
import { useHackathons } from "@/hooks/use-hackathons"
import Link from "next/link"

export default function MentorHackathonsPage() {
  const { userData, loading: userLoading } = useCurrentUser()
  const currentUserId = userData?.id
  const { teams: allTeams, loading: teamsLoading } = useTeams({ limit: 50 })
  const { hackathons, loading: hackathonsLoading } = useHackathons({ limit: 50 })

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const loading = userLoading || teamsLoading || hackathonsLoading

  // Get hackathons where the current user is mentoring teams
  const mentorHackathons = useMemo(() => {
    const mentorTeams = allTeams.filter((team: any) => 
      team.mentor?._id === currentUserId || team.mentor?.id === currentUserId
    )
    
    const hackathonIds = new Set(mentorTeams.map((team: any) => team.hackathon?._id))
    
    return hackathons
      .filter((hackathon: any) => hackathonIds.has(hackathon._id))
      .map((hackathon: any) => {
        const relatedTeams = mentorTeams.filter((team: any) => team.hackathon?._id === hackathon._id)
        return {
          ...hackathon,
          mentorTeams: relatedTeams,
          teamCount: relatedTeams.length,
          averageProgress: relatedTeams.length > 0 
            ? Math.round(relatedTeams.reduce((sum: number, team: any) => sum + (team.progress?.overall || 0), 0) / relatedTeams.length)
            : 0,
          completedTeams: relatedTeams.filter((team: any) => team.submissionStatus === "submitted").length
        }
      })
  }, [hackathons, allTeams, currentUserId])

  // Filter and sort hackathons
  const filteredHackathons = useMemo(() => {
    let filtered = mentorHackathons.filter(hackathon => {
      const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hackathon.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const now = new Date()
      const startDate = new Date(hackathon.startDate)
      const endDate = new Date(hackathon.endDate)
      
      let matchesStatus = true
      if (statusFilter === "upcoming") {
        matchesStatus = startDate > now
      } else if (statusFilter === "active") {
        matchesStatus = startDate <= now && endDate >= now
      } else if (statusFilter === "completed") {
        matchesStatus = endDate < now
      }

      return matchesSearch && matchesStatus
    })

    // Sort hackathons
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime()
        case "oldest":
          return new Date(a.createdAt || a.startDate).getTime() - new Date(b.createdAt || b.startDate).getTime()
        case "startDate":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case "teamCount":
          return b.teamCount - a.teamCount
        default:
          return 0
      }
    })

    return filtered
  }, [mentorHackathons, searchTerm, statusFilter, sortBy])

  // Calculate summary stats
  const stats = useMemo(() => {
    const now = new Date()
    return {
      totalHackathons: mentorHackathons.length,
      activeHackathons: mentorHackathons.filter(h => 
        new Date(h.startDate) <= now && new Date(h.endDate) >= now
      ).length,
      upcomingHackathons: mentorHackathons.filter(h => 
        new Date(h.startDate) > now
      ).length,
      totalTeams: mentorHackathons.reduce((sum, h) => sum + h.teamCount, 0),
      completedHackathons: mentorHackathons.filter(h => 
        new Date(h.endDate) < now
      ).length
    }
  }, [mentorHackathons])

  const getStatusColor = (hackathon: any) => {
    const now = new Date()
    const startDate = new Date(hackathon.startDate)
    const endDate = new Date(hackathon.endDate)

    if (endDate < now) return "bg-gray-100 text-gray-800"
    if (startDate <= now && endDate >= now) return "bg-green-100 text-green-800"
    return "bg-blue-100 text-blue-800"
  }

  const getStatusText = (hackathon: any) => {
    const now = new Date()
    const startDate = new Date(hackathon.startDate)
    const endDate = new Date(hackathon.endDate)

    if (endDate < now) return "Completed"
    if (startDate <= now && endDate >= now) return "Active"
    return "Upcoming"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrize = (prize: number) => {
    if (prize >= 1000) {
      return `$${(prize / 1000).toFixed(0)}K`
    }
    return `$${prize}`
  }

  if (loading) {
    return (
      <DashboardLayout userRole="mentor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading hackathons...</span>
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
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard/mentor">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mentor Hackathons</h1>
            <p className="text-gray-600">View and manage hackathons where you're mentoring teams</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hackathons</CardTitle>
              <Trophy className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHackathons}</div>
              <p className="text-xs text-gray-600">Mentoring involvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeHackathons}</div>
              <p className="text-xs text-gray-600">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.upcomingHackathons}</div>
              <p className="text-xs text-gray-600">Starting soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams Mentored</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalTeams}</div>
              <p className="text-xs text-gray-600">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.completedHackathons}</div>
              <p className="text-xs text-gray-600">Finished events</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Hackathons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search hackathons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="teamCount">Team Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Hackathons Grid */}
        <div className="grid gap-6">
          {filteredHackathons.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Hackathons Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" 
                    ? "No hackathons match your current filters."
                    : "You haven't been assigned to mentor any teams yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredHackathons.map((hackathon) => (
              <Card key={hackathon._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                        <Badge className={getStatusColor(hackathon)}>
                          {getStatusText(hackathon)}
                        </Badge>
                      </div>
                      <CardDescription className="mb-3">
                        {hackathon.description || "No description available"}
                      </CardDescription>
                      
                      {/* Hackathon Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{hackathon.location || hackathon.mode || "Online"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{hackathon.teamCount} teams mentored</span>
                        </div>
                        {hackathon.prizePool && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatPrize(hackathon.prizePool)} prize pool</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Mentoring Stats */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Your Mentoring Stats</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Teams: </span>
                        <span className="font-medium">{hackathon.teamCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Progress: </span>
                        <span className="font-medium">{hackathon.averageProgress}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Completed: </span>
                        <span className="font-medium">{hackathon.completedTeams}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teams Preview */}
                  {hackathon.mentorTeams.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Your Teams</h4>
                      <div className="space-y-2">
                        {hackathon.mentorTeams.slice(0, 3).map((team: any) => (
                          <div key={team._id} className="flex justify-between items-center p-2 bg-white border rounded">
                            <span className="text-sm font-medium">{team.name || "Unnamed Team"}</span>
                            <Badge variant="outline">{team.progress?.overall || 0}% complete</Badge>
                          </div>
                        ))}
                        {hackathon.mentorTeams.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{hackathon.mentorTeams.length - 3} more teams
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/mentor/teams`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Teams
                      </Button>
                    </Link>
                    <Link href={`/dashboard/mentor/progress`}>
                      <Button variant="outline" size="sm">
                        <Target className="h-3 w-3 mr-1" />
                        Track Progress
                      </Button>
                    </Link>
                    <Link href={`/dashboard/mentor/guidance`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Send Guidance
                      </Button>
                    </Link>
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