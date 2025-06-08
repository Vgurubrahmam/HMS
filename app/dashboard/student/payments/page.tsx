"use client"

import { useState } from "react"
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

export default function StudentPaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("")
  const { toast } = useToast()

  const paymentHistory = [
    {
      id: "PAY001",
      hackathon: "AI Innovation Challenge 2024",
      amount: 50,
      status: "Completed",
      date: "2024-01-15",
      method: "PayPal",
      transactionId: "TXN123456789",
    },
    {
      id: "PAY002",
      hackathon: "Web3 Developer Summit",
      amount: 75,
      status: "Completed",
      date: "2024-01-10",
      method: "PayPal",
      transactionId: "TXN987654321",
    },
    {
      id: "PAY003",
      hackathon: "Mobile App Hackathon",
      amount: 60,
      status: "Pending",
      date: "2024-01-20",
      method: "PayPal",
      transactionId: "TXN456789123",
    },
  ]

  const pendingPayments = [
    {
      id: "PEND001",
      hackathon: "Blockchain Innovation Challenge",
      amount: 80,
      dueDate: "2024-01-25",
      description: "Registration fee for blockchain hackathon",
    },
    {
      id: "PEND002",
      hackathon: "IoT Solutions Hackathon",
      amount: 65,
      dueDate: "2024-02-01",
      description: "Early bird registration fee",
    },
  ]

  const handlePayment = (paymentId: string) => {
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
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      })
      setSelectedPayment(null)
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
              <div className="text-2xl font-bold text-green-600">$185</div>
              <p className="text-xs text-gray-600 mt-1">Across 3 hackathons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">$145</div>
              <p className="text-xs text-gray-600 mt-1">2 payments due</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">$125</div>
              <p className="text-xs text-gray-600 mt-1">2 transactions</p>
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
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{payment.hackathon}</h4>
                      <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Due: {payment.dueDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${payment.amount}</p>
                      <Button onClick={() => setSelectedPayment(payment.id)} className="mt-2">
                        Pay Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{payment.hackathon}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{payment.date}</span>
                        <span>•</span>
                        <span>{payment.method}</span>
                        <span>•</span>
                        <span>{payment.transactionId}</span>
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
                      ${pendingPayments.find((p) => p.id === selectedPayment)?.amount}
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
