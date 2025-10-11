"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, Download, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePayments } from "@/hooks/use-payments"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function StudentPaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("")
  const { toast } = useToast()
  const { userData, loading: userLoading } = useCurrentUser()
  const currentUserId = userData?.id

  const {
    payments,
    loading: paymentsLoading,
    updatePayment,
  } = usePayments({
    user: currentUserId,
  })

  // Separate payments by status
  const completedPayments = payments.filter((payment: any) => payment.status === "Completed")
  const pendingPayments = payments.filter((payment: any) => payment.status === "Pending")
  const failedPayments = payments.filter((payment: any) => payment.status === "Failed")

  // Calculate totals
  const totalPaid = completedPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0)
  const totalPending = pendingPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0)
  const thisMonthPayments = completedPayments.filter((payment: any) => {
    const paymentDate = new Date(payment.paymentDate || payment.createdAt)
    const now = new Date()
    return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonthPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0)

  const handlePayment = async (paymentId: string) => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      })
      return
    }

    // Simulate PayPal payment process
    toast({
      title: "Redirecting to PayPal",
      description: "You will be redirected to PayPal to complete your payment.",
    })

    // In a real app, this would redirect to PayPal
    setTimeout(async () => {
      try {
        // Update payment status to completed
        const result = await updatePayment(paymentId, {
          status: "Completed",
          transactionId: `TXN${Date.now()}`,
        })

        if (result.success) {
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully.",
          })
          setSelectedPayment(null)
        } else {
          toast({
            title: "Payment Failed",
            description: "Failed to update payment status.",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Payment Failed",
          description: "An error occurred while processing your payment.",
          variant: "destructive",
        })
      }
    }, 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // get method for pending payments already registred


  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Manage your hackathon payments and view transaction history</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalPaid}</div>
              <p className="text-xs text-gray-600 mt-1">Across {completedPayments.length} hackathons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${totalPending}</div>
              <p className="text-xs text-gray-600 mt-1">{pendingPayments.length} payments due</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${thisMonthTotal}</div>
              <p className="text-xs text-gray-600 mt-1">{thisMonthPayments.length} transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription>Complete these payments to secure your hackathon registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.map((payment: any) => (
                <div key={payment._id} className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">
                        {typeof payment.hackathon === 'object' ? payment.hackathon.title : payment.hackathon}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${payment.amount}</p>
                      <Button onClick={() => setSelectedPayment(payment._id)} className="mt-2">
                        Pay Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingPayments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No pending payments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View all your past transactions and download receipts</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search payments..." className="pl-8 w-64" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...completedPayments, ...failedPayments].map((payment: any) => (
                <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {typeof payment.hackathon === 'object' ? payment.hackathon.title : payment.hackathon}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{payment.paymentMethod}</span>
                        {payment.transactionId && (
                          <>
                            <span>•</span>
                            <span>{payment.transactionId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">${payment.amount}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getStatusIcon(payment.status)}
                        <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {completedPayments.length === 0 && failedPayments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No payment history</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Complete Payment</CardTitle>
                <CardDescription>Choose your payment method to proceed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Amount to Pay:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${pendingPayments.find((p: any) => p._id === selectedPayment)?.amount}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                            PP
                          </div>
                          PayPal
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "paypal" && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-6 bg-blue-600 rounded text-white text-sm flex items-center justify-center font-bold">
                        PP
                      </div>
                      <span className="font-medium">PayPal Payment</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedPayment(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={() => handlePayment(selectedPayment)} className="flex-1" disabled={!paymentMethod}>
                    Pay Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
