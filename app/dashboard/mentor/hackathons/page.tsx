"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Loader2,
  RefreshCw,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useMentorHackathons } from "@/hooks/use-mentor-hackathons"
import Link from "next/link"

export default function MentorHackathonsPage() {
  const { userData, loading: userLoading } = useCurrentUser()
  const currentUserId = userData?.id
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>("all")
  const [page, setPage] = useState(1)

  const {
    hackathons,
    summary,
    loading: hackathonsLoading,
    error,
    refresh
  } = useMentorHackathons({
    userId: currentUserId,
    page,
    limit: 20,
    status: statusFilter,
    search: searchTerm,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
  })

  const loading = userLoading || hackathonsLoading

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "bg-gray-100 text-gray-800"
      case 'active': return "bg-green-100 text-green-800"
      case 'upcoming': return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return "Completed"
      case 'active': return "Active"
      case 'upcoming': return "Upcoming"
      default: return "Unknown"
    }
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600"
    if (progress >= 60) return "text-blue-600"
    if (progress >= 30) return "text-yellow-600"
    return "text-red-600"
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as 'all' | 'upcoming' | 'active' | 'completed')
    setPage(1) // Reset to first page when filter changes
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
          <Button 
            onClick={refresh} 
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Error Loading Hackathons</p>
                  <p className="text-sm text-red-600">{error}</p>
                  <Button 
                    onClick={refresh} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    disabled={loading}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hackathons</CardTitle>
              <Trophy className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : summary?.totalHackathons || 0}
              </div>
              <p className="text-xs text-gray-600">Mentoring involvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? "..." : summary?.activeHackathons || 0}
              </div>
              <p className="text-xs text-gray-600">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? "..." : summary?.upcomingHackathons || 0}
              </div>
              <p className="text-xs text-gray-600">Starting soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams Mentored</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {loading ? "..." : summary?.totalTeams || 0}
              </div>
              <p className="text-xs text-gray-600">
                {summary?.totalStudents || 0} total students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loading ? "..." : `${summary?.averageTeamProgress || 0}%`}
              </div>
              <p className="text-xs text-gray-600">
                {summary?.completedTeamSubmissions || 0} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Hackathons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search hackathons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
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
            </div>
          </CardContent>
        </Card>

        {/* Hackathons Grid */}
        <div className="grid gap-6">
          {loading && hackathons.length === 0 ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hackathons.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Hackathons Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" 
                    ? "No hackathons match your current filters."
                    : "You haven't been assigned to mentor any teams yet."}
                </p>
                {searchTerm || statusFilter !== "all" ? (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            hackathons.map((hackathon: any) => (
              <Card key={hackathon._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                        <Badge className={getStatusColor(hackathon.status)}>
                          {getStatusText(hackathon.status)}
                        </Badge>
                        {hackathon.status === 'active' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {hackathon.daysUntilEnd 
                              ? `${hackathon.daysUntilEnd} days left`
                              : "Ending soon"
                            }
                          </Badge>
                        )}
                        {hackathon.status === 'upcoming' && hackathon.daysUntilStart && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Calendar className="h-3 w-3 mr-1" />
                            {hackathon.daysUntilStart === 1 
                              ? "Starting tomorrow"
                              : `${hackathon.daysUntilStart} days to start`
                            }
                          </Badge>
                        )}
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
                          <span>{hackathon.mentorStats.teamCount} teams mentored</span>
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
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Your Mentoring Stats
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{hackathon.mentorStats.teamCount}</div>
                        <span className="text-gray-600">Teams</span>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getProgressColor(hackathon.mentorStats.averageProgress)}`}>
                          {hackathon.mentorStats.averageProgress}%
                        </div>
                        <span className="text-gray-600">Avg Progress</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{hackathon.mentorStats.completedTeams}</div>
                        <span className="text-gray-600">Completed</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{hackathon.mentorStats.totalStudents}</div>
                        <span className="text-gray-600">Students</span>
                      </div>
                    </div>
                  </div>

                  {/* Teams Preview */}
                  {hackathon.teams.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Your Teams ({hackathon.teams.length})
                      </h4>
                      <div className="space-y-3">
                        {hackathon.teams.slice(0, 3).map((team: any) => (
                          <div key={team._id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{team.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {team.memberCount} members
                                </Badge>
                                {team.status === 'Active' && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">{team.projectTitle}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Progress value={team.progress} className="flex-1 h-1.5" />
                                <span className="text-xs text-gray-500">{team.progress}%</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <Badge 
                                variant="outline" 
                                className={team.progress >= 80 ? "bg-green-50 text-green-700" : 
                                          team.progress >= 60 ? "bg-blue-50 text-blue-700" :
                                          team.progress >= 30 ? "bg-yellow-50 text-yellow-700" :
                                          "bg-red-50 text-red-700"}
                              >
                                {team.submissionStatus}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {hackathon.teams.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{hackathon.teams.length - 3} more teams
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Link href={`/dashboard/mentor/teams`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Teams
                      </Button>
                    </Link>
                    <Link href={`/dashboard/mentor/team-guidance`}>
                      <Button variant="outline" size="sm">
                        <Target className="h-3 w-3 mr-1" />
                        Team Guidance
                      </Button>
                    </Link>
                    <Link href={`/dashboard/mentor/progress`}>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Track Progress
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Send Message
                    </Button>
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