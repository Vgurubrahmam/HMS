"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Trophy, 
  Calendar, 
  Users, 
  Target, 
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Code,
  Upload,
  ExternalLink,
  MessageSquare,
  Star,
  Award
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"

interface TeamProgress {
  _id: string
  team: {
    _id: string
    name: string
    members: Array<{
      _id: string
      username: string
      image?: string
    }>
    mentor?: {
      _id: string
      username: string
      email: string
    }
  }
  hackathon: {
    _id: string
    title: string
    startDate: string
    endDate: string
    status: string
  }
  project: {
    title: string
    description: string
    repository?: string
    liveUrl?: string
    techStack: string[]
  }
  milestones: Array<{
    _id: string
    title: string
    description: string
    status: "Completed" | "In Progress" | "Pending"
    dueDate: string
    completedDate?: string
  }>
  overallProgress: number
  submissions: Array<{
    _id: string
    type: "Code" | "Demo" | "Presentation" | "Documentation"
    title: string
    url: string
    submittedDate: string
    feedback?: string
    score?: number
  }>
  mentorFeedback: Array<{
    _id: string
    message: string
    date: string
    rating?: number
  }>
  currentPhase: "Planning" | "Development" | "Testing" | "Demo" | "Completed"
}

interface Achievement {
  _id: string
  title: string
  description: string
  type: "Participation" | "Completion" | "Excellence" | "Leadership"
  earnedDate: string
  hackathon: string
  icon: string
}

export function StudentProgressTracker() {
  const [teamProgresses, setTeamProgresses] = useState<TeamProgress[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProgress, setSelectedProgress] = useState<TeamProgress | null>(null)
  const { userData } = useCurrentUser()
  const { toast } = useToast()

  const [newSubmission, setNewSubmission] = useState({
    type: "Code" as const,
    title: "",
    url: "",
    description: ""
  })

  useEffect(() => {
    if (userData?.id) {
      fetchProgressData()
      fetchAchievements()
    }
  }, [userData])

  const fetchProgressData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/progress/student/${userData?.id}`)
      if (response.ok) {
        const data = await response.json()
        setTeamProgresses(data.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch progress data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/achievements/student/${userData?.id}`)
      if (response.ok) {
        const data = await response.json()
        // Handle the nested structure from the API
        const achievementsArray = data.data?.achievements || data.data || []
        setAchievements(Array.isArray(achievementsArray) ? achievementsArray : [])
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error)
      setAchievements([]) // Ensure it's always an array
    }
  }

  const submitProgress = async (progressId: string, submissionData: any) => {
    try {
      const response = await fetch(`/api/progress/${progressId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Submission uploaded successfully",
        })
        fetchProgressData()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to submit",
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
      case "Completed": return <CheckCircle className="h-5 w-5 text-green-600" />
      case "In Progress": return <Clock className="h-5 w-5 text-yellow-600" />
      case "Pending": return <AlertCircle className="h-5 w-5 text-gray-600" />
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "Participation": return "🎯"
      case "Completion": return "🏆"
      case "Excellence": return "⭐"
      case "Leadership": return "👑"
      default: return "🏅"
    }
  }

  const activeProgresses = teamProgresses.filter(p => p.hackathon.status === "Active")
  const completedProgresses = teamProgresses.filter(p => p.hackathon.status === "Completed")
  const averageProgress = teamProgresses.length > 0 
    ? teamProgresses.reduce((sum, p) => sum + p.overallProgress, 0) / teamProgresses.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Progress Tracker</h2>
          <p className="text-gray-600">Track your hackathon participation and achievements</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold">{activeProgresses.length}</p>
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
                <p className="text-2xl font-bold">{completedProgresses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                <p className="text-2xl font-bold">{averageProgress.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className="text-2xl font-bold">{Array.isArray(achievements) ? achievements.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Projects ({activeProgresses.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedProgresses.length})</TabsTrigger>
          <TabsTrigger value="achievements">Achievements ({Array.isArray(achievements) ? achievements.length : 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeProgresses.map((progress) => (
            <Card key={progress._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{progress.hackathon.title}</CardTitle>
                    <CardDescription>Team: {progress.team.name}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPhaseColor(progress.currentPhase)}>
                        {progress.currentPhase}
                      </Badge>
                      <Badge variant="outline">
                        {progress.overallProgress}% Complete
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {new Date(progress.hackathon.startDate).toLocaleDateString()} - 
                      {new Date(progress.hackathon.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {/* Overall Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Overall Progress</h4>
                      <span className="text-sm text-gray-600">{progress.overallProgress}%</span>
                    </div>
                    <Progress value={progress.overallProgress} className="h-3" />
                  </div>

                  {/* Project Info */}
                  <div>
                    <h4 className="font-medium mb-2">Project: {progress.project.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{progress.project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {progress.project.techStack.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {progress.project.repository && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={progress.project.repository} target="_blank" rel="noopener noreferrer">
                            <Code className="mr-2 h-4 w-4" />
                            Repository
                          </a>
                        </Button>
                      )}
                      {progress.project.liveUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={progress.project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h4 className="font-medium mb-2">Team Members</h4>
                    <div className="flex flex-wrap gap-2">
                      {progress.team.members.map((member) => (
                        <div key={member._id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.image} />
                            <AvatarFallback>{member.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.username}</span>
                        </div>
                      ))}
                    </div>
                    {progress.team.mentor && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">Mentor: </span>
                        <span className="font-medium">{progress.team.mentor.username}</span>
                      </div>
                    )}
                  </div>

                  {/* Milestones */}
                  <div>
                    <h4 className="font-medium mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {progress.milestones.map((milestone) => (
                        <div key={milestone._id} className="flex items-start gap-3 p-3 border rounded-lg">
                          {getMilestoneIcon(milestone.status)}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">{milestone.title}</h5>
                                <p className="text-sm text-gray-600">{milestone.description}</p>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-gray-600">Due: {new Date(milestone.dueDate).toLocaleDateString()}</div>
                                {milestone.completedDate && (
                                  <div className="text-green-600">
                                    Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submissions */}
                  {progress.submissions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Submissions</h4>
                      <div className="space-y-2">
                        {progress.submissions.map((submission) => (
                          <div key={submission._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{submission.type}</Badge>
                                <span className="font-medium">{submission.title}</span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Submitted: {new Date(submission.submittedDate).toLocaleDateString()}
                              </div>
                              {submission.score && (
                                <div className="text-sm font-medium text-green-600 mt-1">
                                  Score: {submission.score}/100
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <a href={submission.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mentor Feedback */}
                  {progress.mentorFeedback.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Mentor Feedback</h4>
                      <div className="space-y-2">
                        {progress.mentorFeedback.map((feedback) => (
                          <div key={feedback._id} className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">Mentor Feedback</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                {feedback.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {feedback.rating}/5
                                  </div>
                                )}
                                <span>{new Date(feedback.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <p className="text-sm">{feedback.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Submit */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Quick Submit</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedProgress(progress)}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Work
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contact Mentor
                      </Button>
                      <Button size="sm" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Team Chat
                      </Button>
                      <Button size="sm" variant="outline">
                        <Target className="mr-2 h-4 w-4" />
                        Update Progress
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeProgresses.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No active projects at the moment.</p>
                <Button className="mt-4" onClick={() => window.location.href = '/dashboard/student/hackathons'}>
                  Join a Hackathon
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedProgresses.map((progress) => (
            <Card key={progress._id} className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {progress.hackathon.title}
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </CardTitle>
                    <CardDescription>Team: {progress.team.name}</CardDescription>
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      Completed - {progress.overallProgress}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Show final submission and achievements */}
                <p className="text-green-700">
                  🎉 Congratulations! You've successfully completed this hackathon.
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(achievements) && achievements.map((achievement) => (
              <Card key={achievement._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{getAchievementIcon(achievement.type)}</div>
                  <h3 className="font-bold text-lg">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{achievement.description}</p>
                  <Badge className="mt-3" variant="outline">
                    {achievement.type}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!Array.isArray(achievements) || achievements.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No achievements yet. Keep participating to earn achievements!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}