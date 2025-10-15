"use client"

import { useState, useEffect } from "react"
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
import { Users, Search, Filter, Eye, Mail, Phone, GraduationCap, Trophy, Calendar, DollarSign, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Student {
  _id: string
  username: string
  email: string
  branch?: string
  year?: string
  image?: string
  registrations: Array<{
    hackathon: {
      _id: string
      title: string
      registrationFee: number
    }
    registrationDate: string
    paymentStatus: string
    payment?: {
      amount: number
      paymentDate: string
    }
  }>
  totalRegistrations: number
  totalPaid: number
  totalPending: number
  hackathonsCompleted: number
  averagePerformance: number
}

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, departmentFilter, yearFilter, paymentFilter])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/students/history")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch student data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch student data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(student => student.branch === departmentFilter)
    }

    // Year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter(student => student.year === yearFilter)
    }

    // Payment filter
    if (paymentFilter !== "all") {
      if (paymentFilter === "paid") {
        filtered = filtered.filter(student => student.totalPending === 0 && student.totalPaid > 0)
      } else if (paymentFilter === "pending") {
        filtered = filtered.filter(student => student.totalPending > 0)
      } else if (paymentFilter === "none") {
        filtered = filtered.filter(student => student.totalPaid === 0)
      }
    }

    setFilteredStudents(filtered)
  }

  const getPaymentStatus = (student: Student) => {
    if (student.totalPending === 0 && student.totalPaid > 0) return "Paid"
    if (student.totalPending > 0 && student.totalPaid > 0) return "Partial"
    if (student.totalPending > 0 && student.totalPaid === 0) return "Pending"
    return "None"
  }

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

  const exportStudentData = () => {
    const csvData = filteredStudents.map(student => ({
      'Name': student.username,
      'Email': student.email,
      'Branch': student.branch || 'N/A',
      'Year': student.year || 'N/A',
      'Total Registrations': student.totalRegistrations,
      'Total Paid': student.totalPaid,
      'Total Pending': student.totalPending,
      'Hackathons Completed': student.hackathonsCompleted,
      'Average Performance': student.averagePerformance,
      'Payment Status': getPaymentStatus(student)
    }))

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `faculty-students-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.totalRegistrations > 0).length,
    paidStudents: students.filter(s => getPaymentStatus(s) === "Paid").length,
    pendingPayments: students.filter(s => s.totalPending > 0).length,
  }

  const departments = Array.from(new Set(students.map(s => s.branch).filter(Boolean)))
  const years = Array.from(new Set(students.map(s => s.year).filter(Boolean)))

  if (loading) {
    return (
      <DashboardLayout userRole="faculty">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </DashboardLayout>
    )
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
          <Button onClick={exportStudentData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
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
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="none">No Payment</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setDepartmentFilter("all")
                  setYearFilter("all")
                  setPaymentFilter("all")
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div className="grid gap-4">
          {filteredStudents.map((student) => {
            const paymentStatus = getPaymentStatus(student)
            return (
              <Card key={student._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.image || "/placeholder.svg"} />
                        <AvatarFallback>
                          {student.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{student.username}</h3>
                        <p className="text-gray-600">
                          {student.branch || 'N/A'} • {student.year || 'N/A'}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{student.totalRegistrations}</p>
                        <p className="text-xs text-gray-600">Registrations</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{student.hackathonsCompleted}</p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">${student.totalPaid}</p>
                        <p className="text-xs text-gray-600">Total Paid</p>
                      </div>
                      <div className="text-center">
                        <Badge className={getPaymentStatusColor(paymentStatus)}>{paymentStatus}</Badge>
                        {student.totalPending > 0 && (
                          <p className="text-xs text-red-600 mt-1">${student.totalPending} pending</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {student.averagePerformance > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Performance Score</span>
                        <span className="text-sm text-gray-600">{student.averagePerformance}%</span>
                      </div>
                      <Progress value={student.averagePerformance} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
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
                    <AvatarImage src={selectedStudent.image || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedStudent.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedStudent.username}
                </DialogTitle>
                <DialogDescription>
                  {selectedStudent.branch} • {selectedStudent.year}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
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
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {selectedStudent.branch} - {selectedStudent.year}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Registrations:</span>
                          <span className="font-medium">{selectedStudent.totalRegistrations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed:</span>
                          <span className="font-medium">{selectedStudent.hackathonsCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Performance Score:</span>
                          <span className="font-medium">{selectedStudent.averagePerformance}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="hackathons">
                  <Card>
                    <CardHeader>
                      <CardTitle>Registration History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedStudent.registrations.map((reg, index) => (
                          <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{reg.hackathon.title}</p>
                              <p className="text-sm text-gray-600">
                                Registered: {new Date(reg.registrationDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${reg.hackathon.registrationFee}</p>
                              <Badge className={getPaymentStatusColor(reg.paymentStatus)}>
                                {reg.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">${selectedStudent.totalPaid}</p>
                            <p className="text-sm text-gray-600">Total Payments Made</p>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">${selectedStudent.totalPending}</p>
                            <p className="text-sm text-gray-600">Pending Payments</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment Status:</span>
                          <Badge className={getPaymentStatusColor(getPaymentStatus(selectedStudent))}>
                            {getPaymentStatus(selectedStudent)}
                          </Badge>
                        </div>
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
