"use client"
import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePayments } from "@/hooks/use-payments"
import { Search, Filter, RefreshCw, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function coordinatorPaymentPage(){
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [hackathonFilter, setHackathonFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const {
    payments,
    loading: paymentsLoading,
    error,
    pagination,
    refetch,
    updatePayment,
  } = usePayments({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: currentPage,
    limit: pageSize,
  })

  // Get unique hackathons for filter
  const uniqueHackathons = useMemo(() => {
    const hackathons = new Set()
    payments.forEach((payment: any) => {
      const hackathonTitle = typeof payment.hackathon === 'object' ? payment.hackathon.title : payment.hackathon
      if (hackathonTitle) hackathons.add(hackathonTitle)
    })
    return Array.from(hackathons)
  }, [payments])

  // Filter payments based on search term
  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments
    
    return payments.filter((payment: any) => {
      const hackathonTitle = typeof payment.hackathon === 'object' ? payment.hackathon.title : payment.hackathon
      const userName = typeof payment.user === 'object' ? payment.user.username : payment.user
      const userEmail = typeof payment.user === 'object' ? payment.user.email : ""
      
      return (
        hackathonTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [payments, searchTerm])

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0)
  const completedAmount = filteredPayments
    .filter((payment: any) => payment.status === "Completed")
    .reduce((sum: number, payment: any) => sum + payment.amount, 0)
  const pendingAmount = filteredPayments
    .filter((payment: any) => payment.status === "Pending")
    .reduce((sum: number, payment: any) => sum + payment.amount, 0)
  const failedAmount = filteredPayments
    .filter((payment: any) => payment.status === "Failed")
    .reduce((sum: number, payment: any) => sum + payment.amount, 0)

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      const result = await updatePayment(paymentId, { status: newStatus })
      if (result.success) {
        toast({
          title: "Success",
          description: `Payment status updated to ${newStatus}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"
      case "Failed":
        return "destructive"
      case "Pending":
        return "secondary"
      default:
        return "outline"
    }
  }


  if (error) {
    return (
      <DashboardLayout userRole="coordinator">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading payments: {error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="coordinator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all hackathon payments</p>
          </div>
          <Button onClick={refetch} variant="outline" disabled={paymentsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${paymentsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredPayments.length} payments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${completedAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredPayments.filter((p: any) => p.status === "Completed").length} payments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredPayments.filter((p: any) => p.status === "Pending").length} payments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${failedAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredPayments.filter((p: any) => p.status === "Failed").length} payments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search payments..."
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
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={hackathonFilter} onValueChange={setHackathonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by hackathon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hackathons</SelectItem>
                  {uniqueHackathons.map((hackathon) => (
                    <SelectItem key={hackathon as string} value={hackathon as string}>
                      {hackathon as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              Showing {filteredPayments.length} of {pagination.total} payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading payments...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Hackathon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment: any) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {typeof payment.user === 'object' ? payment.user.username : payment.user}
                          </div>
                          <div className="text-sm text-gray-500">
                            {typeof payment.user === 'object' ? payment.user.email : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {typeof payment.hackathon === 'object' ? payment.hackathon.title : payment.hackathon}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(payment.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.transactionId || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(payment._id, 'Completed')}
                            disabled={payment.status === 'Completed'}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(payment._id, 'Failed')}
                            disabled={payment.status === 'Failed'}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )


}  
