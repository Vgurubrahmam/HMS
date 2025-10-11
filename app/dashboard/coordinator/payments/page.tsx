"use client"
import { useState, useEffect } from "react"
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
import { usePayments } from "@/hooks/use-payments"
export default function coordinatorPaymentPage(){
  const {
    payments,
    loading: paymentsLoading,
  } = usePayments() // Get all payments for coordinator view

  // Calculate totals
  const totalAmount = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0)
  const completedAmount = payments
    .filter((payment: any) => payment.status === "Completed")
    .reduce((sum: number, payment: any) => sum + payment.amount, 0)
  const pendingAmount = payments
    .filter((payment: any) => payment.status === "Pending")
    .reduce((sum: number, payment: any) => sum + payment.amount, 0)


  return (
    <DashboardLayout userRole="coordinator">
       <div>
            <h1 className="text-3xl font-bold text-gray-900 pb-3">Payment Management</h1>
          </div>
    <Table className="">
      <TableCaption>A list of all hackathon payments.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Hackathon</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment: any) => (
          <TableRow key={payment._id}>
            <TableCell className="font-medium">
              {typeof payment.hackathon === 'object' ? payment.hackathon.title : payment.hackathon}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                payment.status === "Completed" ? "bg-green-100 text-green-800" :
                payment.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                payment.status === "Failed" ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {payment.status}
              </span>
            </TableCell>
            <TableCell>{payment.paymentMethod}</TableCell>
            <TableCell className="text-right">${payment.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">${totalAmount.toFixed(2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3}>Completed</TableCell>
          <TableCell className="text-right text-green-600">${completedAmount.toFixed(2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3}>Pending</TableCell>
          <TableCell className="text-right text-yellow-600">${pendingAmount.toFixed(2)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
    </DashboardLayout>
  )


}  
