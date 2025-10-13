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
  Eye, 
  Search, 
  Filter, 
  Download, 
  CreditCard, 
  Users, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Registration {
  _id: string
  user: {
    _id: string
    username: string
    email: string
    image?: string
    branch?: string
    year?: string
  }
  hackathon: {
    _id: string
    title: string
    registrationFee: number
  }
  registrationDate: string
  paymentStatus: "Pending" | "Completed" | "Failed" | "Refunded"
  payment?: {
    _id: string
    amount: number
    method: string
    transactionId: string
    status: string
    paymentDate: string
  }
  status: string
}

export function RegistrationPaymentMonitor() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [hackathons, setHackathons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [hackathonFilter, setHackathonFilter] = useState("all")
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    completedPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchRegistrations()
    fetchHackathons()
  }, [])

  useEffect(() => {
    filterRegistrations()
    calculateStats()
  }, [registrations, searchTerm, statusFilter, hackathonFilter])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/registrations")
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchHackathons = async () => {
    try {
      const response = await fetch("/api/hackathons")
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch hackathons:", error)
    }
  }

  const filterRegistrations = () => {
    let filtered = registrations

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.hackathon.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(reg => reg.paymentStatus === statusFilter)
    }

    // Hackathon filter
    if (hackathonFilter !== "all") {
      filtered = filtered.filter(reg => reg.hackathon._id === hackathonFilter)
    }

    setFilteredRegistrations(filtered)
  }

  const calculateStats = () => {
    const totalRegistrations = registrations.length
    const completedPayments = registrations.filter(reg => reg.paymentStatus === "Completed").length
    const pendingPayments = registrations.filter(reg => reg.paymentStatus === "Pending").length
    const totalRevenue = registrations
      .filter(reg => reg.paymentStatus === "Completed")
      .reduce((sum, reg) => sum + (reg.payment?.amount || reg.hackathon.registrationFee), 0)

    setStats({
      totalRegistrations,
      completedPayments,
      pendingPayments,
      totalRevenue
    })
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      case "Failed": return "bg-red-100 text-red-800"
      case "Refunded": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="h-4 w-4" />
      case "Pending": return <Clock className="h-4 w-4" />
      case "Failed": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const exportData = () => {
    const csvData = filteredRegistrations.map(reg => ({
      'Student Name': reg.user.username,
      'Email': reg.user.email,
      'Branch': reg.user.branch || 'N/A',
      'Year': reg.user.year || 'N/A',
      'Hackathon': reg.hackathon.title,
      'Registration Date': new Date(reg.registrationDate).toLocaleDateString(),
      'Payment Status': reg.paymentStatus,
      'Amount': reg.payment?.amount || reg.hackathon.registrationFee,
      'Payment Method': reg.payment?.method || 'N/A',
      'Transaction ID': reg.payment?.transactionId || 'N/A'
    }))

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Registration & Payment Monitor</h2>
          <p className="text-gray-600">Monitor student registrations and payment status</p>
        </div>
        <Button onClick={exportData}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Payments</p>
                <p className="text-2xl font-bold">{stats.completedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students or hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={hackathonFilter} onValueChange={setHackathonFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Hackathon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hackathons</SelectItem>
                {hackathons.map((hackathon) => (
                  <SelectItem key={hackathon._id} value={hackathon._id}>
                    {hackathon.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setHackathonFilter("all")
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations ({filteredRegistrations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRegistrations.map((registration) => (
              <div key={registration._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={registration.user.image} />
                      <AvatarFallback>
                        {registration.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{registration.user.username}</h3>
                        <Badge className={getPaymentStatusColor(registration.paymentStatus)}>
                          {getPaymentIcon(registration.paymentStatus)}
                          <span className="ml-1">{registration.paymentStatus}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">{registration.user.email}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {registration.user.branch && (
                          <span>Branch: {registration.user.branch}</span>
                        )}
                        {registration.user.year && (
                          <span>Year: {registration.user.year}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      ${registration.payment?.amount || registration.hackathon.registrationFee}
                    </div>
                    <div className="text-sm text-gray-600">
                      {registration.hackathon.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Registered: {new Date(registration.registrationDate).toLocaleDateString()}
                    </div>
                    {registration.payment?.paymentDate && (
                      <div className="text-xs text-gray-500">
                        Paid: {new Date(registration.payment.paymentDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {registration.payment && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Method:</span>
                        <span className="ml-1 font-medium">{registration.payment.method}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="ml-1 font-mono text-xs">{registration.payment.transactionId}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Payment Status:</span>
                        <span className="ml-1 font-medium">{registration.payment.status}</span>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No registrations found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}