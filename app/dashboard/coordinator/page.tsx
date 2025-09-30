"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Trophy, TrendingUp, Plus, Eye, BarChart3, PieChart, Activity, Loader2, IndianRupee } from "lucide-react"
import { useHackathons } from "@/hooks/use-hackathons"
import { useTeams } from "@/hooks/use-teams"
import { useUsers } from "@/hooks/use-users"
import { useRegistrations } from "@/hooks/use-registrations"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export default function CoordinatorDashboard() {
  const [hackathons, setHackathons ] =useState([])
  const { teams, loading: teamsLoading } = useTeams({ limit: 5 })
  const { users, loading: usersLoading } = useUsers({ role: "student", limit: 10 })
  const { registrations, loading: registrationsLoading } = useRegistrations({ limit: 10 })
  const { toast } = useToast()
const [loading,setLoading]=useState(false)
  // const loading = hackathonsLoading || teamsLoading || usersLoading || registrationsLoading

  // Calculate statistics from real data
  const totalHackathons = hackathons.length
  const activeHackathons = hackathons.filter(
    (h: any) => h.status === "Active" || h.status === "Registration Open",
  ).length
  const totalTeams = teams.length
  const totalStudents = users.length
  const totalRegistrations = registrations.length
  const paidRegistrations = registrations.filter((r: any) => r.paymentStatus === "Paid").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Registration Open":
        return "bg-blue-100 text-blue-800"
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="coordinator">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    )
  }
// get methods
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
  return (
    <DashboardLayout userRole="coordinator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold ">Coordinator Dashboard</h1>
            <p className="text-gray-600">Manage hackathons, teams, and participants</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/coordinator/hackathons">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Hackathon
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Hackathons</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHackathons}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600">{activeHackathons} active</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeams}</div>
              <p className="text-xs text-gray-600 mt-1">Across all hackathons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Registered Students</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRegistrations}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600">{paidRegistrations} paid</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex justify-content-center items-center">
                <IndianRupee className="h-4 w-4"/>
                {registrations.reduce(
                  (sum: number, r: any) => sum + (r.paymentStatus === "Paid" ? r.paymentAmount : 0),
                  0,
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">From registrations</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hackathons">Recent Hackathons</TabsTrigger>
            <TabsTrigger value="teams">Active Teams</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Hackathons */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Hackathons</CardTitle>
                  <Link href="/dashboard/coordinator/hackathons">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hackathons.slice(0, 3).map((hackathon: any) => (
                      <div key={hackathon._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{hackathon.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(hackathon.startDate).toLocaleDateString()} -{" "}
                            {new Date(hackathon.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Teams */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Active Teams</CardTitle>
                  <Link href="/dashboard/coordinator/teams">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teams.slice(0, 3).map((team: any) => (
                      <div key={team._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-sm text-gray-600">{team.projectTitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={team.progress} className="w-20 h-2" />
                            <span className="text-xs text-gray-500">{team.progress}%</span>
                          </div>
                        </div>
                        <Badge variant="outline">{team.members?.length || 0} members</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registration Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalRegistrations}</div>
                    <div className="text-sm text-gray-600">Total Registrations</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{paidRegistrations}</div>
                    <div className="text-sm text-gray-600">Paid Registrations</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{totalRegistrations - paidRegistrations}</div>
                    <div className="text-sm text-gray-600">Pending Payments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hackathons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Hackathons</CardTitle>
                <CardDescription>Manage and monitor all hackathon events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hackathons.map((hackathon: any) => (
                    <div key={hackathon._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{hackathon.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{hackathon.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>📅 {new Date(hackathon.startDate).toLocaleDateString()}</span>
                          <span>📍 {hackathon.venue}</span>
                          <span>
                            👥 {hackathon.currentParticipants}/{hackathon.maxParticipants}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                        <Link href="/dashboard/coordinator/hackathons">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Monitor team progress and submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teams.map((team: any) => (
                    <div key={team._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-sm text-gray-600">{team.hackathon?.title}</p>
                        </div>
                        <Badge variant="outline">{team.submissionStatus}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{team.progress}%</span>
                        </div>
                        <Progress value={team.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                        <span>👥 {team.members?.length || 0} members</span>
                        <span>🏠 {team.room || "No room assigned"}</span>
                        <span>👨‍🏫 {team.mentor?.name || "No mentor"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Hackathon Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Events</span>
                      <span className="font-bold">{totalHackathons}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Events</span>
                      <span className="font-bold text-green-600">{activeHackathons}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Completed Events</span>
                      <span className="font-bold text-blue-600">
                        {hackathons.filter((h: any) => h.status === "Completed").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Participants</span>
                      <span className="font-bold">
                        {Math.round(
                          hackathons.reduce((sum: number, h: any) => sum + h.currentParticipants, 0) /
                            totalHackathons || 0,
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Team Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Teams</span>
                      <span className="font-bold">{totalTeams}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Teams</span>
                      <span className="font-bold text-green-600">
                        {teams.filter((t: any) => t.status === "Active").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Progress</span>
                      <span className="font-bold">
                        {Math.round(teams.reduce((sum: number, t: any) => sum + t.progress, 0) / totalTeams || 0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Teams with Mentors</span>
                      <span className="font-bold text-purple-600">{teams.filter((t: any) => t.mentor).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {registrations.slice(0, 5).map((registration: any) => (
                    <div key={registration._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {registration.user?.name} registered for {registration.hackathon?.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(registration.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={registration.paymentStatus === "Paid" ? "default" : "secondary"}>
                        {registration.paymentStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
