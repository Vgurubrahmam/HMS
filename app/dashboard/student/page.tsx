"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, Users, BookOpen, Plus, Eye, Award, TrendingUp, Loader2, Clock, AlertCircle, Bell } from "lucide-react"
import { useHackathons } from "@/hooks/use-hackathons"
import { useRegistrations } from "@/hooks/use-registrations"
import { useCertificates } from "@/hooks/use-certificates"
import { useTeams } from "@/hooks/use-teams"
import { useCurrentUser } from "@/hooks/use-current-user"
import { 
  useHackathonStatuses, 
  useRegistrationStatuses, 
  useLiveDashboardStats,
} from "@/hooks/use-live-status"
import { getStatusBadgeColor, getStatusIcon } from "@/lib/status-utils"
import { BackgroundStatusUpdater, useStatusUpdater } from "@/components/background-status-updater"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function StudentDashboard() {
  const { userData, loading: userLoading } = useCurrentUser()
  const currentUserId = userData?.id
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const { updateStatuses } = useStatusUpdater()

  const { hackathons, loading: hackathonsLoading, refetch: refetchHackathons } = useHackathons({
    limit: 20, // Get more hackathons to show different statuses
  })

  const { registrations, loading: registrationsLoading, refetch: refetchRegistrations } = useRegistrations({
    user: currentUserId,
    limit: 10,
  })

  const { certificates, loading: certificatesLoading } = useCertificates({
    user: currentUserId,
    limit: 5,
  })

  const { teams, loading: teamsLoading } = useTeams({ limit: 5 })

  const loading = hackathonsLoading || registrationsLoading || certificatesLoading || teamsLoading || userLoading

  // Use real-time status hooks
  const hackathonStatuses = useHackathonStatuses(hackathons)
  const registrationStatuses = useRegistrationStatuses(registrations, hackathons)
  const liveStats = useLiveDashboardStats(hackathons, registrations, teams, certificates, currentUserId || "")

  // Filter data with live status information
  const myRegistrations = registrations.filter((r: any) => r.user?._id === currentUserId)
  const myTeams = teams.filter(
    (t: any) => t.members?.some((m: any) => m._id === currentUserId) || t.teamLead?._id === currentUserId,
  )
  const myCertificates = certificates.filter((c: any) => c.user?._id === currentUserId)
  
  // Helper function to check if user is registered for a hackathon
  const getUserRegistrationStatus = (hackathonId: string) => {
    const registration = myRegistrations.find((r: any) => r.hackathon?._id === hackathonId)
    if (!registration) return null
    
    // Check payment status to determine final status
    const paymentStatus = registration.paymentStatus || registration.payment?.status
    if (paymentStatus === "Completed" || paymentStatus === "Paid" || paymentStatus === "Registered") {
      return "Registered"
    } else if (paymentStatus === "Pending") {
      return "Payment Pending"
    }
    return "Registered"
  }

  // Helper function to format dates safely
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'Dates coming soon'
    
    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      // Format date in a user-friendly way
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch (error) {
      console.error('Date formatting error:', error, 'Value:', dateValue)
      return 'Invalid date'
    }
  }

  // Helper function specifically for registration dates
  const formatRegistrationDate = (registration: any) => {
    const dateValue = registration.registrationDate || registration.createdAt
    
    if (!dateValue) {
      console.warn('No registration date found:', registration)
      return 'Date not available'
    }
    
    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) {
        console.warn('Invalid registration date:', dateValue)
        return 'Invalid date'
      }
      
      // Format date in a user-friendly way
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch (error) {
      console.error('Registration date formatting error:', error, 'Value:', dateValue)
      return 'Date error'
    }
  }

  // Helper function to format date range with better messaging
  const formatDateRange = (startDate: any, endDate: any) => {
    const start = startDate ? formatDate(startDate) : null
    const end = endDate ? formatDate(endDate) : null
    
    
    if (!start && !end) return 'Event dates coming soon'
    if (!start) return `End: ${end}`
    if (!end) return `Start: ${start}`
    
    // If both dates are the same, show single date
    if (start === end) return start
    
    return `${start} - ${end}`
  }

  // Helper function to format time until/since event dynamically
  const formatTimeUntilEvent = (startDate: any, endDate: any) => {
    if (!startDate || !endDate) return ""
    
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return ""
    
    // Event hasn't started yet
    if (now < start) {
      const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntil === 0) return "Starting today"
      if (daysUntil === 1) return "Starting tomorrow" 
      if (daysUntil > 0) return `${daysUntil} days to go`
      return ""
    }
    
    // Event is ongoing
    if (now >= start && now <= end) {
      const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysRemaining === 0) return "Ending today"
      if (daysRemaining === 1) return "Ending tomorrow"
      if (daysRemaining > 0) return `${daysRemaining} days remaining`
      return "Event in progress"
    }
    
    // Event has ended
    const daysAgo = Math.floor((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24))
    if (daysAgo === 0) return "Ended today"
    if (daysAgo === 1) return "Ended yesterday"
    return `Ended ${daysAgo} days ago`
  }
  
  // Get hackathons with live statuses
  const openHackathons = hackathonStatuses.filter(hs => hs.status.canRegister)
  const upcomingHackathons = hackathonStatuses.filter(hs => 
    hs.status.phase === "registration" || hs.status.phase === "preparation"
  )
  const activeHackathons = hackathonStatuses.filter(hs => hs.status.isActive)

  // Auto-refresh data every 60 seconds to keep participant counts up-to-date
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUserId) {
        refetchHackathons()
        refetchRegistrations()
      }
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [currentUserId, refetchHackathons, refetchRegistrations])

  // Helper function to get registration status display
  const getRegistrationDisplayInfo = (registration: any) => {
    const regStatus = registrationStatuses.find(rs => rs.registration._id === registration._id)
    return {
      status: regStatus?.status.status || "Registered",
      canPay: regStatus?.status.canPay || false,
      priority: regStatus?.status.priority || "low",
      isActive: regStatus?.status.isActive || false,
    }
  }

  // Manual status update function
  const handleManualStatusUpdate = async () => {
    setIsUpdatingStatus(true)
    try {
      const result = await updateStatuses()
      
      if (result.success && result.updated > 0) {
        // Refresh hackathons to get updated participant counts
        await refetchHackathons()
        await refetchRegistrations()
      }
    } catch (error) {
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Force refresh function for debugging
  const handleForceRefresh = async () => {
    setIsUpdatingStatus(true)
    try {
      // First refresh participant counts
      const participantResponse = await fetch('/api/hackathons/refresh-participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const participantResult = await participantResponse.json()
      
      // Then force refresh status
      const response = await fetch('/api/hackathons/force-refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()
      
      // Refresh data instead of reloading page
      if (participantResult.success || result.success) {
        await refetchHackathons()
        await refetchRegistrations()
      }
    } catch (error) {
    } finally {
      setIsUpdatingStatus(false)
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
      {/* Background status updater - runs automatically */}
      <BackgroundStatusUpdater
        updateInterval={5 * 60 * 1000} // Update every 5 minutes
        enabled={true}
        onUpdate={(result) => {
          if (result.updated > 0) {
          }
        }}
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-semibold">Student Dashboard</h1>
              
            </div>
            <p className="text-gray-500">Track your hackathon journey and achievements</p>
            
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
              <div className="text-2xl font-bold">{liveStats.totalRegistrations}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600">
                  {liveStats.confirmedRegistrations} confirmed
                </span>
                {liveStats.pendingPayments > 0 && (
                  <span className="text-red-600 ml-2">
                    • {liveStats.pendingPayments} pending payment
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">My Teams</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.totalTeams}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-blue-600">{liveStats.activeTeams} active</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Certificates</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.totalCertificates}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-yellow-600">
                  {liveStats.winnerCertificates} winner certificates
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
              <div className="text-2xl font-bold">{liveStats.openHackathons}</div>
              <p className="text-xs text-gray-600 mt-1">
                Open for registration
                {liveStats.upcomingEvents > 0 && (
                  <span className="text-blue-600 ml-2">
                    • {liveStats.upcomingEvents} upcoming
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
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
                    {upcomingHackathons.slice(0, 3).map((hackathonStatus) => {
                      const hackathon = hackathonStatus.hackathon
                      const status = hackathonStatus.status
                      const userRegistrationStatus = getUserRegistrationStatus(hackathon._id)
                      
                      // Determine which status to display
                      const displayStatus = userRegistrationStatus || status.status
                      const isUserRegistered = userRegistrationStatus !== null
                      
                      return (
                        <div key={hackathon._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{hackathon.title}</h4>
                            <p className="text-sm text-gray-600">
                              📅 {formatDate(hackathon.startDate)}
                              {status.timeRemaining && (
                                <span className="ml-2 text-blue-600">
                                  • {status.timeRemaining} to go
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              💰 ${hackathon.registrationFee} • 📍 {hackathon.venue}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{getStatusIcon(displayStatus)}</span>
                              <Badge className={
                                isUserRegistered 
                                  ? userRegistrationStatus === "Registered" 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-yellow-100 text-yellow-800"
                                  : getStatusBadgeColor(status.status)
                              }>
                                {displayStatus}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {hackathon.currentParticipants}/{hackathon.maxParticipants} registered
                            </p>
                            
                          </div>
                        </div>
                      )
                    })}
                    {upcomingHackathons.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No upcoming hackathons</p>
                    )}
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
                  {myRegistrations.map((registration: any) => {
                    const displayInfo = getRegistrationDisplayInfo(registration)
                    const hackathonStatus = hackathonStatuses.find(hs => 
                      hs.hackathon._id === registration.hackathon?._id
                    )
                    
                   
                    
                    return (
                      <div key={registration._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{registration.hackathon?.title}</h4>
                            {displayInfo.priority === 'high' && (
                              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            📅 <span className="font-medium">{formatDateRange(registration.hackathon?.startDate, registration.hackathon?.endDate)}</span>
                            {registration.hackathon?.startDate && registration.hackathon?.endDate && (
                              <span className="ml-2 text-blue-600 text-xs">
                                • {formatTimeUntilEvent(registration.hackathon.startDate, registration.hackathon.endDate)}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            💰 {registration.paymentAmount || registration.hackathon?.registrationFee || 'TBD'} • Registered:{" "}
                            {formatRegistrationDate(registration)}
                          </p>
                          
                          {hackathonStatus && (
                            <p className="text-sm text-blue-600 mt-1">
                              {getStatusIcon(hackathonStatus.status.status)} Event Status: {hackathonStatus.status.status}
                              {hackathonStatus.status.timeRemaining && ` • ${hackathonStatus.status.timeRemaining}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-sm">{getStatusIcon(displayInfo.status)}</span>
                              <Badge className={getStatusBadgeColor(displayInfo.status)}>
                                {displayInfo.status}
                              </Badge>
                            </div>
                            <Badge variant={registration.paymentStatus === "Completed" ? "default" : "secondary"}>
                              Payment: {registration.paymentStatus}
                            </Badge>
                          </div>
                          {displayInfo.canPay && (
                            <Link href="/dashboard/student/payments">
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                Pay Now
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
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
                          <span>{formatDate(certificate.issueDate)}</span>
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
