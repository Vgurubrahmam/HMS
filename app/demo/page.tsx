"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Calendar,
  Trophy,
  DollarSign,
  BookOpen,
  Target,
  TrendingUp,
  Star,
  ArrowLeft,
  Play,
  Pause,
  BarChart3,
  Download,
  MessageSquare,
  Video,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

// Mock Data
const mockHackathons = [
  {
    id: "1",
    title: "AI Innovation Challenge 2024",
    description: "Build the next generation of AI applications",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    registrationFee: 500,
    maxTeams: 50,
    status: "active",
    registeredTeams: 42,
    technologies: ["AI/ML", "Python", "TensorFlow"],
    prizes: ["₹50,000", "₹30,000", "₹20,000"],
  },
  {
    id: "2",
    title: "Web3 Developer Summit",
    description: "Decentralized applications and blockchain solutions",
    startDate: "2024-04-20",
    endDate: "2024-04-22",
    registrationFee: 750,
    maxTeams: 30,
    status: "upcoming",
    registeredTeams: 18,
    technologies: ["Blockchain", "Solidity", "React"],
    prizes: ["₹75,000", "₹45,000", "₹30,000"],
  },
  {
    id: "3",
    title: "Mobile App Hackathon",
    description: "Create innovative mobile solutions",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    registrationFee: 400,
    maxTeams: 40,
    status: "completed",
    registeredTeams: 35,
    technologies: ["React Native", "Flutter", "Swift"],
    prizes: ["₹40,000", "₹25,000", "₹15,000"],
  },
]

const mockTeams = [
  {
    id: "1",
    name: "Code Crusaders",
    hackathonId: "1",
    hackathonTitle: "AI Innovation Challenge 2024",
    members: ["Alice Johnson", "Bob Smith", "Carol Davis"],
    mentor: "Dr. Sarah Wilson",
    progress: 75,
    status: "active",
    room: "Lab A-101",
    lastUpdate: "2 hours ago",
  },
  {
    id: "2",
    name: "Tech Titans",
    hackathonId: "1",
    hackathonTitle: "AI Innovation Challenge 2024",
    members: ["David Brown", "Eva Martinez", "Frank Wilson"],
    mentor: "Prof. Michael Chen",
    progress: 60,
    status: "active",
    room: "Lab A-102",
    lastUpdate: "1 hour ago",
  },
  {
    id: "3",
    name: "Innovation Squad",
    hackathonId: "2",
    hackathonTitle: "Web3 Developer Summit",
    members: ["Grace Lee", "Henry Taylor", "Ivy Chen"],
    mentor: "Dr. Sarah Wilson",
    progress: 30,
    status: "planning",
    room: "Lab B-201",
    lastUpdate: "30 minutes ago",
  },
]

const mockStudents = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@university.edu",
    department: "Computer Science",
    year: "3rd Year",
    hackathonsParticipated: 5,
    certificatesEarned: 3,
    paymentStatus: "paid",
    totalPaid: 2100,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@university.edu",
    department: "Information Technology",
    year: "2nd Year",
    hackathonsParticipated: 3,
    certificatesEarned: 2,
    paymentStatus: "pending",
    totalPaid: 900,
  },
]

const mockPayments = [
  {
    id: "1",
    studentName: "Alice Johnson",
    hackathonTitle: "AI Innovation Challenge 2024",
    amount: 500,
    status: "completed",
    date: "2024-03-01",
    method: "PayPal",
  },
  {
    id: "2",
    studentName: "Bob Smith",
    hackathonTitle: "Web3 Developer Summit",
    amount: 750,
    status: "pending",
    date: "2024-03-05",
    method: "Credit Card",
  },
]

export default function DemoPage() {
  const [selectedRole, setSelectedRole] = useState<"coordinator" | "faculty" | "student" | "mentor">("coordinator")
  const [isPlaying, setIsPlaying] = useState(false)

  const roles = [
    { id: "coordinator", label: "Coordinator", icon: Settings, color: "bg-blue-500" },
    { id: "faculty", label: "Faculty", icon: BookOpen, color: "bg-green-500" },
    { id: "student", label: "Student", icon: Users, color: "bg-purple-500" },
    { id: "mentor", label: "Mentor", icon: Target, color: "bg-orange-500" },
  ]

  const CoordinatorDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hackathons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95</div>
            <p className="text-xs text-muted-foreground">Across 3 events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹47,500</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5% improvement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Hackathons</CardTitle>
            <CardDescription>Currently running events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockHackathons
              .filter((h) => h.status === "active")
              .map((hackathon) => (
                <div key={hackathon.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{hackathon.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {hackathon.registeredTeams}/{hackathon.maxTeams} teams
                    </p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Progress</CardTitle>
            <CardDescription>Real-time team status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockTeams.slice(0, 3).map((team) => (
              <div key={team.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-sm text-muted-foreground">{team.progress}%</span>
                </div>
                <Progress value={team.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">Mentor: {team.mentor}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const FacultyDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">285</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹142,500</div>
            <p className="text-xs text-muted-foreground">92% collection rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Hackathons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 upcoming events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">Above average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Payment status and collection overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{payment.studentName}</h4>
                      <p className="text-sm text-muted-foreground">{payment.hackathonTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.date} • {payment.method}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">₹{payment.amount}</p>
                      <Badge variant={payment.status === "completed" ? "default" : "secondary"}>{payment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hackathons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hackathon Overview</CardTitle>
              <CardDescription>Event participation and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHackathons.map((hackathon) => (
                  <div key={hackathon.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{hackathon.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {hackathon.startDate} - {hackathon.endDate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {hackathon.registeredTeams} teams • ₹{hackathon.registrationFee} fee
                      </p>
                    </div>
                    <Badge
                      variant={
                        hackathon.status === "active"
                          ? "default"
                          : hackathon.status === "upcoming"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {hackathon.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Analytics</CardTitle>
                <CardDescription>Participation by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Computer Science</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} />
                  <div className="flex items-center justify-between">
                    <span>Information Technology</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <Progress value={30} />
                  <div className="flex items-center justify-between">
                    <span>Electronics</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly collection overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>January 2024</span>
                    <span className="font-medium">₹35,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>February 2024</span>
                    <span className="font-medium">₹42,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>March 2024</span>
                    <span className="font-medium">₹47,500</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  const StudentDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hackathons Joined</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 active, 3 completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">60% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,100</div>
            <p className="text-xs text-muted-foreground">All payments up to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#12</div>
            <p className="text-xs text-muted-foreground">Top 15% performer</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hackathons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hackathons">My Hackathons</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="hackathons" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockHackathons.map((hackathon) => (
              <Card key={hackathon.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{hackathon.title}</CardTitle>
                    <Badge
                      variant={
                        hackathon.status === "active"
                          ? "default"
                          : hackathon.status === "upcoming"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {hackathon.status}
                    </Badge>
                  </div>
                  <CardDescription>{hackathon.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Date:</strong> {hackathon.startDate} - {hackathon.endDate}
                    </p>
                    <p className="text-sm">
                      <strong>Fee:</strong> ₹{hackathon.registrationFee}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {hackathon.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    {hackathon.status === "active" && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm">75%</span>
                        </div>
                        <Progress value={75} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Mobile App Hackathon</CardTitle>
                <CardDescription>Completion Certificate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Issued:</strong> February 15, 2024
                  </p>
                  <p className="text-sm">
                    <strong>Team:</strong> Code Crusaders
                  </p>
                  <p className="text-sm">
                    <strong>Position:</strong> 2nd Place
                  </p>
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your hackathon payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPayments
                  .filter((p) => p.studentName === "Alice Johnson")
                  .map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{payment.hackathonTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          {payment.date} • {payment.method}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium">₹{payment.amount}</p>
                        <Badge variant="default">Completed</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  const MentorDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Across 2 hackathons</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Above average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentored</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Teams mentored</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">From team feedback</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hackathons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hackathons">My Hackathons</TabsTrigger>
          <TabsTrigger value="progress">Team Progress</TabsTrigger>
          <TabsTrigger value="history">Mentoring History</TabsTrigger>
        </TabsList>

        <TabsContent value="hackathons" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockHackathons
              .filter((h) => h.status === "active" || h.status === "upcoming")
              .map((hackathon) => (
                <Card key={hackathon.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{hackathon.title}</CardTitle>
                      <Badge variant={hackathon.status === "active" ? "default" : "secondary"}>
                        {hackathon.status}
                      </Badge>
                    </div>
                    <CardDescription>{hackathon.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Date:</strong> {hackathon.startDate} - {hackathon.endDate}
                      </p>
                      <p className="text-sm">
                        <strong>My Teams:</strong>{" "}
                        {
                          mockTeams.filter((t) => t.hackathonId === hackathon.id && t.mentor === "Dr. Sarah Wilson")
                            .length
                        }
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {hackathon.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="space-y-4">
            {mockTeams
              .filter((t) => t.mentor === "Dr. Sarah Wilson")
              .map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>{team.hackathonTitle}</CardDescription>
                      </div>
                      <Badge variant={team.status === "active" ? "default" : "secondary"}>{team.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm">{team.progress}%</span>
                        </div>
                        <Progress value={team.progress} />
                      </div>
                      <div>
                        <p className="text-sm">
                          <strong>Members:</strong> {team.members.join(", ")}
                        </p>
                        <p className="text-sm">
                          <strong>Room:</strong> {team.room}
                        </p>
                        <p className="text-sm">
                          <strong>Last Update:</strong> {team.lastUpdate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message Team
                        </Button>
                        <Button size="sm" variant="outline">
                          <Video className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mentoring Statistics</CardTitle>
              <CardDescription>Your mentoring performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">23</div>
                  <p className="text-sm text-muted-foreground">Teams Mentored</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">19</div>
                  <p className="text-sm text-muted-foreground">Successful Completions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">4.8</div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Mentoring Sessions</CardTitle>
              <CardDescription>Your latest team interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Code Crusaders - Progress Review</h4>
                    <p className="text-sm text-muted-foreground">AI Innovation Challenge 2024</p>
                    <p className="text-xs text-muted-foreground">March 10, 2024 • 1 hour session</p>
                  </div>
                  <Badge variant="default">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Innovation Squad - Technical Guidance</h4>
                    <p className="text-sm text-muted-foreground">Web3 Developer Summit</p>
                    <p className="text-xs text-muted-foreground">March 8, 2024 • 45 minutes session</p>
                  </div>
                  <Badge variant="default">Completed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  const renderRoleDemo = () => {
    switch (selectedRole) {
      case "coordinator":
        return <CoordinatorDemo />
      case "faculty":
        return <FacultyDemo />
      case "student":
        return <StudentDemo />
      case "mentor":
        return <MentorDemo />
      default:
        return <CoordinatorDemo />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  bg-black dark:bg-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between my-8">
          <div className="flex items-center gap-4">
            {/* <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button> */}
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold text-white dark:text-black">Interactive Demo</h1>
              <p className="text-muted-foreground">
                Explore the Hackathon Management System from different perspectives
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={isPlaying ? "default" : "outline"} size="sm" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isPlaying ? "Pause Demo" : "Start Demo"}
            </Button>
          </div>
        </div>

        {/* Role Selection */}
        <Card className="my-8">
          <CardHeader>
            <CardTitle>Choose Your Role</CardTitle>
            <CardDescription>Experience the platform from different user perspectives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <Button
                    key={role.id}
                    variant={selectedRole === role.id ? "default" : "outline"}
                    className="h-20 flex-col gap-2"
                    onClick={() => setSelectedRole(role.id as any)}
                  >
                    <div className={`p-2 rounded-lg ${selectedRole === role.id ? "bg-white/20" : role.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span>{role.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Demo Content */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">
              Live Demo - {roles.find((r) => r.id === selectedRole)?.label} Dashboard
            </span>
          </div>

          {renderRoleDemo()}
        </div>

        {/* Demo Features */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Demo Features</CardTitle>
            <CardDescription>What you can explore in this interactive demo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Real-time Analytics</span>
                </div>
                <p className="text-sm text-muted-foreground">Dynamic charts and statistics</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Team Management</span>
                </div>
                <p className="text-sm text-muted-foreground">Complete team lifecycle</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Payment Processing</span>
                </div>
                <p className="text-sm text-muted-foreground">Integrated payment system</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Certification</span>
                </div>
                <p className="text-sm text-muted-foreground">Automated certificate generation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
