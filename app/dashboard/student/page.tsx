"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, Users, BookOpen, Plus, Eye, Award, TrendingUp, Loader2 } from "lucide-react"
import { useHackathons } from "@/hooks/use-hackathons"
import { useRegistrations } from "@/hooks/use-registrations"
import { useCertificates } from "@/hooks/use-certificates"
import { useTeams } from "@/hooks/use-teams"
import Link from "next/link"

export default function StudentDashboard() {
  // Mock current user ID - in real app, get from auth context
  const currentUserId = "60f1b2b3c4d5e6f7a8b9c0d3" // John Smith's ID from seed data

  const { hackathons, loading: hackathonsLoading } = useHackathons({
    status: "Registration Open",
    limit: 5,
  })

  const { registrations, loading: registrationsLoading } = useRegistrations({
    user: currentUserId,
    limit: 10,
  })

  const { certificates, loading: certificatesLoading } = useCertificates({
    user: currentUserId,
    limit: 5,
  })

  const { teams, loading: teamsLoading } = useTeams({ limit: 5 })

  const loading = hackathonsLoading || registrationsLoading || certificatesLoading || teamsLoading

  // Calculate statistics from real data
  const myRegistrations = registrations.filter((r: any) => r.user?._id === currentUserId)
  const myTeams = teams.filter(
    (t: any) => t.members?.some((m: any) => m._id === currentUserId) || t.teamLead?._id === currentUserId,
  )
  const myCertificates = certificates.filter((c: any) => c.user?._id === currentUserId)
  const upcomingHackathons = hackathons.filter(
    (h: any) => new Date(h.startDate) > new Date() && h.status === "Registration Open",
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Registration Open":
        return "bg-green-100 text-green-800"
      case "Active":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case "Winner":
        return "bg-yellow-100 text-yellow-800"
      case "Special Award":
        return "bg-purple-100 text-purple-800"
      case "Participation":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Track your hackathon journey and achievements</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/student/hackathons">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Browse Hackathons
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">My Registrations</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myRegistrations.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600">
                  {myRegistrations.filter((r: any) => r.paymentStatus === "Paid").length} confirmed
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">My Teams</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myTeams.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-blue-600">{myTeams.filter((t: any) => t.status === "Active").length} active</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Certificates</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myCertificates.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-yellow-600">
                  {myCertificates.filter((c: any) => c.type === "Winner").length} winner certificates
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Events</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingHackathons.length}</div>
              <p className="text-xs text-gray-600 mt-1">Open for registration</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hackathons">My Hackathons</TabsTrigger>
            <TabsTrigger value="teams">My Teams</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Hackathons */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Hackathons</CardTitle>
                  <Link href="/dashboard/student/hackathons">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingHackathons.slice(0, 3).map((hackathon: any) => (
                      <div key={hackathon._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{hackathon.title}</h4>
                          <p className="text-sm text-gray-600">
                            📅 {new Date(hackathon.startDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            💰 ${hackathon.registrationFee} • 📍 {hackathon.venue}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {hackathon.currentParticipants}/{hackathon.maxParticipants} registered
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* My Active Teams */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">My Active Teams</CardTitle>
                  <Link href="/dashboard/student/teams">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myTeams
                      .filter((t: any) => t.status === "Active")
                      .slice(0, 3)
                      .map((team: any) => (
                        <div key={team._id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{team.name}</h4>
                            <Badge variant="outline">{team.submissionStatus}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{team.projectTitle}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={team.progress} className="flex-1 h-2" />
                            <span className="text-xs text-gray-500">{team.progress}%</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            👥 {team.members?.length || 0} members • 🏠 {team.room || "No room"}
                          </p>
                        </div>
                      ))}
                    {myTeams.filter((t: any) => t.status === "Active").length === 0 && (
                      <p className="text-gray-500 text-center py-4">No active teams</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {myCertificates.slice(0, 3).map((certificate: any) => (
                    <div key={certificate._id} className="p-4 border rounded-lg text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <h4 className="font-medium">{certificate.achievement}</h4>
                      <p className="text-sm text-gray-600">{certificate.hackathon?.title}</p>
                      <Badge className={getCertificateTypeColor(certificate.type)}>
                        {certificate.type}
                      </Badge>
                    </div>
                  ))}
                  {myCertificates.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No certificates yet. Participate in hackathons to earn achievements!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hackathons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Hackathon Registrations</CardTitle>
                <CardDescription>Track your registered hackathons and payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myRegistrations.map((registration: any) => (
                    <div key={registration._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{registration.hackathon?.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          📅 {new Date(registration.hackathon?.startDate).toLocaleDateString()} -{" "}
                          {new Date(registration.hackathon?.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          💰 ${registration.paymentAmount} • Registered:{" "}
                          {new Date(registration.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={registration.paymentStatus === "Paid" ? "default" : "secondary"}>
                          {registration.paymentStatus}
                        </Badge>
                        <Badge variant="outline">{registration.status}</Badge>
                        {registration.paymentStatus === "Pending" && (
                          <Link href="/dashboard/student/payments">
                            <Button size="sm">Pay Now</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                  {myRegistrations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hackathon registrations yet.</p>
                      <Link href="/dashboard/student/hackathons">
                        <Button className="mt-4">Browse Hackathons</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Teams</CardTitle>
                <CardDescription>Teams you're part of and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myTeams.map((team: any) => (
                    <div key={team._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-sm text-gray-600">{team.hackathon?.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{team.status}</Badge>
                          <Badge variant="secondary">{team.submissionStatus}</Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm">Project: {team.projectTitle}</h5>
                          {team.projectDescription && (
                            <p className="text-sm text-gray-600">{team.projectDescription}</p>
                          )}
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{team.progress}%</span>
                          </div>
                          <Progress value={team.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>👥 {team.members?.length || 0} members</span>
                          <span>🏠 {team.room || "No room assigned"}</span>
                          <span>👨‍🏫 {team.mentor?.name || "No mentor"}</span>
                        </div>

                        {team.teamLead?._id === currentUserId && (
                          <Badge variant="outline" className="text-xs">
                            Team Lead
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {myTeams.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>You're not part of any teams yet.</p>
                      <p className="text-sm">Register for hackathons to join or create teams!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Certificates & Achievements</CardTitle>
                <CardDescription>Your hackathon accomplishments and recognitions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myCertificates.map((certificate: any) => (
                    <div key={certificate._id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Award className="h-8 w-8 text-yellow-500" />
                          <div>
                            <h4 className="font-medium">{certificate.achievement}</h4>
                            <p className="text-sm text-gray-600">{certificate.hackathon?.title}</p>
                          </div>
                        </div>
                        <Badge className={getCertificateTypeColor(certificate.type)}>{certificate.type}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Issue Date:</span>
                          <span>{new Date(certificate.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Certificate ID:</span>
                          <span className="font-mono text-xs">{certificate.certificateNumber}</span>
                        </div>
                        {certificate.rank && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Rank:</span>
                            <span className="font-medium">#{certificate.rank}</span>
                          </div>
                        )}
                      </div>

                      {certificate.skills && certificate.skills.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Skills Demonstrated:</p>
                          <div className="flex flex-wrap gap-1">
                            {certificate.skills.map((skill: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Link href="/dashboard/student/certificates">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                  {myCertificates.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No certificates earned yet.</p>
                      <p className="text-sm">
                        Participate in hackathons and showcase your skills to earn certificates!
                      </p>
                      <Link href="/dashboard/student/hackathons">
                        <Button className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Join a Hackathon
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievement Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <Trophy className="h-8 w-8 mx-auto text-yellow-500" />
                  <CardTitle className="text-lg">Winner Certificates</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {myCertificates.filter((c: any) => c.type === "Winner").length}
                  </div>
                  <p className="text-sm text-gray-600">1st, 2nd, 3rd place wins</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Award className="h-8 w-8 mx-auto text-purple-500" />
                  <CardTitle className="text-lg">Special Awards</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {myCertificates.filter((c: any) => c.type === "Special Award").length}
                  </div>
                  <p className="text-sm text-gray-600">Best design, innovation, etc.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto text-blue-500" />
                  <CardTitle className="text-lg">Participation</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {myCertificates.filter((c: any) => c.type === "Participation").length}
                  </div>
                  <p className="text-sm text-gray-600">Completion certificates</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
