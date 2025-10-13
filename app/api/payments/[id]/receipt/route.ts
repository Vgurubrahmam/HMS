import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db()
    
    const { id: paymentId } = params
    
    // Mock receipt data - replace with actual database queries
    const receiptData = {
      _id: paymentId,
      receiptNumber: `RCP-${Date.now()}`,
      paymentId: paymentId,
      amount: 500,
      currency: "INR",
      paymentMethod: "PayPal",
      status: "Completed",
      transactionId: `TXN-${Date.now()}`,
      paidAt: new Date().toISOString(),
      hackathon: {
        _id: "hack1",
        title: "Tech Innovation Challenge 2024",
        organizer: "Tech University"
      },
      student: {
        _id: "student1",
        name: "John Doe",
        email: "john.doe@example.com",
        rollNumber: "CS2021001"
      },
      billing: {
        name: "John Doe",
        email: "john.doe@example.com",
        address: "123 Student Street",
        city: "Tech City",
        state: "Tech State",
        zipCode: "12345",
        country: "India"
      },
      fees: {
        registrationFee: 450,
        processingFee: 30,
        taxes: 20,
        total: 500
      },
      receiptUrl: `/receipts/${paymentId}.pdf`
    }

    return NextResponse.json({
      success: true,
      data: receiptData
    })

  } catch (error) {
    console.error("Error fetching payment receipt:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment receipt" },
      { status: 500 }
    )
  }
}