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
import { DollarSign, TrendingUp, Users, Calendar, Search, Filter, Download, Eye, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface PaymentData {
  _id: string
  user: {
    name: string
    email: string
    department: string
    studentId: string
  }
  hackathon: {
    title: string
    registrationFee: number
  }
  amount: number
  paymentStatus: string
  paymentMethod: string
  transactionId: string
  createdAt: string
  updatedAt: string
}

export default function FacultyPaymentsPage() {
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidCount: 0,
    pendingCount: 0,
    collectionRate: 0
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter, departmentFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/registrations')
      const result = await response.json()

      if (result.success) {
        setPayments(result.data || [])
        calculateStats(result.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch payment data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (paymentData: PaymentData[]) => {
    const totalRevenue = paymentData
      .filter(p => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const pendingAmount = paymentData
      .filter(p => p.paymentStatus === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const paidCount = paymentData.filter(p => p.paymentStatus === 'Paid').length
    const pendingCount = paymentData.filter(p => p.paymentStatus === 'Pending').length
    const collectionRate = paymentData.length > 0 ? (paidCount / paymentData.length) * 100 : 0

    setStats({
      totalRevenue,
      pendingAmount,
      paidCount,
      pendingCount,
      collectionRate: Math.round(collectionRate)
    })
  }

  const filterPayments = () => {
    let filtered = payments

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.hackathon.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.paymentStatus === statusFilter)
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(payment => payment.user.department === departmentFilter)
    }

    setFilteredPayments(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const exportData = () => {
    toast({
      title: "Exporting Data",
      description: "Payment data is being exported to CSV..."
    })
    
    // Simulate export
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Payment data has been exported successfully."
      })
    }, 2000)
  }

  if (loading) {
    return (
      <DashboardLayout userRole="faculty">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading payment data...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600">Track and manage student payments and revenue</p>
          </div>
          <Button onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalRevenue}</div>
              <p className="text-xs text-gray-600 mt-1">{stats.paidCount} payments received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${stats.pendingAmount}</div>
              <p className="text-xs text-gray-600 mt-1">{stats.pendingCount} pending payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.collectionRate}%</div>
              <p className="text-xs text-gray-600 mt-1">Payment success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{payments.length}</div>
              <p className="text-xs text-gray-600 mt-1">Registered students</p>
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
                  placeholder="Search students..."
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
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Electronics & Communication">Electronics & Communication</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchPayments}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payment Details</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Collection Progress</CardTitle>
                  <CardDescription>Payment collection status overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Collection Rate</span>
                        <span>{stats.collectionRate}%</span>
                      </div>
                      <Progress value={stats.collectionRate} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.paidCount}</p>
                        <p className="text-sm text-gray-600">Paid</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Financial overview and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Collected Revenue</p>
                        <p className="text-sm text-gray-600">Successfully received</p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">${stats.totalRevenue}</p>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">Pending Revenue</p>
                        <p className="text-sm text-gray-600">Awaiting payment</p>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">${stats.pendingAmount}</p>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Total Expected</p>
                        <p className="text-sm text-gray-600">Complete collection</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">${stats.totalRevenue + stats.pendingAmount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>Detailed payment information for all students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Student</th>
                        <th className="text-left p-4">Hackathon</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr key={payment._id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{payment.user.name}</p>
                              <p className="text-sm text-gray-600">{payment.user.email}</p>
                              <p className="text-xs text-gray-500">{payment.user.department}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-medium">{payment.hackathon.title}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold">${payment.amount}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(payment.paymentStatus)}
                              <Badge className={getStatusColor(payment.paymentStatus)}>
                                {payment.paymentStatus}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{new Date(payment.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm">
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
                  <CardTitle>Department-wise Collection</CardTitle>
                  <CardDescription>Payment collection by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Computer Science', 'Electronics & Communication', 'Information Technology', 'Mechanical Engineering'].map((dept) => {
                      const deptPayments = filteredPayments.filter(p => p.user.department === dept)
                      const paidPayments = deptPayments.filter(p => p.paymentStatus === 'Paid')
                      const rate = deptPayments.length > 0 ? (paidPayments.length / deptPayments.length) * 100 : 0
                      
                      return (
                        <div key={dept} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{dept}</span>
                            <span>{paidPayments.length}/{deptPayments.length} ({Math.round(rate)}%)</span>
                          </div>
                          <Progress value={rate} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Distribution of payment methods used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['PayPal', 'Credit Card', 'Bank Transfer'].map((method) => {
                      const methodPayments = filteredPayments.filter(p => p.paymentMethod === method)
                      const percentage = filteredPayments.length > 0 ? (methodPayments.length / filteredPayments.length) * 100 : 0
                      
                      return (
                        <div key={method} className="flex justify-between items-center p-3 border rounded-lg">
                          <span className="font-medium">{method}</span>
                          <div className="text-right">
                            <p className="font-bold">{methodPayments.length}</p>
                            <p className="text-sm text-gray-600">{Math.round(percentage)}%</p>
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
      </div>
    </DashboardLayout>
  )
}
