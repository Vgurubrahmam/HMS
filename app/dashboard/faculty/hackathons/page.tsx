"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, MapPin, DollarSign, Search, Eye, BarChart3, TrendingUp, Award, Clock, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface HackathonData {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  registrationFee: number
  maxParticipants: number
  currentParticipants: number
  venue: string
  status: string
  difficulty: string
  categories: string[]
  prizes: string[]
  teamsFormed: number
  mentorAssigned: number
}

export default function FacultyHackathonsPage() {
  const [hackathons, setHackathons] = useState<HackathonData[]>([])
  const [filteredHackathons, setFilteredHackathons] = useState<HackathonData[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<HackathonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [stats, setStats] = useState({
    totalHackathons: 0,
    activeHackathons: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    avgParticipation: 0
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchHackathons()
  }, [])

  useEffect(() => {
    filterHackathons()
  }, [hackathons, searchTerm, statusFilter, difficultyFilter])

// get methods
 
    const fetchHackathons = async () => {
      try {
        const res = await fetch("/api/hackathons", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        })
        const data = await res.json()

        if (res.ok) {
          setHackathons(data.data)
          // toast({
          //   title: "Success",
          //   description: "Hackathons fetched successfully",
          // })
          calculateStats(data.data)
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.message || "Error feteching hackthons"
          })
        }

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Something went wrong while fetching hackathons"

        })
      } finally {
        setLoading(false)
      }
    }
    fetchHackathons()
  }, [])

  const calculateStats = (hackathonData: HackathonData[]) => {
    const totalHackathons = hackathonData.length
    const activeHackathons = hackathonData.filter(h => h.status === 'Active').length
    const totalParticipants = hackathonData.reduce((sum, h) => sum + h.currentParticipants, 0)
    const totalRevenue = hackathonData.reduce((sum, h) => sum + (h.registrationFee * h.currentParticipants), 0)
    const avgParticipation = totalHackathons > 0 ? Math.round(totalParticipants / totalHackathons) : 0

    setStats({
      totalHackathons,
      activeHackathons,
      totalParticipants,
      totalRevenue,
      avgParticipation
    })
  }

  const filterHackathons = () => {
    let filtered = hackathons

    if (searchTerm) {
      filtered = filtered.filter(hackathon =>
        hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.venue.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(hackathon => hackathon.status === statusFilter)
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(hackathon => hackathon.difficulty === difficultyFilter)
    }

    setFilteredHackathons(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Registration Open":
        return "bg-blue-100 text-blue-800"
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="faculty">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading hackathons...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Hackathon Overview</h1>
            <p className="text-gray-600">Monitor and analyze hackathon events and participation</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHackathons}</div>
              <p className="text-xs text-gray-600 mt-1">All hackathons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Events</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeHackathons}</div>
              <p className="text-xs text-gray-600 mt-1">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalParticipants}</div>
              <p className="text-xs text-gray-600 mt-1">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalRevenue}</div>
              <p className="text-xs text-gray-600 mt-1">Registration fees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Participation</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.avgParticipation}</div>
              <p className="text-xs text-gray-600 mt-1">Per event</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search hackathons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Registration Open">Registration Open</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchHackathons}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
              {filteredHackathons.map((hackathon) => (
                <Card key={hackathon._id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                        <CardDescription className="mt-2">{hackathon.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                        <Badge className={getDifficultyColor(hackathon.difficulty)}>{hackathon.difficulty}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedHackathon(hackathon)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {hackathon.venue}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        ${hackathon.registrationFee} registration
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {hackathon.currentParticipants}/{hackathon.maxParticipants} participants
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Registration Progress</span>
                          <span>{Math.round((hackathon.currentParticipants / hackathon.maxParticipants) * 100)}%</span>
                        </div>
                        <Progress value={(hackathon.currentParticipants / hackathon.maxParticipants) * 100} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {hackathon.categories?.map((category: string, index: number) => (
                          <Badge key={index} variant="outline">{category}</Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{hackathon.teamsFormed || 0}</p>
                          <p className="text-xs text-gray-600">Teams</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{hackathon.mentorAssigned || 0}</p>
                          <p className="text-xs text-gray-600">Mentors</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{hackathon.prizes?.length || 0}</p>
                          <p className="text-xs text-gray-600">Prizes</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">${hackathon.registrationFee * hackathon.currentParticipants}</p>
                          <p className="text-xs text-gray-600">Revenue</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hackathon Details</CardTitle>
                <CardDescription>Comprehensive information about all hackathon events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Event</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Participants</th>
                        <th className="text-left p-4">Revenue</th>
                        <th className="text-left p-4">Teams</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHackathons.map((hackathon) => (
                        <tr key={hackathon._id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{hackathon.title}</p>
                              <p className="text-sm text-gray-600">{hackathon.venue}</p>
                              <p className="text-xs text-gray-500">{new Date(hackathon.startDate).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-center">
                              <p className="font-bold">{hackathon.currentParticipants}</p>
                              <p className="text-xs text-gray-600">of {hackathon.maxParticipants}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-bold">${hackathon.registrationFee * hackathon.currentParticipants}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold">{hackathon.teamsFormed || 0}</p>
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedHackathon(hackathon)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Hackathon events by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Planning', 'Registration Open', 'Active', 'Completed'].map((status) => {
                      const count = filteredHackathons.filter(h => h.status === status).length
                      const percentage = filteredHackathons.length > 0 ? (count / filteredHackathons.length) * 100 : 0
                      
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{status}</span>
                            <span>{count} events ({Math.round(percentage)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Difficulty Distribution</CardTitle>
                  <CardDescription>Events by difficulty level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Beginner', 'Intermediate', 'Advanced'].map((difficulty) => {
                      const count = filteredHackathons.filter(h => h.difficulty === difficulty).length
                      const percentage = filteredHackathons.length > 0 ? (count / filteredHackathons.length) * 100 : 0
                      
                      return (
                        <div key={difficulty} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{difficulty}</span>
                            <Badge className={`ml-2 ${getDifficultyColor(difficulty)}`} variant="outline" >
                              {count}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{Math.round(percentage)}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hackathon Details Modal */}
        {selectedHackathon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{selectedHackathon.title}</CardTitle>
                    <CardDescription className="mt-2">{selectedHackathon.description}</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedHackathon(null)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Event Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusColor(selectedHackathon.status)}>{selectedHackathon.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Difficulty:</span>
                          <Badge className={getDifficultyColor(selectedHackathon.difficulty)}>{selectedHackathon.difficulty}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span>{new Date(selectedHackathon.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Date:</span>
                          <span>{new Date(selectedHackathon.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Venue:</span>
                          <span>{selectedHackathon.venue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration Fee:</span>
                          <span>${selectedHackathon.registrationFee}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Participation</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Registration Progress</span>
                            <span>{selectedHackathon.currentParticipants}/{selectedHackathon.maxParticipants}</span>
                          </div>
                          <Progress value={(selectedHackathon.currentParticipants / selectedHackathon.maxParticipants) * 100} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-blue-50 rounded-lg text-center">
                            <p className="text-xl font-bold text-blue-600">{selectedHackathon.teamsFormed || 0}</p>
                            <p className="text-xs text-gray-600">Teams Formed</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <p className="text-xl font-bold text-green-600">{selectedHackathon.mentorAssigned || 0}</p>
                            <p className="text-xs text-gray-600">Mentors</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedHackathon.categories?.map((category: string, index: number) => (
                          <Badge key={index} variant="outline">{category}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Prizes</h4>
                      <div className="space-y-2">
                        {selectedHackathon.prizes?.map((prize: string, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">
                              {index === 0 ? "🥇 1st Place" : index === 1 ? "🥈 2nd Place" : "🥉 3rd Place"}
                            </span>
                            <span className="text-sm font-bold">{prize}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Revenue Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-sm">Total Revenue</span>
                          <span className="text-lg font-bold text-green-600">
                            ${selectedHackathon.registrationFee * selectedHackathon.currentParticipants}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm">Potential Revenue</span>
                          <span className="text-lg font-bold text-blue-600">
                            ${selectedHackathon.registrationFee * selectedHackathon.maxParticipants}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
