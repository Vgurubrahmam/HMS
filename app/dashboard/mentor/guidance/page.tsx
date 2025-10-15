"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Target, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Send,
  Plus,
  ArrowLeft,
  Loader2
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTeams } from "@/hooks/use-teams"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function TeamGuidancePage() {
  const { userData, loading: userLoading } = useCurrentUser()
  const currentUserId = userData?.id
  const { teams: allTeams, loading: teamsLoading } = useTeams({ limit: 50 })
  const { toast } = useToast()

  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [guidanceType, setGuidanceType] = useState<string>("")
  const [guidanceContent, setGuidanceContent] = useState("")
  const [goalTitle, setGoalTitle] = useState("")
  const [goalDescription, setGoalDescription] = useState("")
  const [goalDeadline, setGoalDeadline] = useState("")

  const loading = userLoading || teamsLoading

  // Filter teams where current user is the mentor
  const mentorTeams = useMemo(() => {
    return allTeams.filter((team: any) => 
      team.mentor?._id === currentUserId || team.mentor?.id === currentUserId
    )
  }, [allTeams, currentUserId])

  const handleSendGuidance = () => {
    if (!selectedTeam || !guidanceType || !guidanceContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    // Here you would typically call an API to send the guidance
    toast({
      title: "Guidance Sent",
      description: "Your guidance has been sent to the team successfully.",
    })

    // Reset form
    setSelectedTeam("")
    setGuidanceType("")
    setGuidanceContent("")
  }

  const handleSetGoal = () => {
    if (!selectedTeam || !goalTitle.trim() || !goalDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all goal fields.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Goal Set",
      description: "New goal has been set for the team.",
    })

    // Reset form
    setGoalTitle("")
    setGoalDescription("")
    setGoalDeadline("")
  }

  const guidanceTemplates = [
    {
      type: "technical",
      title: "Technical Guidance",
      template: "I've reviewed your progress and here are some technical recommendations:\n\n1. Architecture considerations:\n2. Best practices:\n3. Potential improvements:"
    },
    {
      type: "progress",
      title: "Progress Review",
      template: "Based on your current progress, here's my feedback:\n\nStrengths:\n- \n\nAreas for improvement:\n- \n\nNext steps:\n- "
    },
    {
      type: "motivation",
      title: "Motivational Support",
      template: "Your team is doing great! Here's some encouragement:\n\n- Your hard work is paying off\n- Keep up the excellent collaboration\n- Remember to celebrate small wins"
    }
  ]

  if (loading) {
    return (
      <DashboardLayout userRole="mentor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading guidance tools...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Team Guidance</h1>
            <p className="text-gray-600">Provide mentoring support and set goals for your teams</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mentorTeams.length}</div>
              <p className="text-xs text-gray-600">Teams under guidance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mentorTeams.length > 0 
                  ? Math.round(mentorTeams.reduce((sum: number, team: any) => sum + (team.progress?.overall || 0), 0) / mentorTeams.length)
                  : 0}%
              </div>
              <p className="text-xs text-gray-600">Across all teams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams Needing Help</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mentorTeams.filter((team: any) => (team.progress?.overall || 0) < 50).length}
              </div>
              <p className="text-xs text-gray-600">Below 50% progress</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Send Guidance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send Guidance
              </CardTitle>
              <CardDescription>Provide mentoring support and feedback to your teams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-select">Select Team</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team to guide" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentorTeams.map((team: any) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name || "Unnamed Team"} - {team.hackathon?.title || "Unknown Hackathon"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guidance-type">Guidance Type</Label>
                <Select value={guidanceType} onValueChange={setGuidanceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select guidance type" />
                  </SelectTrigger>
                  <SelectContent>
                    {guidanceTemplates.map((template) => (
                      <SelectItem key={template.type} value={template.type}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {guidanceType && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="guidance-content">Guidance Content</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const template = guidanceTemplates.find(t => t.type === guidanceType)
                        if (template) setGuidanceContent(template.template)
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                  <Textarea
                    id="guidance-content"
                    placeholder="Type your guidance here..."
                    value={guidanceContent}
                    onChange={(e) => setGuidanceContent(e.target.value)}
                    rows={6}
                  />
                </div>
              )}

              <Button 
                onClick={handleSendGuidance} 
                className="w-full"
                disabled={!selectedTeam || !guidanceType || !guidanceContent.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Guidance
              </Button>
            </CardContent>
          </Card>

          {/* Set Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Set Team Goals
              </CardTitle>
              <CardDescription>Create milestones and objectives for your teams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-team">Select Team</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentorTeams.map((team: any) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name || "Unnamed Team"} - {team.hackathon?.title || "Unknown Hackathon"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Complete MVP by Friday"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-description">Goal Description</Label>
                <Textarea
                  id="goal-description"
                  placeholder="Describe the goal and success criteria..."
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Deadline (Optional)</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSetGoal} 
                className="w-full"
                disabled={!selectedTeam || !goalTitle.trim() || !goalDescription.trim()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Set Goal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Team Overview */}
        {mentorTeams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
              <CardDescription>Quick overview of your teams' current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mentorTeams.map((team: any) => (
                  <div key={team._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{team.name || "Unnamed Team"}</h4>
                        <p className="text-sm text-gray-600">{team.hackathon?.title || "Unknown Hackathon"}</p>
                        <p className="text-xs text-gray-500">
                          {team.members?.length || 0} members
                        </p>
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
                         (team.progress?.overall || 0) >= 50 ? "On Track" : "Needs Attention"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{team.progress?.overall || 0}%</span>
                      </div>
                      <Progress value={team.progress?.overall || 0} className="h-2" />
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedTeam(team._id)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Guide Team
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedTeam(team._id)}
                      >
                        <Target className="h-3 w-3 mr-1" />
                        Set Goal
                      </Button>
                      <Link href={`/dashboard/mentor/teams`}>
                        <Button variant="outline" size="sm">
                          <Users className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {mentorTeams.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Assigned</h3>
              <p className="text-gray-600 mb-4">
                You haven't been assigned any teams to mentor yet. Teams will appear here when coordinators assign them to you.
              </p>
              <Link href="/dashboard/mentor">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}