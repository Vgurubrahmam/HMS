"use client"

import { useState } from "react"
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
  RefreshCw,
  BookOpen,
  Award,
  Zap,
  BarChart3,
  GraduationCap,
  Link as LinkIcon
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTeamGuidance } from "@/hooks/use-team-guidance"
import Link from "next/link"

export function MentorTeamGuidance() {
  const { userData } = useCurrentUser()
  const {
    teams,
    sessions,
    summary,
    loading,
    sessionsLoading,
    error,
    sessionsError,
    refetch,
    refetchSessions,
    submitFeedback,
    scheduleSession
  } = useTeamGuidance(userData?.id)

  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

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

  const handleSubmitFeedback = async (teamId: string) => {
    const success = await submitFeedback(teamId, feedbackForm)
    if (success) {
      setFeedbackForm({ message: "", rating: 5, type: "General" })
    }
  }

  const handleScheduleSession = async (teamId: string) => {
    const sessionData = {
      ...sessionForm,
      scheduledDate: `${sessionForm.date}T${sessionForm.time}:00`
    }
    
    const success = await scheduleSession(teamId, sessionData)
    if (success) {
      setSessionForm({
        title: "",
        date: "",
        time: "",
        duration: 60,
        type: "Group",
        agenda: ""
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "bg-red-100 text-red-800 border-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600"
    if (progress >= 60) return "text-blue-600"
    if (progress >= 30) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-12 mt-2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Guidance Dashboard</h2>
          <p className="text-gray-600">Guide and mentor your assigned hackathon teams</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refetch} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/mentor/messages">
            <Button size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
          </Link>
        </div>
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
                  onClick={refetch} 
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

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Teams</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.activeTeams}
                </p>
                <p className="text-xs text-gray-500">
                  of {summary.totalTeams} total
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className={`text-2xl font-bold ${getProgressColor(summary.averageProgress)}`}>
                  {summary.averageProgress.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  across all teams
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {sessions.upcoming.length}
                </p>
                <p className="text-xs text-gray-500">
                  upcoming this week
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary.teamsAtRisk}
                </p>
                <p className="text-xs text-gray-500">
                  need attention
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full"></div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {teams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Assigned</h3>
                <p className="text-gray-600 mb-4">
                  You haven't been assigned to mentor any teams yet.
                </p>
                <p className="text-sm text-gray-500">
                  Contact coordinators to get assigned to teams
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {teams.map((team) => (
                <Card key={team._id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{team.name}</CardTitle>
                          <Badge className={getPhaseColor(team.currentPhase)}>
                            {team.currentPhase}
                          </Badge>
                          <Badge className={getRiskColor(team.metrics.riskLevel)}>
                            {team.metrics.riskLevel.toUpperCase()} RISK
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          🏆 {team.hackathon?.title}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>📅 {formatDate(team.hackathon?.startDate)} - {formatDate(team.hackathon?.endDate)}</span>
                          <span>📍 {team.hackathon?.venue}</span>
                          <span>👥 {team.metrics.totalMembers} members</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Feedback
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
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
                                    <SelectItem value="1">⭐ 1 - Needs Improvement</SelectItem>
                                    <SelectItem value="2">⭐⭐ 2 - Below Average</SelectItem>
                                    <SelectItem value="3">⭐⭐⭐ 3 - Average</SelectItem>
                                    <SelectItem value="4">⭐⭐⭐⭐ 4 - Good</SelectItem>
                                    <SelectItem value="5">⭐⭐⭐⭐⭐ 5 - Excellent</SelectItem>
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
                                onClick={() => handleSubmitFeedback(team._id)}
                                disabled={!feedbackForm.message}
                                className="w-full"
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
                              Schedule
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
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
                                      <SelectItem value="Group">👥 Group Session</SelectItem>
                                      <SelectItem value="One-on-One">👤 One-on-One</SelectItem>
                                      <SelectItem value="Code Review">💻 Code Review</SelectItem>
                                      <SelectItem value="Presentation">🎯 Presentation Review</SelectItem>
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
                                    min={new Date().toISOString().split('T')[0]}
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
                                  <Label>Duration</Label>
                                  <Select 
                                    value={sessionForm.duration.toString()} 
                                    onValueChange={(value) => setSessionForm(prev => ({ ...prev, duration: parseInt(value) }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="30">30 min</SelectItem>
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
                                onClick={() => handleScheduleSession(team._id)}
                                disabled={!sessionForm.title || !sessionForm.date || !sessionForm.time}
                                className="w-full"
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
                    <div className="space-y-6">
                      {/* Enhanced Progress Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Project Progress
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {team.submissionStatus}
                            </Badge>
                            <span className={`text-lg font-bold ${getProgressColor(team.progress)}`}>
                              {team.progress}%
                            </span>
                          </div>
                        </div>
                        <Progress value={team.progress} className="h-3" />
                        <div className="flex justify-between text-xs text-gray-600 mt-2">
                          <span>Started</span>
                          <span>In Progress</span>
                          <span>Completed</span>
                        </div>
                      </div>

                      {/* Team Members Section */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Team Members ({team.members?.length || 0})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {team.members && team.members.length > 0 ? (
                            team.members.map((member) => (
                              <div key={member._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.image} />
                                  <AvatarFallback className="text-xs">{member.name?.charAt(0) || 'M'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{member.name}</p>
                                  <p className="text-xs text-gray-600">{member.role}</p>
                                </div>
                                {member.role === "Team Lead" && (
                                  <Badge variant="secondary" className="text-xs">Lead</Badge>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-4 text-gray-500">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No team members data</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Project: {team.project?.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {team.project?.description || 'No description available'}
                        </p>
                        
                        {team.project?.repository && (
                          <div className="flex items-center gap-2 mb-2">
                            <LinkIcon className="h-4 w-4 text-blue-600" />
                            <a 
                              href={team.project.repository} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View Repository
                            </a>
                          </div>
                        )}

                        {team.project?.techStack && team.project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {team.project.techStack.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Milestones */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Milestones
                        </h4>
                        <div className="space-y-2">
                          {team.milestones && team.milestones.length > 0 ? (
                            team.milestones.slice(0, 4).map((milestone) => (
                              <div key={milestone._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {getMilestoneIcon(milestone.status)}
                                  <div>
                                    <p className="text-sm font-medium">{milestone.title}</p>
                                    <p className="text-xs text-gray-600">{milestone.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline" className="text-xs">
                                    {milestone.status}
                                  </Badge>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Due: {formatDate(milestone.dueDate)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No milestones set yet</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Latest Feedback */}
                      {team.feedback && team.feedback.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Latest Feedback
                          </h4>
                          <div className="space-y-2">
                            {team.feedback.slice(0, 2).map((feedback) => (
                              <div key={feedback._id} className="bg-white p-3 rounded">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`h-3 w-3 ${i < feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                        />
                                      ))}
                                    </div>
                                    <Badge variant="outline" className="text-xs">{feedback.type}</Badge>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(feedback.date)}
                                  </span>
                                </div>
                                <p className="text-sm">{feedback.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button size="sm" variant="outline">
                          <Video className="mr-2 h-4 w-4" />
                          Video Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          View Submissions
                        </Button>
                        <Button size="sm" variant="outline">
                          <Award className="mr-2 h-4 w-4" />
                          Progress Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Mentoring Sessions</h3>
            <Badge variant="outline">
              {sessions.upcoming.length} Upcoming
            </Badge>
          </div>
          
          {sessionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sessions.all.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Scheduled</h3>
                <p className="text-gray-600">
                  Schedule mentoring sessions with your teams to track their progress.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Sessions */}
              {sessions.upcoming.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Upcoming Sessions ({sessions.upcoming.length})
                  </h4>
                  <div className="space-y-3">
                    {sessions.upcoming.map((session) => (
                      <Card key={session._id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-semibold text-lg">{session.title}</h5>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {session.teamName || 'Team Session'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDateTime(session.scheduledDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {session.duration} min
                                </span>
                              </div>
                              <Badge className="mt-2">{session.type}</Badge>
                              {session.agenda && (
                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                  {session.agenda}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Video className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm">
                                Join Session
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Sessions */}
              {sessions.completed.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed Sessions ({sessions.completed.length})
                  </h4>
                  <div className="space-y-3">
                    {sessions.completed.slice(0, 5).map((session) => (
                      <Card key={session._id} className="border-l-4 border-l-gray-400 opacity-90">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-semibold">{session.title}</h5>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span>{session.teamName || 'Team Session'}</span>
                                <span>{formatDateTime(session.scheduledDate)}</span>
                                <Badge variant="outline">{session.type}</Badge>
                              </div>
                              {session.notes && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm font-medium text-blue-900 mb-1">Session Notes:</p>
                                  <p className="text-sm text-blue-800">{session.notes}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Team Progress Overview</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Avg: {summary.averageProgress.toFixed(1)}%
              </Badge>
              <Badge variant={summary.teamsAtRisk > 0 ? "destructive" : "secondary"}>
                {summary.teamsAtRisk} At Risk
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <Card key={team._id} className={`border-l-4 ${
                team.metrics.riskLevel === 'high' ? 'border-l-red-500' :
                team.metrics.riskLevel === 'medium' ? 'border-l-yellow-500' :
                'border-l-green-500'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription>{team.hackathon.title}</CardDescription>
                    </div>
                    <Badge className={getRiskColor(team.metrics.riskLevel)}>
                      {team.metrics.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar with Details */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className={`text-sm font-bold ${getProgressColor(team.progress)}`}>
                          {team.progress}%
                        </span>
                      </div>
                      <Progress value={team.progress} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">
                        Current Phase: {team.currentPhase}
                      </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600">Team Size</p>
                        <p className="font-semibold">{team.metrics.totalMembers} members</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600">Engagement</p>
                        <p className="font-semibold">{team.metrics.engagementScore.toFixed(0)}%</p>
                      </div>
                    </div>

                    {/* Next Milestone */}
                    {team.metrics.nextMilestone && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Next Milestone</p>
                        <p className="text-sm text-blue-800">{team.metrics.nextMilestone.title}</p>
                        <p className="text-xs text-blue-600">
                          Due: {formatDate(team.metrics.nextMilestone.dueDate)}
                        </p>
                      </div>
                    )}

                    {/* Action Items */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {teams.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data</h3>
                <p className="text-gray-600">
                  Team progress information will appear here once you have assigned teams.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Feedback & Reviews</h3>
            <Badge variant="outline">
              {teams.reduce((total, team) => total + (team.feedback?.length || 0), 0)} Total Feedback
            </Badge>
          </div>

          <div className="space-y-6">
            {teams.map((team) => (
              <Card key={team._id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription>{team.hackathon.title}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {team.feedback && team.feedback.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            {(team.feedback.reduce((sum, f) => sum + f.rating, 0) / team.feedback.length).toFixed(1)}
                          </span>
                        </div>
                      )}
                      <Badge variant="outline">
                        {team.feedback?.length || 0} feedback
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {team.feedback && team.feedback.length > 0 ? (
                    <div className="space-y-4">
                      {team.feedback.slice(0, 3).map((feedback) => (
                        <div key={feedback._id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{feedback.type}</Badge>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3 w-3 ${i < feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(feedback.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">{feedback.message}</p>
                        </div>
                      ))}
                      
                      {team.feedback.length > 3 && (
                        <p className="text-center text-sm text-gray-500">
                          +{team.feedback.length - 3} more feedback entries
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No feedback provided yet</p>
                      <p className="text-xs text-gray-400">
                        Use the feedback button in Team Overview to provide guidance
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {teams.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback History</h3>
                <p className="text-gray-600">
                  Feedback you provide to teams will appear here for easy tracking.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}