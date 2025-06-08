"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Users, Search, Filter, Eye, Mail, Phone, GraduationCap, Trophy, Calendar, DollarSign } from "lucide-react"

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@university.edu",
      studentId: "CS2021001",
      department: "Computer Science",
      year: "3rd Year",
      phone: "+1 (555) 123-4567",
      avatar: "/placeholder.svg?height=40&width=40",
      hackathonsParticipated: 5,
      hackathonsWon: 2,
      totalPayments: 285,
      pendingPayments: 0,
      currentTeam: "Code Crushers",
      currentHackathon: "AI Innovation Challenge 2024",
      skills: ["Python", "Machine Learning", "React", "Node.js"],
      achievements: ["2nd Place - AI Challenge", "Best Innovation Award"],
      registrationDate: "2024-01-05",
      lastActive: "2024-01-15",
      paymentStatus: "Paid",
      progressScore: 85,
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike.chen@university.edu",
      studentId: "CS2022015",
      department: "Computer Science",
      year: "2nd Year",
      phone: "+1 (555) 234-5678",
      avatar: "/placeholder.svg?height=40&width=40",
      hackathonsParticipated: 3,
      hackathonsWon: 1,
      totalPayments: 185,
      pendingPayments: 75,
      currentTeam: "Blockchain Builders",
      currentHackathon: "Web3 Developer Summit",
      skills: ["JavaScript", "Solidity", "React", "Web3"],
      achievements: ["3rd Place - Blockchain Hackathon"],
      registrationDate: "2024-01-08",
      lastActive: "2024-01-14",
      paymentStatus: "Pending",
      progressScore: 72,
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@university.edu",
      studentId: "IT2021045",
      department: "Information Technology",
      year: "3rd Year",
      phone: "+1 (555) 345-6789",
      avatar: "/placeholder.svg?height=40&width=40",
      hackathonsParticipated: 4,
      hackathonsWon: 1,
      totalPayments: 240,
      pendingPayments: 0,
      currentTeam: "Mobile Masters",
      currentHackathon: "Mobile App Hackathon",
      skills: ["React Native", "Flutter", "UI/UX", "Firebase"],
      achievements: ["Best UI/UX Design", "People's Choice Award"],
      registrationDate: "2024-01-03",
      lastActive: "2024-01-16",
      paymentStatus: "Paid",
      progressScore: 91,
    },
    {
      id: 4,
      name: "Alex Kumar",
      email: "alex.kumar@university.edu",
      studentId: "ECE2022032",
      department: "Electronics & Communication",
      year: "2nd Year",
      phone: "+1 (555) 456-7890",
      avatar: "/placeholder.svg?height=40&width=40",
      hackathonsParticipated: 2,
      hackathonsWon: 0,
      totalPayments: 110,
      pendingPayments: 60,
      currentTeam: "IoT Innovators",
      currentHackathon: "IoT Solutions Challenge",
      skills: ["Arduino", "Raspberry Pi", "C++", "IoT"],
      achievements: ["Best Hardware Implementation"],
      registrationDate: "2024-01-12",
      lastActive: "2024-01-15",
      paymentStatus: "Partial",
      progressScore: 68,
    },
  ])

  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || student.department === departmentFilter
    const matchesYear = yearFilter === "all" || student.year === yearFilter
    const matchesPayment = paymentFilter === "all" || student.paymentStatus === paymentFilter

    return matchesSearch && matchesDepartment && matchesYear && matchesPayment
  })

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-red-100 text-red-800"
      case "Partial":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.currentHackathon).length,
    paidStudents: students.filter((s) => s.paymentStatus === "Paid").length,
    pendingPayments: students.filter((s) => s.paymentStatus === "Pending" || s.paymentStatus === "Partial").length,
  }

  return (
    <DashboardLayout userRole="faculty">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600">Monitor student registrations, payments, and progress</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-gray-600 mt-1">Registered students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Participants</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeStudents}</div>
              <p className="text-xs text-gray-600 mt-1">Currently participating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Payment Complete</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.paidStudents}</div>
              <p className="text-xs text-gray-600 mt-1">Fully paid students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pendingPayments}</div>
              <p className="text-xs text-gray-600 mt-1">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Electronics & Communication">Electronics & Communication</SelectItem>
                  <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-gray-600">
                        {student.studentId} • {student.department}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{student.year}</span>
                        <span>•</span>
                        <span>{student.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{student.hackathonsParticipated}</p>
                      <p className="text-xs text-gray-600">Hackathons</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{student.hackathonsWon}</p>
                      <p className="text-xs text-gray-600">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">${student.totalPayments}</p>
                      <p className="text-xs text-gray-600">Total Paid</p>
                    </div>
                    <div className="text-center">
                      <Badge className={getPaymentStatusColor(student.paymentStatus)}>{student.paymentStatus}</Badge>
                      {student.pendingPayments > 0 && (
                        <p className="text-xs text-red-600 mt-1">${student.pendingPayments} pending</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {student.currentHackathon && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Current Participation</span>
                      <span className="text-sm text-gray-600">{student.progressScore}% progress</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>{student.currentHackathon}</strong> • Team: {student.currentTeam}
                    </p>
                    <Progress value={student.progressScore} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No students found matching your criteria.</p>
            </CardContent>
          </Card>
        )}

        {/* Student Details Modal */}
        {selectedStudent && (
          <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedStudent.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedStudent.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {selectedStudent.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedStudent.studentId} • {selectedStudent.department} • {selectedStudent.year}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedStudent.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedStudent.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {selectedStudent.department} - {selectedStudent.year}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Activity Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration Date:</span>
                          <span>{selectedStudent.registrationDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Active:</span>
                          <span>{selectedStudent.lastActive}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Progress Score:</span>
                          <span className="font-medium">{selectedStudent.progressScore}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {selectedStudent.currentHackathon && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Current Participation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hackathon:</span>
                            <span className="font-medium">{selectedStudent.currentHackathon}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Team:</span>
                            <span className="font-medium">{selectedStudent.currentTeam}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Progress:</span>
                            <span className="font-medium">{selectedStudent.progressScore}%</span>
                          </div>
                          <Progress value={selectedStudent.progressScore} className="h-2 mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="hackathons">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hackathon History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{selectedStudent.hackathonsParticipated}</p>
                            <p className="text-sm text-gray-600">Total Participated</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{selectedStudent.hackathonsWon}</p>
                            <p className="text-sm text-gray-600">Hackathons Won</p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">
                              {Math.round(
                                (selectedStudent.hackathonsWon / selectedStudent.hackathonsParticipated) * 100,
                              )}
                              %
                            </p>
                            <p className="text-sm text-gray-600">Success Rate</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">${selectedStudent.totalPayments}</p>
                            <p className="text-sm text-gray-600">Total Payments Made</p>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">${selectedStudent.pendingPayments}</p>
                            <p className="text-sm text-gray-600">Pending Payments</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment Status:</span>
                          <Badge className={getPaymentStatusColor(selectedStudent.paymentStatus)}>
                            {selectedStudent.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="achievements">
                  <Card>
                    <CardHeader>
                      <CardTitle>Achievements & Awards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedStudent.achievements.map((achievement: string, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <span className="font-medium">{achievement}</span>
                          </div>
                        ))}
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
