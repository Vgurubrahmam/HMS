"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Users, MessageSquare, Calendar, Clock, Trophy, Target, BookOpen, Send, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function MentorTeamsPage() {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: "Code Crushers",
      hackathon: "AI Innovation Challenge 2024",
      projectTitle: "AI-Powered Healthcare Assistant",
      members: [
        {
          id: 1,
          name: "Sarah Johnson",
          role: "Team Lead",
          email: "sarah@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          skills: ["Python", "ML"],
        },
        {
          id: 2,
          name: "Mike Chen",
          role: "Developer",
          email: "mike@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          skills: ["TensorFlow", "React"],
        },
        {
          id: 3,
          name: "Emily Davis",
          role: "Designer",
          email: "emily@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          skills: ["UI/UX", "Figma"],
        },
        {
          id: 4,
          name: "Alex Kumar",
          role: "Developer",
          email: "alex@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          skills: ["Backend", "APIs"],
        },
      ],
      progress: 75,
      status: "On Track",
      lastUpdate: "2 hours ago",
      nextMeeting: "Today, 3:00 PM",
      milestones: [
        { title: "Project Planning", completed: true, dueDate: "2024-01-15" },
        { title: "MVP Development", completed: true, dueDate: "2024-01-16" },
        { title: "Testing & Refinement", completed: false, dueDate: "2024-01-17" },
        { title: "Final Presentation", completed: false, dueDate: "2024-01-17" },
      ],
      recentMessages: [
        {
          sender: "Sarah Johnson",
          message: "Need help with TensorFlow implementation",
          time: "1 hour ago",
          unread: true,
        },
        { sender: "Mike Chen", message: "API integration completed", time: "3 hours ago", unread: false },
      ],
      challenges: ["Model accuracy needs improvement", "API response time optimization"],
      strengths: ["Strong team collaboration", "Clear project vision", "Good technical skills"],
    },
    {
      id: 2,
      name: "Blockchain Builders",
      hackathon: "Web3 Developer Summit",
      projectTitle: "Decentralized Voting Platform",
      members: [
        {
          id: 5,
          name: "John Doe",
          role: "Team Lead",
          email: "john@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          skills: ["Solidity", "Web3"],
        },
        {
          id: 6,
          name: "Lisa Wang",
          role: "Smart Contract Dev",
          email: "lisa@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          skills: ["Ethereum", "DeFi"],
        },
        {
          id: 7,
          name: "Tom Brown",
          role: "Frontend Dev",
          email: "tom@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          skills: ["React", "Web3.js"],
        },
      ],
      progress: 45,
      status: "Needs Attention",
      lastUpdate: "1 day ago",
      nextMeeting: "Tomorrow, 10:00 AM",
      milestones: [
        { title: "Smart Contract Design", completed: true, dueDate: "2024-01-22" },
        { title: "Contract Development", completed: false, dueDate: "2024-01-23" },
        { title: "Frontend Integration", completed: false, dueDate: "2024-01-24" },
        { title: "Testing & Deployment", completed: false, dueDate: "2024-01-24" },
      ],
      recentMessages: [
        { sender: "John Doe", message: "Smart contract testing issues", time: "5 hours ago", unread: true },
        { sender: "Lisa Wang", message: "Need guidance on gas optimization", time: "1 day ago", unread: true },
      ],
      challenges: ["Smart contract complexity", "Gas optimization issues", "Testing environment setup"],
      strengths: ["Innovative concept", "Blockchain expertise", "Dedicated team members"],
    },
    {
      id: 3,
      name: "Mobile Masters",
      hackathon: "Mobile App Hackathon",
      projectTitle: "Fitness Tracking App",
      members: [
        {
          id: 8,
          name: "Anna Lee",
          role: "Team Lead",
          email: "anna@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          skills: ["React Native", "iOS"],
        },
        {
          id: 9,
          name: "David Kim",
          role: "iOS Developer",
          email: "david@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          skills: ["Swift", "iOS"],
        },
        {
          id: 10,
          name: "Sophie Chen",
          role: "Android Developer",
          email: "sophie@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          skills: ["Kotlin", "Android"],
        },
      ],
      progress: 90,
      status: "Excellent",
      lastUpdate: "30 minutes ago",
      nextMeeting: "Jan 20, 2:00 PM",
      milestones: [
        { title: "App Design", completed: true, dueDate: "2024-02-01" },
        { title: "Core Features", completed: true, dueDate: "2024-02-02" },
        { title: "Testing", completed: true, dueDate: "2024-02-03" },
        { title: "Final Polish", completed: false, dueDate: "2024-02-03" },
      ],
      recentMessages: [
        { sender: "Anna Lee", message: "Demo slides are ready for review", time: "30 minutes ago", unread: false },
        { sender: "David Kim", message: "iOS version testing completed", time: "2 hours ago", unread: false },
      ],
      challenges: ["Minor UI polish needed"],
      strengths: ["Excellent execution", "Great user experience", "Strong technical implementation"],
    },
  ])

  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [newFeedback, setNewFeedback] = useState("")
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800"
      case "On Track":
        return "bg-blue-100 text-blue-800"
      case "Needs Attention":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSendMessage = (teamId: number) => {
    if (!newMessage.trim()) return

    toast({
      title: "Message Sent",
      description: "Your message has been sent to the team.",
    })
    setNewMessage("")
    setIsMessageDialogOpen(false)
  }

  const handleProvideFeedback = (teamId: number) => {
    if (!newFeedback.trim()) return

    toast({
      title: "Feedback Provided",
      description: "Your feedback has been recorded for the team.",
    })
    setNewFeedback("")
  }

  const stats = {
    totalTeams: teams.length,
    excellentTeams: teams.filter((t) => t.status === "Excellent").length,
    onTrackTeams: teams.filter((t) => t.status === "On Track").length,
    needsAttentionTeams: teams.filter((t) => t.status === "Needs Attention").length,
  }

  return (
    <DashboardLayout userRole="mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
            <p className="text-gray-600">Guide and mentor your assigned hackathon teams</p>
          </div>
          <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message to Team</DialogTitle>
                <DialogDescription>Send guidance or updates to your team</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Team</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSendMessage(1)}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-gray-600 mt-1">Teams under guidance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Excellent Progress</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.excellentTeams}</div>
              <p className="text-xs text-gray-600 mt-1">Teams performing excellently</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">On Track</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.onTrackTeams}</div>
              <p className="text-xs text-gray-600 mt-1">Teams progressing well</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Need Attention</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.needsAttentionTeams}</div>
              <p className="text-xs text-gray-600 mt-1">Teams requiring support</p>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <CardDescription className="mt-1">{team.hackathon}</CardDescription>
                    <p className="text-sm font-medium text-gray-900 mt-2">{team.projectTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(team.status)}>{team.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(team)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Team Members */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Members ({team.members.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Project Progress</span>
                      <span>{team.progress}%</span>
                    </div>
                    <Progress value={team.progress} className="h-2" />
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Last Update:</span>
                      <p className="font-medium">{team.lastUpdate}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Next Meeting:</span>
                      <p className="font-medium">{team.nextMeeting}</p>
                    </div>
                  </div>

                  {/* Unread Messages */}
                  {team.recentMessages.some((msg) => msg.unread) && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">New Messages</span>
                      </div>
                      {team.recentMessages
                        .filter((msg) => msg.unread)
                        .map((message, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{message.sender}:</span> {message.message}
                            <span className="text-gray-500 ml-2">({message.time})</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message Team
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule Meeting
                    </Button>
                    <Button variant="outline" size="sm">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Provide Feedback
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Details Modal */}
        {selectedTeam && (
          <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTeam.name}
                  <Badge className={getStatusColor(selectedTeam.status)}>{selectedTeam.status}</Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedTeam.hackathon} • {selectedTeam.projectTitle}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Project Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Progress:</span>
                          <span className="font-medium">{selectedTeam.progress}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusColor(selectedTeam.status)}>{selectedTeam.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Update:</span>
                          <span>{selectedTeam.lastUpdate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Meeting:</span>
                          <span>{selectedTeam.nextMeeting}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Team Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-green-700 mb-1">Strengths</h5>
                            <ul className="text-sm space-y-1">
                              {selectedTeam.strengths.map((strength: string, index: number) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-red-700 mb-1">Challenges</h5>
                            <ul className="text-sm space-y-1">
                              {selectedTeam.challenges.map((challenge: string, index: number) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                  {challenge}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="members">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedTeam.members.map((member: any) => (
                          <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {member.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-600">{member.role}</p>
                                <p className="text-sm text-gray-500">{member.email}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {member.skills.map((skill: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="progress">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedTeam.milestones.map((milestone: any, index: number) => (
                          <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div
                              className={`w-4 h-4 rounded-full ${milestone.completed ? "bg-green-500" : "bg-gray-300"}`}
                            />
                            <div className="flex-1">
                              <p className={`font-medium ${milestone.completed ? "text-green-700" : "text-gray-700"}`}>
                                {milestone.title}
                              </p>
                              <p className="text-sm text-gray-500">Due: {milestone.dueDate}</p>
                            </div>
                            {milestone.completed && (
                              <Badge variant="outline" className="text-green-700 border-green-300">
                                Completed
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="messages">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedTeam.recentMessages.map((message: any, index: number) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg ${message.unread ? "bg-blue-50 border-blue-200" : ""}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{message.sender}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{message.time}</span>
                                {message.unread && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{message.message}</p>
                          </div>
                        ))}
                        <div className="pt-4 border-t">
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Type your response..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              rows={3}
                            />
                            <Button onClick={() => handleSendMessage(selectedTeam.id)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="feedback">
                  <Card>
                    <CardHeader>
                      <CardTitle>Provide Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Feedback Type</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select feedback type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="progress">Progress Update</SelectItem>
                              <SelectItem value="technical">Technical Guidance</SelectItem>
                              <SelectItem value="general">General Feedback</SelectItem>
                              <SelectItem value="improvement">Areas for Improvement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Feedback</label>
                          <Textarea
                            placeholder="Provide detailed feedback for the team..."
                            value={newFeedback}
                            onChange={(e) => setNewFeedback(e.target.value)}
                            rows={5}
                          />
                        </div>
                        <Button onClick={() => handleProvideFeedback(selectedTeam.id)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Submit Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
