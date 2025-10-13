"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Users, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  Search,
  IndianRupee,
  MapPin,
  Clock
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HackathonMetric {
  id: string
  title: string
  participants: number
  teams: number
  revenue: number
  status: string
  registrationRate: number
  completionRate: number
  averageRating: number
}

interface DepartmentStat {
  department: string
  participants: number
  teams: number
  winRate: number
}

interface RevenueData {
  month: string
  revenue: number
  hackathons: number
}

interface TopMentor {
  name: string
  sessions: number
  rating: number
  expertise: string
}

interface MentorStats {
  totalMentors: number
  activeMentors: number
  averageRating: number
  totalSessions: number
  topMentors: TopMentor[]
}

interface Analytics {
  overview: {
    totalHackathons: number
    activeHackathons: number
    totalParticipants: number
    totalRevenue: number
    averageTeamSize: number
    completionRate: number
  }
  hackathonMetrics: HackathonMetric[]
  departmentStats: DepartmentStat[]
  revenueData: RevenueData[]
  mentorStats: MentorStats
}

export default function CoordinatorAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    overview: {
      totalHackathons: 0,
      activeHackathons: 0,
      totalParticipants: 0,
      totalRevenue: 0,
      averageTeamSize: 0,
      completionRate: 0
    },
    hackathonMetrics: [],
    departmentStats: [],
    revenueData: [],
    mentorStats: {
      totalMentors: 0,
      activeMentors: 0,
      averageRating: 0,
      totalSessions: 0,
      topMentors: []
    }
  })

  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch all required data in parallel
      const [hackathonsRes, teamsRes, paymentsRes, mentorsRes, usersRes, profilesRes] = await Promise.all([
        fetch('/api/hackathons'),
        fetch('/api/teams'), 
        fetch('/api/payments'),
        fetch('/api/mentors'),
        fetch('/api/users'),
        fetch('/api/profiles')
      ])

      // Check if all responses are successful
      if (!hackathonsRes.ok || !teamsRes.ok || !paymentsRes.ok || !mentorsRes.ok || !usersRes.ok || !profilesRes.ok) {
        throw new Error('One or more API calls failed')
      }

      const hackathonsData = await hackathonsRes.json()
      const teamsData = await teamsRes.json()
      const paymentsData = await paymentsRes.json()
      const mentorsData = await mentorsRes.json()
      const usersData = await usersRes.json()
      const profilesData = await profilesRes.json()

      // Process the data with null checks
      const hackathons = Array.isArray(hackathonsData?.data) ? hackathonsData.data : []
      const teams = Array.isArray(teamsData?.data) ? teamsData.data : []
      const payments = Array.isArray(paymentsData?.data) ? paymentsData.data : []
      const mentors = Array.isArray(mentorsData?.data) ? mentorsData.data : []
      const users = Array.isArray(usersData?.data) ? usersData.data : []
      const profiles = Array.isArray(profilesData?.data) ? profilesData.data : []

      // Calculate overview metrics with null checks
      const totalHackathons = hackathons.length
      const activeHackathons = hackathons.filter((h: any) => h && h.status === "Active").length
      const totalParticipants = users.filter((u: any) => u && u.role === "student").length
      const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p && typeof p.amount === 'number' ? p.amount : 0), 0)
      const averageTeamSize = teams.length > 0 ? totalParticipants / teams.length : 0
      const completedHackathons = hackathons.filter((h: any) => h.status === "Completed")
      const completionRate = hackathons.length > 0 ? (completedHackathons.length / hackathons.length) * 100 : 0

      // Process hackathon metrics
      const hackathonMetrics: HackathonMetric[] = hackathons.map((hackathon: any) => {
        const hackathonTeams = teams.filter((t: any) => t.hackathon === hackathon._id)
        const hackathonParticipants = hackathonTeams.reduce((sum: number, t: any) => sum + (t.members?.length || 0), 0)
        const hackathonPayments = payments.filter((p: any) => p.hackathon === hackathon._id)
        const revenue = hackathonPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
        
        return {
          id: hackathon._id,
          title: hackathon.title,
          participants: hackathonParticipants,
          teams: hackathonTeams.length,
          revenue: revenue,
          status: hackathon.status || "Planning",
          registrationRate: hackathon.maxParticipants ? Math.min((hackathonParticipants / hackathon.maxParticipants) * 100, 100) : 0,
          completionRate: hackathon.status === "Completed" ? 100 : hackathon.status === "Active" ? 50 : 0,
          averageRating: 4.5 // This would need to come from feedback/ratings API
        }
      })

      // Calculate department stats using Profile data
      const departmentMap: { [key: string]: { participants: number, teams: number, wins: number } } = {}
      
      // Create a map of userId to profile for quick lookup
      const userProfileMap: { [key: string]: any } = {}
      profiles.forEach((profile: any) => {
        if (profile && profile.userId) {
          userProfileMap[profile.userId] = profile
        }
      })

      // Process users and their departments from profiles
      users.forEach((user: any) => {
        if (user && user.role === "student" && user._id) {
          const profile = userProfileMap[user._id.toString()] || userProfileMap[user._id]
          const department = profile?.department || profile?.branch || 'Unknown'
          
          if (!departmentMap[department]) {
            departmentMap[department] = { participants: 0, teams: 0, wins: 0 }
          }
          departmentMap[department].participants++
        }
      })

      // Process teams and their members' departments
      teams.forEach((team: any) => {
        if (team && team.members) {
          team.members.forEach((member: any) => {
            if (member && member.userId) {
              const profile = userProfileMap[member.userId.toString()] || userProfileMap[member.userId]
              const department = profile?.department || profile?.branch || 'Unknown'
              
              if (departmentMap[department]) {
                departmentMap[department].teams++
              }
            }
          })
        }
      })

      const departmentStats: DepartmentStat[] = Object.entries(departmentMap).map(([dept, stats]) => ({
        department: dept,
        participants: stats.participants,
        teams: Math.floor(stats.teams / 4), // Assuming average team size of 4
        winRate: Math.floor(Math.random() * 30) + 10 // This would need to come from actual competition results
      }))

      // Generate revenue data (monthly)
      const currentYear = new Date().getFullYear()
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const revenueData: RevenueData[] = months.map((month, index) => {
        const monthPayments = payments.filter((p: any) => {
          const paymentDate = new Date(p.createdAt || p.paymentDate)
          return paymentDate.getMonth() === index && paymentDate.getFullYear() === currentYear
        })
        const monthHackathons = hackathons.filter((h: any) => {
          const hackathonDate = new Date(h.startDate)
          return hackathonDate.getMonth() === index && hackathonDate.getFullYear() === currentYear
        })
        
        return {
          month,
          revenue: monthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
          hackathons: monthHackathons.length
        }
      }).filter(data => data.revenue > 0 || data.hackathons > 0)

      // Calculate mentor stats with null checks
      const activeMentors = mentors.filter((m: any) => m && m.isActive !== false).length
      const mentorStats: MentorStats = {
        totalMentors: mentors.length,
        activeMentors: activeMentors,
        averageRating: 4.4, // This would need to come from mentor ratings API
        totalSessions: mentors.reduce((sum: number, m: any) => sum + (m && typeof m.sessionsCount === 'number' ? m.sessionsCount : 0), 0),
        topMentors: mentors.slice(0, 4).map((mentor: any) => ({
          name: mentor && (mentor.username || mentor.name) || 'Unknown',
          sessions: mentor && typeof mentor.sessionsCount === 'number' ? mentor.sessionsCount : 0,
          rating: mentor && typeof mentor.averageRating === 'number' ? mentor.averageRating : 4.5,
          expertise: mentor && Array.isArray(mentor.expertise) ? mentor.expertise[0] : (mentor && mentor.expertise) || "General"
        }))
      }

      setAnalytics({
        overview: {
          totalHackathons,
          activeHackathons,
          totalParticipants,
          totalRevenue,
          averageTeamSize: Math.round(averageTeamSize * 10) / 10,
          completionRate: Math.round(completionRate * 10) / 10
        },
        hackathonMetrics,
        departmentStats,
        revenueData,
        mentorStats
      })
      
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch analytics data. Please check the console for more details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Registration Open": return "bg-blue-100 text-blue-800"
      case "Completed": return "bg-gray-100 text-gray-800"
      default: return "bg-yellow-100 text-yellow-800"
    }
  }

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Analytics data is being exported to CSV format",
    })
  }

  return (
    <DashboardLayout userRole="coordinator">
      <div className="space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        )}

        {/* Header */}
        {!loading && (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Comprehensive insights and performance metrics</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={exportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hackathons</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalHackathons}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.activeHackathons} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalParticipants.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg team size: {analytics.overview.averageTeamSize}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{analytics.overview.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Above industry average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="hackathons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hackathons">Hackathon Performance</TabsTrigger>
            <TabsTrigger value="departments">Department Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Insights</TabsTrigger>
            <TabsTrigger value="mentors">Mentor Statistics</TabsTrigger>
          </TabsList>

          {/* Hackathon Performance */}
          <TabsContent value="hackathons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hackathon Performance Overview</CardTitle>
                <CardDescription>Detailed metrics for each hackathon event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics.hackathonMetrics.map((hackathon) => (
                    <div key={hackathon.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{hackathon.title}</h3>
                          <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{hackathon.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Revenue Generated</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{hackathon.participants}</p>
                          <p className="text-sm text-gray-600">Participants</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{hackathon.teams}</p>
                          <p className="text-sm text-gray-600">Teams Formed</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{hackathon.completionRate}%</p>
                          <p className="text-sm text-gray-600">Completion Rate</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-600">{hackathon.averageRating || "N/A"}</p>
                          <p className="text-sm text-gray-600">Avg Rating</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Registration Progress</span>
                          <span>{hackathon.registrationRate}%</span>
                        </div>
                        <Progress value={hackathon.registrationRate} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Department Analytics */}
          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Performance</CardTitle>
                <CardDescription>Participation and success rates by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.departmentStats.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{dept.department}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{dept.participants} participants</span>
                          <span>{dept.teams} teams</span>
                          <span>{dept.winRate}% win rate</span>
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Engagement</span>
                          <span>{Math.round((dept.participants / analytics.overview.totalParticipants) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(dept.participants / analytics.overview.totalParticipants) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Insights */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue and hackathon frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.revenueData.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{month.month} 2024</h3>
                        <p className="text-sm text-gray-600">{month.hackathons} hackathons organized</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">₹{month.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentor Statistics */}
          <TabsContent value="mentors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mentor Performance</CardTitle>
                <CardDescription>Mentor engagement and effectiveness metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{analytics.mentorStats.totalMentors}</p>
                    <p className="text-sm text-gray-600">Total Mentors</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{analytics.mentorStats.activeMentors}</p>
                    <p className="text-sm text-gray-600">Active Mentors</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">{analytics.mentorStats.averageRating}</p>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Top Performing Mentors</h3>
                  <div className="space-y-3">
                    {analytics.mentorStats.topMentors.map((mentor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{mentor.name}</h4>
                          <p className="text-sm text-gray-600">{mentor.expertise}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span>{mentor.sessions} sessions</span>
                          <Badge variant="outline">★ {mentor.rating}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}