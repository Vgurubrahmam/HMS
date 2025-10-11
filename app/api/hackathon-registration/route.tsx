import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Registration from '@/lib/models/Registration';
import User from '@/lib/models/User';
import Hackathon from '@/lib/models/Hackathon';



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
      return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 })
    }

    const { user, hackathon, paymentStatus } = body

    // Validate required fields
    if (!user || !hackathon) {
      return NextResponse.json({ message: "User and Hackathon fields are required" }, { status: 400 })
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

    console.log("Hackathon registration successful")

    return NextResponse.json(
      {
        message: "Hackathon registration successful",
        resetFields: true,
        closeDialog: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in POST /api/registrations for hackathon registration:", error)
    return NextResponse.json(
      { message: "Server error", error: error instanceof Error ? error.message : "Unknown error" },
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
      Registration.find(query).skip(skip).limit(limit).populate("user", "username email"),
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