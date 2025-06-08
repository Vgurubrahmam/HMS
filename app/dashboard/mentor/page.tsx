import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, Trophy, MessageSquare, Clock, Star, BookOpen } from "lucide-react"

export default function MentorDashboard() {
  const stats = [
    {
      title: "Active Teams",
      value: "4",
      change: "+1 this month",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Hackathons Mentored",
      value: "12",
      change: "3 ongoing",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Success Rate",
      value: "85%",
      change: "Teams completing projects",
      icon: Trophy,
      color: "text-purple-600",
    },
    {
      title: "Avg. Rating",
      value: "4.8",
      change: "From student feedback",
      icon: Star,
      color: "text-orange-600",
    },
  ]

  const activeTeams = [
    {
      id: 1,
      name: "Code Crushers",
      hackathon: "AI Innovation Challenge 2024",
      members: 4,
      progress: 75,
      lastUpdate: "2 hours ago",
      status: "On Track",
    },
    {
      id: 2,
      name: "Blockchain Builders",
      hackathon: "Web3 Developer Summit",
      members: 5,
      progress: 45,
      lastUpdate: "1 day ago",
      status: "Needs Attention",
    },
    {
      id: 3,
      name: "Mobile Masters",
      hackathon: "Mobile App Hackathon",
      members: 3,
      progress: 90,
      lastUpdate: "30 minutes ago",
      status: "Excellent",
    },
  ]

  const upcomingMeetings = [
    {
      team: "Code Crushers",
      time: "Today, 3:00 PM",
      topic: "AI Model Integration Review",
      type: "Technical Review",
    },
    {
      team: "Blockchain Builders",
      time: "Tomorrow, 10:00 AM",
      topic: "Smart Contract Architecture",
      type: "Planning Session",
    },
    {
      team: "Mobile Masters",
      time: "Jan 20, 2:00 PM",
      topic: "Final Demo Preparation",
      type: "Demo Prep",
    },
  ]

  const recentMessages = [
    {
      team: "Code Crushers",
      member: "Sarah Johnson",
      message: "Need help with TensorFlow implementation",
      time: "1 hour ago",
      unread: true,
    },
    {
      team: "Mobile Masters",
      member: "Mike Chen",
      message: "Demo slides are ready for review",
      time: "3 hours ago",
      unread: false,
    },
    {
      team: "Blockchain Builders",
      member: "Alex Kumar",
      message: "Smart contract testing completed",
      time: "5 hours ago",
      unread: false,
    },
  ]

  return (
    <DashboardLayout userRole="mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
            <p className="text-gray-600">Guide your teams to hackathon success</p>
          </div>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Teams
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-600 mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Teams */}
          <Card>
            <CardHeader>
              <CardTitle>Active Teams</CardTitle>
              <CardDescription>Teams you're currently mentoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeTeams.map((team) => (
                  <div key={team.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{team.name}</h4>
                        <p className="text-sm text-gray-600">{team.hackathon}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3" />
                          {team.members} members • Last update: {team.lastUpdate}
                        </p>
                      </div>
                      <Badge
                        variant={
                          team.status === "Excellent"
                            ? "default"
                            : team.status === "On Track"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {team.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{team.progress}%</span>
                      </div>
                      <Progress value={team.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Scheduled mentoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{meeting.team}</h4>
                        <p className="text-sm text-gray-600">{meeting.topic}</p>
                      </div>
                      <Badge variant="outline">{meeting.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {meeting.time}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest communications from your teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${message.unread ? "bg-blue-50 border-blue-200" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>
                        {message.member
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-medium text-sm">{message.member}</p>
                          <p className="text-xs text-gray-500">{message.team}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{message.time}</span>
                          {message.unread && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common mentoring tools and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Team Progress
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <MessageSquare className="h-6 w-6 mb-2" />
                Send Message
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <BookOpen className="h-6 w-6 mb-2" />
                Resources
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Trophy className="h-6 w-6 mb-2" />
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
