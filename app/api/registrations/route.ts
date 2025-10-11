import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import User from "@/lib/models/User"
import Registration from "@/lib/models/Registration"
import bcryptjs from "bcryptjs"

interface RegisterRequestBody {
  username: string
  email: string
  password: string
  role: string
  studentId?: string
  expertise?: string
}

interface JsonResponse {
  message: string
  error?: unknown
  resetFields?: boolean
  closeDialog?: boolean
}

// POST method for user registration
export async function POST(req: NextRequest): Promise<NextResponse<JsonResponse>> {
  console.log("API /api/registrations POST called",req.url)

  try {
    // Connect to database
    await db()
    console.log("Database connected successfully")

    // Parse request body
    let body: RegisterRequestBody
    try {
      body = await req.json()
      // console.log("Request body:", { ...body, password: "[REDACTED]" })
    } catch (error) {
      // console.error("Invalid request body:", error)
      return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 })
    }

    const { username, email, password, role, studentId, expertise } = body

    // Validate required fields
    if (!username || !email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["coordinator", "mentor", "student", "faculty"]
    const normalizedRole = role.toLowerCase()
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json({ message: `Invalid role: ${normalizedRole}` }, { status: 400 })
    }

    // Role-specific validation
    if (normalizedRole === "student" && !studentId) {
      return NextResponse.json({ message: "Student ID is required for student role" }, { status: 400 })
    }

    if (normalizedRole === "mentor" && !expertise) {
      return NextResponse.json({ message: "Expertise is required for mentor role" }, { status: 400 })
    }

    // Hash password using bcryptjs
    const saltRounds = 12
    const hashPassword = await bcryptjs.hash(password, saltRounds)

    // Create user object
    const userData: any = {
      username,
      email,
      password: hashPassword,
      role: normalizedRole,
    }

    // Add role-specific fields
    if (normalizedRole === "student" && studentId) {
      userData.studentId = studentId
    }
    if (normalizedRole === "mentor" && expertise) {
      userData.expertise = expertise
    }

    // Save user
    const newUser = new User(userData)
    await newUser.save()

    // console.log("User registered successfully:", { email, role: normalizedRole })

    return NextResponse.json(
      {
        message: "User registered successfully",
        resetFields: true,
        closeDialog: true,
      },
      { status: 201 },
    )
  } catch (error) {
    // console.error("Server error:", error)
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
      data: { registrations },
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