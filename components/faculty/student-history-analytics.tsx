"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Filter, 
  Download, 
  Trophy, 
  Calendar, 
  Users,
  BarChart3,
  TrendingUp,
  Award,
  GraduationCap,
  Code,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StudentHistory {
  _id: string
  username: string
  email: string
  image?: string
  branch: string
  year: string
  rollNumber: string
  registrations: Array<{
    hackathon: {
      _id: string
      title: string
      startDate: string
      endDate: string
      difficulty: string
    }
    registrationDate: string
    paymentStatus: string
    team?: {
      name: string
      position?: number
      points?: number
    }
    certificates?: Array<{
      type: string
      issuedDate: string
      certificateUrl: string
    }>
  }>
  totalHackathons: number
  completedHackathons: number
  totalCertificates: number
  averagePerformance: number
  skillsGained: string[]
}

interface DepartmentStats {
  department: string
  totalStudents: number
  activeStudents: number
  totalRegistrations: number
  averageParticipation: number
}

export function StudentHistoryAnalytics() {
  const [students, setStudents] = useState<StudentHistory[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentHistory[]>([])
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [branchFilter, setBranchFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [performanceFilter, setPerformanceFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<StudentHistory | null>(null)
  
  const { toast } = useToast()

  const [overallStats, setOverallStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalRegistrations: 0,
    averageHackathonsPerStudent: 0,
    topPerformers: [] as StudentHistory[]
  })

  useEffect(() => {
    fetchStudentHistories()
    fetchDepartmentStats()
  }, [])

  useEffect(() => {
    filterStudents()
    calculateOverallStats()
  }, [students, searchTerm, branchFilter, yearFilter, performanceFilter])

  const fetchStudentHistories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/students/history")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch student histories",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch student histories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartmentStats = async () => {
    try {
      const response = await fetch("/api/analytics/departments")
      if (response.ok) {
        const data = await response.json()
        setDepartmentStats(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch department stats:", error)
    }
  }

  const filterStudents = () => {
    let filtered = students

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Branch filter
    if (branchFilter !== "all") {
      filtered = filtered.filter(student => student.branch === branchFilter)
    }

    // Year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter(student => student.year === yearFilter)
    }

    // Performance filter
    if (performanceFilter !== "all") {
      if (performanceFilter === "high") {
        filtered = filtered.filter(student => student.averagePerformance >= 80)
      } else if (performanceFilter === "medium") {
        filtered = filtered.filter(student => student.averagePerformance >= 60 && student.averagePerformance < 80)
      } else if (performanceFilter === "low") {
        filtered = filtered.filter(student => student.averagePerformance < 60)
      }
    }

    setFilteredStudents(filtered)
  }

  const calculateOverallStats = () => {
    const totalStudents = students.length
    const activeStudents = students.filter(s => s.totalHackathons > 0).length
    const totalRegistrations = students.reduce((sum, s) => sum + s.totalHackathons, 0)
    const averageHackathonsPerStudent = totalStudents > 0 ? totalRegistrations / totalStudents : 0
    const topPerformers = [...students]
      .sort((a, b) => b.averagePerformance - a.averagePerformance)
      .slice(0, 5)

    setOverallStats({
      totalStudents,
      activeStudents,
      totalRegistrations,
      averageHackathonsPerStudent,
      topPerformers
    })
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getPerformanceText = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 60) return "Medium"
    return "Low"
  }

  const exportStudentData = () => {
    const csvData = filteredStudents.map(student => ({
      'Name': student.username,
      'Email': student.email,
      'Roll Number': student.rollNumber,
      'Branch': student.branch,
      'Year': student.year,
      'Total Hackathons': student.totalHackathons,
      'Completed Hackathons': student.completedHackathons,
      'Total Certificates': student.totalCertificates,
      'Average Performance': student.averagePerformance,
      'Skills Gained': student.skillsGained.join('; ')
    }))

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `student-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const branches = Array.from(new Set(students.map(s => s.branch)))
  const years = Array.from(new Set(students.map(s => s.year)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student History & Analytics</h2>
          <p className="text-gray-600">Comprehensive analytics of student participation and performance</p>
        </div>
        <Button onClick={exportStudentData}>
          <Download className="mr-2 h-4 w-4" />
          Export Analytics
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Histories</TabsTrigger>
          <TabsTrigger value="departments">Department Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold">{overallStats.totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Students</p>
                    <p className="text-2xl font-bold">{overallStats.activeStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Code className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                    <p className="text-2xl font-bold">{overallStats.totalRegistrations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Hackathons/Student</p>
                    <p className="text-2xl font-bold">{overallStats.averageHackathonsPerStudent.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overallStats.topPerformers.map((student, index) => (
                  <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.image} />
                        <AvatarFallback>{student.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{student.username}</p>
                        <p className="text-sm text-gray-600">{student.branch} - {student.year}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getPerformanceColor(student.averagePerformance)}>
                        {student.averagePerformance}% Performance
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {student.totalHackathons} Hackathons
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
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
                
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
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

                <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Performance</SelectItem>
                    <SelectItem value="high">High (80%+)</SelectItem>
                    <SelectItem value="medium">Medium (60-79%)</SelectItem>
                    <SelectItem value="low">Low (Below 60%)</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => {
                  setSearchTerm("")
                  setBranchFilter("all")
                  setYearFilter("all")
                  setPerformanceFilter("all")
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <Card key={student._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={student.image} />
                        <AvatarFallback className="text-lg">
                          {student.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">{student.username}</h3>
                          <Badge className={getPerformanceColor(student.averagePerformance)}>
                            {getPerformanceText(student.averagePerformance)} Performer
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600">{student.email}</p>
                        <p className="text-sm text-gray-500">
                          {student.rollNumber} • {student.branch} • {student.year}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Code className="h-4 w-4" />
                            {student.totalHackathons} Hackathons
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {student.totalCertificates} Certificates
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            {student.averagePerformance}% Avg. Performance
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {student.skillsGained.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-600 mb-2">Skills Gained:</p>
                      <div className="flex flex-wrap gap-2">
                        {student.skillsGained.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {student.skillsGained.length > 6 && (
                          <Badge variant="outline">
                            +{student.skillsGained.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments">
          <div className="grid gap-4">
            {departmentStats.map((dept, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{dept.department} Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold">{dept.totalStudents}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Students</p>
                      <p className="text-2xl font-bold text-green-600">{dept.activeStudents}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Registrations</p>
                      <p className="text-2xl font-bold text-blue-600">{dept.totalRegistrations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Participation Rate</p>
                      <p className="text-2xl font-bold text-purple-600">{dept.averageParticipation.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {students.filter(s => s.averagePerformance >= 80).length}
                  </div>
                  <p className="text-green-700 font-medium">High Performers (80%+)</p>
                </div>
                <div className="text-center p-6 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {students.filter(s => s.averagePerformance >= 60 && s.averagePerformance < 80).length}
                  </div>
                  <p className="text-yellow-700 font-medium">Medium Performers (60-79%)</p>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {students.filter(s => s.averagePerformance < 60).length}
                  </div>
                  <p className="text-red-700 font-medium">Low Performers (Below 60%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}