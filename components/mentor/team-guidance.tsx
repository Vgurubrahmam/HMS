"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Video, 
  Phone,
  Clock, 
  Target,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Send,
  Plus,
  FileText,
  Star,
  ThumbsUp,
  Eye,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"

interface Team {
  _id: string
  name: string
  hackathon: {
    _id: string
    title: string
    startDate: string
    endDate: string
    status: string
  }
  members: Array<{
    _id: string
    name: string
    email: string
    image?: string
    role?: string
  }>
  project: {
    title: string
    description: string
    repository?: string
    liveUrl?: string
    techStack: string[]
  }
  progress: number
  currentPhase: "Planning" | "Development" | "Testing" | "Demo" | "Completed"
  milestones: Array<{
    _id: string
    title: string
    status: "Completed" | "In Progress" | "Pending"
    dueDate: string
  }>
  meetings: Array<{
    _id: string
    title: string
    date: string
    duration: number
    attendees: string[]
    notes?: string
  }>
  feedback: Array<{
    _id: string
    message: string
    date: string
    rating?: number
    type: "General" | "Technical" | "Presentation" | "Progress"
  }>
}

interface MentorSession {
  _id: string
  team: string
  title: string
  scheduledDate: string
  duration: number
  type: "One-on-One" | "Group" | "Code Review" | "Presentation"
  status: "Scheduled" | "Completed" | "Cancelled"
  notes?: string
}

export function MentorTeamGuidance() {
  const [teams, setTeams] = useState<Team[]>([])
  const [sessions, setSessions] = useState<MentorSession[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const { userData } = useCurrentUser()
  const { toast } = useToast()

  const [feedbackForm, setFeedbackForm] = useState({
    message: "",
    rating: 5,
    type: "General" as const
  })

  const [sessionForm, setSessionForm] = useState({
    title: "",
    date: "",
    time: "",
    duration: 60,
    type: "Group" as const,
    agenda: ""
  })

  useEffect(() => {
    if (userData?.id) {
      fetchAssignedTeams()
      fetchMentorSessions()
    }
  }, [userData])

  const fetchAssignedTeams = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/mentors/${userData?.id}/teams`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Raw teams data:", data.data)
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch teams")
      }
      
      // Transform the data to match the interface
      const transformedTeams = (data.data || []).map((team: any) => ({
        _id: team._id,
        name: team.name,
        hackathon: {
          _id: team.hackathon?._id || team.hackathon,
          title: team.hackathon?.title || "Unknown Hackathon",
          dates: {
            start: team.hackathon?.startDate || team.hackathon?.dates?.start,
            end: team.hackathon?.endDate || team.hackathon?.dates?.end
          },
          status: team.hackathon?.status || "Active"
        },
        members: (team.members || []).map((member: any) => ({
          _id: member._id,
          name: member.name || member.fullName || "Unknown Member",
          email: member.email || "",
          image: member.profilePicture || member.image,
          role: member === team.teamLead ? "Team Lead" : "Member"
        })),
        project: {
          title: team.projectTitle || "Untitled Project",
          description: team.projectDescription || "No description available",
          repository: team.submissionUrl || "",
          liveUrl: "",
          techStack: []
        },
        progress: team.progress || 0,
        currentPhase: (() => {
          const status = team.submissionStatus || "Planning"
          const phaseMap: { [key: string]: "Planning" | "Development" | "Testing" | "Demo" | "Completed" } = {
            "Planning": "Planning",
            "In Progress": "Development", 
            "Submitted": "Demo",
            "Evaluated": "Completed"
          }
          return phaseMap[status] || "Planning"
        })(),
        milestones: [],
        meetings: [],
        feedback: []
      }))
      
      console.log("Transformed teams:", transformedTeams)
      setTeams(transformedTeams)
    } catch (error) {
      console.error("Error fetching teams:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch assigned teams"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMentorSessions = async () => {
    try {
      const response = await fetch(`/api/mentors/${userData?.id}/sessions`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch sessions")
      }
      
      setSessions(data.data || [])
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
      // Don't show toast for sessions since it's not critical
      setSessions([])
    }
  }

  const submitFeedback = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...feedbackForm,
          mentorId: userData?.id
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Feedback submitted successfully",
        })
        fetchAssignedTeams()
        setFeedbackForm({ message: "", rating: 5, type: "General" })
      } else {
        toast({
          title: "Error",
          description: "Failed to submit feedback",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const scheduleSession = async (teamId: string) => {
    try {
      const sessionData = {
        ...sessionForm,
        teamId,
        mentorId: userData?.id,
        scheduledDate: `${sessionForm.date}T${sessionForm.time}:00`
      }

      const response = await fetch("/api/mentoring-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Session scheduled successfully",
        })
        fetchMentorSessions()
        setSessionForm({
          title: "",
          date: "",
          time: "",
          duration: 60,
          type: "Group",
          agenda: ""
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to schedule session",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "Planning": return "bg-blue-100 text-blue-800"
      case "Development": return "bg-yellow-100 text-yellow-800"
      case "Testing": return "bg-purple-100 text-purple-800"
      case "Demo": return "bg-orange-100 text-orange-800"
      case "Completed": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "In Progress": return <Clock className="h-4 w-4 text-yellow-600" />
      case "Pending": return <AlertCircle className="h-4 w-4 text-gray-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const refreshData = async () => {
    if (userData?.id) {
      await Promise.all([
        fetchAssignedTeams(),
        fetchMentorSessions()
      ])
      toast({
        title: "Success",
        description: "Data refreshed successfully",
      })
    }
  }

  const activeTeams = teams.filter(t => t?.hackathon?.status === "Active")
  const completedTeams = teams.filter(t => t?.hackathon?.status === "Completed")
  const upcomingSessions = sessions.filter(s => s?.status === "Scheduled" && new Date(s.scheduledDate) > new Date())
  const averageProgress = teams.length > 0 ? teams.reduce((sum, t) => sum + (t?.progress || 0), 0) / teams.length : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Guidance Dashboard</h2>
          <p className="text-gray-600">Guide and mentor your assigned hackathon teams</p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={loading}
          variant="outline"
          size="sm"
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
                <p className="font-medium text-red-800">Error Loading Data</p>
                <p className="text-sm text-red-600">{error}</p>
                <Button 
                  onClick={refreshData} 
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Teams</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : activeTeams.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : completedTeams.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : upcomingSessions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : `${averageProgress.toFixed(1)}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="sessions">Mentoring Sessions</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {activeTeams.map((team) => (
            <Card key={team._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <CardDescription>{team.hackathon?.title || 'Unknown Hackathon'}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPhaseColor(team.currentPhase)}>
                        {team.currentPhase}
                      </Badge>
                      <Badge variant="outline">
                        {team.progress}% Complete
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Give Feedback
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Provide Feedback to {team.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Feedback Type</Label>
                            <Select 
                              value={feedbackForm.type} 
                              onValueChange={(value) => setFeedbackForm(prev => ({ ...prev, type: value as any }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Technical">Technical</SelectItem>
                                <SelectItem value="Presentation">Presentation</SelectItem>
                                <SelectItem value="Progress">Progress</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Rating (1-5)</Label>
                            <Select 
                              value={feedbackForm.rating.toString()} 
                              onValueChange={(value) => setFeedbackForm(prev => ({ ...prev, rating: parseInt(value) }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 - Needs Improvement</SelectItem>
                                <SelectItem value="2">2 - Below Average</SelectItem>
                                <SelectItem value="3">3 - Average</SelectItem>
                                <SelectItem value="4">4 - Good</SelectItem>
                                <SelectItem value="5">5 - Excellent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Feedback Message</Label>
                            <Textarea
                              value={feedbackForm.message}
                              onChange={(e) => setFeedbackForm(prev => ({ ...prev, message: e.target.value }))}
                              placeholder="Provide detailed feedback to help the team improve..."
                              rows={4}
                            />
                          </div>

                          <Button 
                            onClick={() => submitFeedback(team._id)}
                            disabled={!feedbackForm.message}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Submit Feedback
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Mentoring Session</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Session Title</Label>
                              <Input
                                value={sessionForm.title}
                                onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Weekly check-in"
                              />
                            </div>
                            <div>
                              <Label>Session Type</Label>
                              <Select 
                                value={sessionForm.type} 
                                onValueChange={(value) => setSessionForm(prev => ({ ...prev, type: value as any }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Group">Group Session</SelectItem>
                                  <SelectItem value="One-on-One">One-on-One</SelectItem>
                                  <SelectItem value="Code Review">Code Review</SelectItem>
                                  <SelectItem value="Presentation">Presentation Review</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={sessionForm.date}
                                onChange={(e) => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>Time</Label>
                              <Input
                                type="time"
                                value={sessionForm.time}
                                onChange={(e) => setSessionForm(prev => ({ ...prev, time: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>Duration (minutes)</Label>
                              <Select 
                                value={sessionForm.duration.toString()} 
                                onValueChange={(value) => setSessionForm(prev => ({ ...prev, duration: parseInt(value) }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="60">1 hour</SelectItem>
                                  <SelectItem value="90">1.5 hours</SelectItem>
                                  <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Agenda</Label>
                            <Textarea
                              value={sessionForm.agenda}
                              onChange={(e) => setSessionForm(prev => ({ ...prev, agenda: e.target.value }))}
                              placeholder="Session agenda and topics to discuss..."
                              rows={3}
                            />
                          </div>

                          <Button 
                            onClick={() => scheduleSession(team._id)}
                            disabled={!sessionForm.title || !sessionForm.date || !sessionForm.time}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Session
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Overall Progress</h4>
                      <span className="text-sm text-gray-600">{team.progress}%</span>
                    </div>
                    <Progress value={team.progress} className="h-2" />
                  </div>

                  {/* Team Members */}
                  <div>
                    <h4 className="font-medium mb-2">Team Members ({team.members?.length || 0})</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.members && team.members.length > 0 ? (
                        team.members.map((member) => (
                          <div key={member._id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.image} />
                              <AvatarFallback>{member.name?.charAt(0) || 'M'}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.name}</span>
                            {member.role && (
                              <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No team members</p>
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div>
                    <h4 className="font-medium mb-2">Project: {team.project?.title || 'Untitled Project'}</h4>
                    <p className="text-sm text-gray-600 mb-2">{team.project?.description || 'No description available'}</p>
                    <div className="flex flex-wrap gap-2">
                      {team.project?.techStack && team.project.techStack.length > 0 ? (
                        team.project.techStack.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-xs">No tech stack specified</Badge>
                      )}
                    </div>
                  </div>

                  {/* Recent Milestones */}
                  <div>
                    <h4 className="font-medium mb-2">Recent Milestones</h4>
                    <div className="space-y-2">
                      {team.milestones && team.milestones.length > 0 ? (
                        team.milestones.slice(0, 3).map((milestone) => (
                          <div key={milestone._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              {getMilestoneIcon(milestone.status)}
                              <span className="text-sm">{milestone.title}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No milestones available</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Feedback */}
                  {team.feedback && team.feedback.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Latest Feedback</h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Rating: {team.feedback[0]?.rating || 'N/A'}/5</span>
                          <Badge variant="outline" className="text-xs">{team.feedback[0]?.type || 'General'}</Badge>
                        </div>
                        <p className="text-sm">{team.feedback[0]?.message || 'No feedback available'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {team.feedback[0]?.date ? new Date(team.feedback[0].date).toLocaleDateString() : 'No date'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline">
                      <Video className="mr-2 h-4 w-4" />
                      Video Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      View Submissions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && activeTeams.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No active teams assigned</p>
                <p className="text-sm text-gray-500">Contact coordinators to get assigned to teams</p>
              </CardContent>
            </Card>
          )}
            </>
          )}
        </TabsContent>

        <TabsContent value="sessions">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
            {upcomingSessions.map((session) => (
              <Card key={session._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{session.title}</h4>
                      <p className="text-sm text-gray-600">{session.type}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.scheduledDate).toLocaleDateString()} at{' '}
                        {new Date(session.scheduledDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Team Feedback History</h3>
            {teams.map((team) => (
              <Card key={team._id}>
                <CardHeader>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {team.feedback && team.feedback.length > 0 ? (
                    <div className="space-y-3">
                      {team.feedback.map((feedback) => (
                        <div key={feedback._id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline">{feedback.type}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{feedback.rating}/5</span>
                            </div>
                          </div>
                          <p className="text-sm">{feedback.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(feedback.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No feedback provided yet</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}