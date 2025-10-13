"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Trophy, 
  Calendar, 
  Users, 
  Star, 
  TrendingUp,
  Award,
  Clock,
  Target,
  MessageSquare,
  BarChart3,
  Download,
  Eye,
  Search,
  Filter
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"

interface MentoringRecord {
  _id: string
  hackathon: {
    _id: string
    title: string
    startDate: string
    endDate: string
    organizer: string
  }
  team: {
    _id: string
    name: string
    members: Array<{
      username: string
      email: string
      image?: string
    }>
    finalPosition?: number
    project: {
      title: string
      description: string
      techStack: string[]
    }
  }
  mentorshipPeriod: {
    startDate: string
    endDate: string
    totalSessions: number
    totalHours: number
  }
  performance: {
    teamProgress: number
    finalScore?: number
    achievements: string[]
    feedback: Array<{
      date: string
      rating: number
      comment: string
    }>
  }
  impact: {
    skillsTransferred: string[]
    studentsGrowth: Array<{
      student: string
      skillsGained: string[]
      improvementAreas: string[]
    }>
  }
  certificate?: {
    _id: string
    title: string
    issuedDate: string
    certificateUrl: string
  }
}

interface MentoringStats {
  totalHackathons: number
  totalTeams: number
  totalStudents: number
  totalHours: number
  averageTeamRating: number
  successfulCompletions: number
  topPerformingTeams: number
  skillsTransferred: string[]
}

export function MentoringHistory() {
  const [records, setRecords] = useState<MentoringRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MentoringRecord[]>([])
  const [stats, setStats] = useState<MentoringStats>({
    totalHackathons: 0,
    totalTeams: 0,
    totalStudents: 0,
    totalHours: 0,
    averageTeamRating: 0,
    successfulCompletions: 0,
    topPerformingTeams: 0,
    skillsTransferred: []
  })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [performanceFilter, setPerformanceFilter] = useState("all")
  const { userData } = useCurrentUser()
  const { toast } = useToast()

  useEffect(() => {
    if (userData?.id) {
      fetchMentoringHistory()
    }
  }, [userData])

  useEffect(() => {
    filterRecords()
    calculateStats()
  }, [records, searchTerm, yearFilter, performanceFilter])

  const fetchMentoringHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/mentors/${userData?.id}/history`)
      if (response.ok) {
        const data = await response.json()
        setRecords(data.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch mentoring history",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while fetching history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = records

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.team.project.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter(record => 
        new Date(record.hackathon.startDate).getFullYear().toString() === yearFilter
      )
    }

    // Performance filter
    if (performanceFilter !== "all") {
      if (performanceFilter === "top") {
        filtered = filtered.filter(record => record.team.finalPosition && record.team.finalPosition <= 3)
      } else if (performanceFilter === "completed") {
        filtered = filtered.filter(record => record.performance.teamProgress === 100)
      } else if (performanceFilter === "high-rated") {
        filtered = filtered.filter(record => {
          const avgRating = record.performance.feedback.reduce((sum, f) => sum + f.rating, 0) / record.performance.feedback.length
          return avgRating >= 4
        })
      }
    }

    setFilteredRecords(filtered)
  }

  const calculateStats = () => {
    const totalHackathons = records.length
    const totalTeams = records.length
    const totalStudents = records.reduce((sum, record) => sum + record.team.members.length, 0)
    const totalHours = records.reduce((sum, record) => sum + record.mentorshipPeriod.totalHours, 0)
    
    const allRatings = records.flatMap(record => record.performance.feedback.map(f => f.rating))
    const averageTeamRating = allRatings.length > 0 ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length : 0
    
    const successfulCompletions = records.filter(record => record.performance.teamProgress === 100).length
    const topPerformingTeams = records.filter(record => record.team.finalPosition && record.team.finalPosition <= 3).length
    
    const allSkills = records.flatMap(record => record.impact.skillsTransferred)
    const skillsTransferred = Array.from(new Set(allSkills))

    setStats({
      totalHackathons,
      totalTeams,
      totalStudents,
      totalHours,
      averageTeamRating,
      successfulCompletions,
      topPerformingTeams,
      skillsTransferred
    })
  }

  const exportHistory = () => {
    const csvData = filteredRecords.map(record => ({
      'Hackathon': record.hackathon.title,
      'Team': record.team.name,
      'Project': record.team.project.title,
      'Start Date': new Date(record.mentorshipPeriod.startDate).toLocaleDateString(),
      'End Date': new Date(record.mentorshipPeriod.endDate).toLocaleDateString(),
      'Total Sessions': record.mentorshipPeriod.totalSessions,
      'Total Hours': record.mentorshipPeriod.totalHours,
      'Team Progress': `${record.performance.teamProgress}%`,
      'Final Position': record.team.finalPosition || 'N/A',
      'Team Members': record.team.members.length,
      'Skills Transferred': record.impact.skillsTransferred.join('; ')
    }))

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mentoring-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getPositionBadge = (position?: number) => {
    if (!position) return null
    
    if (position === 1) return <Badge className="bg-yellow-100 text-yellow-800">🥇 Winner</Badge>
    if (position === 2) return <Badge className="bg-gray-100 text-gray-800">🥈 Runner-up</Badge>
    if (position === 3) return <Badge className="bg-orange-100 text-orange-800">🥉 Third Place</Badge>
    if (position <= 10) return <Badge variant="outline">Top 10</Badge>
    return <Badge variant="outline">Position {position}</Badge>
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-green-600"
    if (progress >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const years = Array.from(new Set(records.map(record => 
    new Date(record.hackathon.startDate).getFullYear().toString()
  ))).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mentoring History</h2>
          <p className="text-gray-600">Track your mentoring journey and impact</p>
        </div>
        <Button onClick={exportHistory}>
          <Download className="mr-2 h-4 w-4" />
          Export History
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hackathons Mentored</p>
                <p className="text-2xl font-bold">{stats.totalHackathons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students Mentored</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold">{stats.averageTeamRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <p className="text-2xl font-bold">{stats.topPerformingTeams}</p>
            <p className="text-sm text-gray-600">Top 3 Teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold">{stats.successfulCompletions}</p>
            <p className="text-sm text-gray-600">Completed Projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{stats.skillsTransferred.length}</p>
            <p className="text-sm text-gray-600">Skills Transferred</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">Mentoring History</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search hackathons, teams, or projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="top">Top 3 Teams</SelectItem>
                    <SelectItem value="completed">Completed Projects</SelectItem>
                    <SelectItem value="high-rated">High Rated (4+ stars)</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => {
                  setSearchTerm("")
                  setYearFilter("all")
                  setPerformanceFilter("all")
                }}>
                  <Filter className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mentoring Records */}
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{record.hackathon.title}</CardTitle>
                      <CardDescription>
                        Team: {record.team.name} • Project: {record.team.project.title}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        {getPositionBadge(record.team.finalPosition)}
                        <Badge variant="outline">
                          {record.performance.teamProgress}% Complete
                        </Badge>
                        <Badge variant="outline">
                          {record.mentorshipPeriod.totalHours}h mentoring
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {new Date(record.hackathon.startDate).toLocaleDateString()} - 
                        {new Date(record.hackathon.endDate).toLocaleDateString()}
                      </div>
                      {record.performance.feedback.length > 0 && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            {(record.performance.feedback.reduce((sum, f) => sum + f.rating, 0) / record.performance.feedback.length).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Team Members */}
                    <div>
                      <h4 className="font-medium mb-2">Team Members ({record.team.members.length})</h4>
                      <div className="space-y-2">
                        {record.team.members.slice(0, 3).map((member, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.image} />
                              <AvatarFallback>{member.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.username}</span>
                          </div>
                        ))}
                        {record.team.members.length > 3 && (
                          <p className="text-xs text-gray-500">+{record.team.members.length - 3} more members</p>
                        )}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div>
                      <h4 className="font-medium mb-2">Project Details</h4>
                      <p className="text-sm text-gray-600 mb-2">{record.team.project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {record.team.project.techStack.slice(0, 4).map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {record.team.project.techStack.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{record.team.project.techStack.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Skills & Impact */}
                    <div>
                      <h4 className="font-medium mb-2">Skills Transferred</h4>
                      <div className="space-y-2">
                        {record.impact.skillsTransferred.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                            {skill}
                          </Badge>
                        ))}
                        {record.impact.skillsTransferred.length > 4 && (
                          <p className="text-xs text-gray-500">+{record.impact.skillsTransferred.length - 4} more skills</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mentoring Stats */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Sessions:</span>
                        <span className="ml-1 font-medium">{record.mentorshipPeriod.totalSessions}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-1 font-medium">
                          {Math.ceil((new Date(record.mentorshipPeriod.endDate).getTime() - new Date(record.mentorshipPeriod.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Final Score:</span>
                        <span className="ml-1 font-medium">
                          {record.performance.finalScore ? `${record.performance.finalScore}/100` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Progress:</span>
                        <span className={`ml-1 font-medium ${getProgressColor(record.performance.teamProgress)}`}>
                          {record.performance.teamProgress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Feedback */}
                  {record.performance.feedback.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Latest Team Feedback</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < record.performance.feedback[0].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {new Date(record.performance.feedback[0].date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{record.performance.feedback[0].comment}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No mentoring records found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm || yearFilter !== "all" || performanceFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Start mentoring teams to build your history!"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Transferred</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.skillsTransferred.slice(0, 10).map((skill, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{skill}</span>
                      <Badge variant="secondary" className="text-xs">
                        {records.filter(r => r.impact.skillsTransferred.includes(skill)).length} teams
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Completion Rate</span>
                      <span className="text-sm font-medium">
                        {((stats.successfulCompletions / stats.totalTeams) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(stats.successfulCompletions / stats.totalTeams) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Top 3 Performance</span>
                      <span className="text-sm font-medium">
                        {((stats.topPerformingTeams / stats.totalTeams) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(stats.topPerformingTeams / stats.totalTeams) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certificates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.filter(record => record.certificate).map((record) => (
              <Card key={record.certificate!._id}>
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
                  <h3 className="font-semibold mb-2">{record.certificate!.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{record.hackathon.title}</p>
                  <p className="text-xs text-gray-500 mb-4">
                    Issued: {new Date(record.certificate!.issuedDate).toLocaleDateString()}
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <a href={record.certificate!.certificateUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="mr-2 h-4 w-4" />
                      View Certificate
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {records.filter(record => record.certificate).length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No mentoring certificates earned yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}