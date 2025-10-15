"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Trophy,
  Loader2
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTeams } from "@/hooks/use-teams"
import { useHackathons } from "@/hooks/use-hackathons"
import Link from "next/link"

export default function ProgressTrackingPage() {
  const { userData, loading: userLoading } = useCurrentUser()
  const currentUserId = userData?.id
  const { teams: allTeams, loading: teamsLoading } = useTeams({ limit: 50 })
  const { hackathons, loading: hackathonsLoading } = useHackathons({ limit: 20 })

  const [selectedHackathon, setSelectedHackathon] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("all")

  const loading = userLoading || teamsLoading || hackathonsLoading

  // Filter teams where current user is the mentor
  const mentorTeams = useMemo(() => {
    return allTeams.filter((team: any) => 
      team.mentor?._id === currentUserId || team.mentor?.id === currentUserId
    )
  }, [allTeams, currentUserId])

  // Filter teams based on selected hackathon
  const filteredTeams = useMemo(() => {
    if (selectedHackathon === "all") return mentorTeams
    return mentorTeams.filter((team: any) => team.hackathon?._id === selectedHackathon)
  }, [mentorTeams, selectedHackathon])

  // Calculate progress analytics
  const progressAnalytics = useMemo(() => {
    const teams = filteredTeams
    const totalTeams = teams.length
    
    if (totalTeams === 0) {
      return {
        averageProgress: 0,
        excellentTeams: 0,
        onTrackTeams: 0,
        strugglingTeams: 0,
        completedTeams: 0,
        progressTrend: 0,
        milestoneCompletion: 0,
        teamDistribution: []
      }
    }

    const averageProgress = teams.reduce((sum: number, team: any) => sum + (team.progress?.overall || 0), 0) / totalTeams
    const excellentTeams = teams.filter((team: any) => (team.progress?.overall || 0) >= 80).length
    const onTrackTeams = teams.filter((team: any) => (team.progress?.overall || 0) >= 50 && (team.progress?.overall || 0) < 80).length
    const strugglingTeams = teams.filter((team: any) => (team.progress?.overall || 0) < 50).length
    const completedTeams = teams.filter((team: any) => team.submissionStatus === "submitted").length

    const teamDistribution = [
      { range: "0-25%", count: teams.filter((team: any) => (team.progress?.overall || 0) < 25).length },
      { range: "25-50%", count: teams.filter((team: any) => (team.progress?.overall || 0) >= 25 && (team.progress?.overall || 0) < 50).length },
      { range: "50-75%", count: teams.filter((team: any) => (team.progress?.overall || 0) >= 50 && (team.progress?.overall || 0) < 75).length },
      { range: "75-100%", count: teams.filter((team: any) => (team.progress?.overall || 0) >= 75).length }
    ]

    return {
      averageProgress: Math.round(averageProgress),
      excellentTeams,
      onTrackTeams,
      strugglingTeams,
      completedTeams,
      progressTrend: 5, // Mock trend data
      milestoneCompletion: 75, // Mock milestone data
      teamDistribution
    }
  }, [filteredTeams])

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600"
    if (progress >= 50) return "text-blue-600"
    if (progress >= 25) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressBackground = (progress: number) => {
    if (progress >= 80) return "bg-green-100"
    if (progress >= 50) return "bg-blue-100"
    if (progress >= 25) return "bg-yellow-100"
    return "bg-red-100"
  }

  if (loading) {
    return (
      <DashboardLayout userRole="mentor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading progress data...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
            <p className="text-gray-600">Monitor team advancement and performance metrics</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Progress Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Hackathon</label>
                <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hackathon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hackathons</SelectItem>
                    {hackathons.map((hackathon: any) => (
                      <SelectItem key={hackathon._id} value={hackathon._id}>
                        {hackathon.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Time Period</label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="current">Current Hackathons</SelectItem>
                    <SelectItem value="past">Past Hackathons</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressAnalytics.averageProgress}%</div>
              <div className="flex items-center text-xs text-gray-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                +{progressAnalytics.progressTrend}% from last week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excellent Teams</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{progressAnalytics.excellentTeams}</div>
              <p className="text-xs text-gray-600 mt-1">80%+ progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{progressAnalytics.strugglingTeams}</div>
              <p className="text-xs text-gray-600 mt-1">Below 50% progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{progressAnalytics.completedTeams}</div>
              <p className="text-xs text-gray-600 mt-1">Submitted projects</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Progress Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Distribution</CardTitle>
              <CardDescription>How teams are distributed across progress ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressAnalytics.teamDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.range}</span>
                      <span>{item.count} teams</span>
                    </div>
                    <Progress 
                      value={filteredTeams.length > 0 ? (item.count / filteredTeams.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Progress List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Progress Details</CardTitle>
              <CardDescription>Individual team progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredTeams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No teams found</p>
                    <p className="text-sm">Teams will appear here when assigned</p>
                  </div>
                ) : (
                  filteredTeams.map((team: any) => (
                    <div key={team._id} className={`p-4 border rounded-lg ${getProgressBackground(team.progress?.overall || 0)}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{team.name || "Unnamed Team"}</h4>
                          <p className="text-sm text-gray-600">{team.hackathon?.title || "Unknown Hackathon"}</p>
                          <p className="text-xs text-gray-500">
                            {team.members?.length || 0} members
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getProgressColor(team.progress?.overall || 0)}`}>
                            {team.progress?.overall || 0}%
                          </div>
                          <Badge
                            variant={
                              (team.progress?.overall || 0) >= 80
                                ? "default"
                                : (team.progress?.overall || 0) >= 50
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {(team.progress?.overall || 0) >= 80 ? "Excellent" : 
                             (team.progress?.overall || 0) >= 50 ? "On Track" : "Needs Help"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Progress value={team.progress?.overall || 0} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Last updated: {new Date(team.updatedAt || team.createdAt).toLocaleDateString()}</span>
                          <span>{team.submissionStatus === "submitted" ? "✓ Submitted" : "In Progress"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Link href={`/dashboard/mentor/teams`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/dashboard/mentor/guidance`}>
                          <Button variant="outline" size="sm">
                            Provide Guidance
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Insights</CardTitle>
            <CardDescription>Key insights and recommendations based on team performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-green-700">Teams Performing Well</h4>
                {filteredTeams
                  .filter((team: any) => (team.progress?.overall || 0) >= 70)
                  .slice(0, 3)
                  .map((team: any) => (
                    <div key={team._id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="font-medium text-green-800">{team.name || "Unnamed Team"}</p>
                      <p className="text-sm text-green-600">{team.progress?.overall || 0}% complete</p>
                    </div>
                  ))}
                {filteredTeams.filter((team: any) => (team.progress?.overall || 0) >= 70).length === 0 && (
                  <p className="text-gray-500 text-sm">No teams performing excellently yet</p>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-red-700">Teams Needing Support</h4>
                {filteredTeams
                  .filter((team: any) => (team.progress || 0) < 50)
                  .slice(0, 3)
                  .map((team: any) => (
                    <div key={team._id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="font-medium text-red-800">{team.name || "Unnamed Team"}</p>
                      <p className="text-sm text-red-600">{team.progress || 0}% complete</p>
                      <div className="mt-2">
                        <Link href={`/dashboard/mentor/guidance`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Provide Support
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                {filteredTeams.filter((team: any) => (team.progress || 0) < 50).length === 0 && (
                  <p className="text-gray-500 text-sm">All teams are progressing well!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}