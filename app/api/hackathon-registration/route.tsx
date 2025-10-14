import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Registration from '@/lib/models/Registration';
import User from '@/lib/models/User';
import Hackathon from '@/lib/models/Hackathon';
import Payment from '@/lib/models/Payment';
import { refreshHackathonParticipantCount } from '@/lib/participant-utils';



interface JsonResponse {
  message: string
  error?: unknown
  resetFields?: boolean
  closeDialog?: boolean
}


// POST method for hackathon registration
export async function POST(req: NextRequest): Promise<NextResponse<JsonResponse>> {
  try {
    await db()
    console.log("Database connected successfully for hackathon registration")

    let body
    try {
      body = await req.json()
      console.log("Hackathon registration request body:", body)
    } catch (error) {
      // console.error("Invalid request body for hackathon registration:", error)
      return NextResponse.json({ success: false, message: "Invalid JSON payload" }, { status: 400 })
    }

    const { user, hackathon, paymentStatus } = body

    // Validate required fields
    if (!user || !hackathon) {
      return NextResponse.json({ success: false, message: "User and Hackathon fields are required" }, { status: 400 })
    }

    // Check if user is already registered for this hackathon
    const existingRegistration = await Registration.findOne({ user, hackathon })
    if (existingRegistration) {
      return NextResponse.json({ 
        success: false, 
        message: "You are already registered for this hackathon",
        data: existingRegistration
      }, { status: 409 })
    }

    // Create registration object
    const registrationData = {
      user,
      hackathon,
      paymentStatus: paymentStatus || "Pending",
    }

    console.log("Hackathon registration data to be saved:", registrationData)

    // Save registration
    const newRegistration = new Registration(registrationData)
    await newRegistration.save()

    // Get hackathon details for payment
    const hackathonDetails = await Hackathon.findById(hackathon)
    if (!hackathonDetails) {
      return NextResponse.json({ success: false, message: "Hackathon not found" }, { status: 404 })
    }

    // Create payment record
    const paymentData = {
      user,
      hackathon,
      registration: newRegistration._id,
      amount: hackathonDetails.registrationFee,
      paymentMethod: "PayPal", // Default payment method
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      description: `Registration fee for ${hackathonDetails.title}`,
    }

    const newPayment = new Payment(paymentData)
    await newPayment.save()

    // Update registration with payment reference
    newRegistration.payment = newPayment._id
    await newRegistration.save()

    // Update hackathon participant count using utility function
    await refreshHackathonParticipantCount(hackathon)

    console.log("Hackathon registration and payment created successfully")

    return NextResponse.json(
      {
        success: true,
        message: "Hackathon registration successful",
        data: newRegistration,
        resetFields: true,
        closeDialog: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in POST /api/registrations for hackathon registration:", error)
    return NextResponse.json(
      { success: false, message: "Server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// GET method for fetching registrations
export async function GET(req: NextRequest): Promise<NextResponse> {
  // console.log("API /api/registrations GET called")

  try {
    await db()
    // console.log("Database connected successfully")

    const { searchParams } = new URL(req.url)
    const user = searchParams.get("user")
    const hackathon = searchParams.get("hackathon")
    const paymentStatus = searchParams.get("paymentStatus")
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    // Build query
    const query: any = {}
    if (user) query.user = user
    if (hackathon) query.hackathon = hackathon
    if (paymentStatus) query.paymentStatus = paymentStatus

    // Execute query with pagination
    const skip = (page - 1) * limit
    const [registrations, total] = await Promise.all([
      Registration.find(query)
        .skip(skip)
        .limit(limit)
        .populate("user", "username email")
        .populate("hackathon", "title registrationFee")
        .populate("payment", "amount status paymentMethod dueDate"),
      Registration.countDocuments(query),
    ])

    const response = {
      success: true,
      data: registrations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }

    // console.log("Fetch registrations successful")
    return NextResponse.json(response)
  } catch (error) {
    // console.error("Server error while fetching registrations:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}