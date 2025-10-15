import { NextResponse } from "next/server"
import db from "@/lib/db"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import { cookies } from "next/headers"

const secretkey = process.env.JWT_SECRET || "guru" // Use environment variable in production

interface LoginRequestBody {
  email: string
  password: string
  role?: string
}

interface RoleData {
  email: string
  role: string
  userId: string
}

interface LoginResponse {
  token: string
  roleData: RoleData
  message: string
}

export async function POST(req: Request): Promise<Response> {
  // console.log("API /api/login called")

  // Initialize database connection
  try {
    await db()
    // console.log("Database connected successfully")/
  } catch (error) {
    // console.error("Database connection error:", error)
    return NextResponse.json({ message: "Database connection failed" }, { status: 500 })
  }

  try {
    // Parse request body safely
    let body: LoginRequestBody
    try {
      body = await req.json()
      // console.log("Request body:", { ...body, password: "[REDACTED]" })
    } catch (error) {
      // console.error("Invalid request body:", error)
      return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 })
    }

    const { email, password, role } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user: any = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 })
    }

    // Verify password using bcryptjs
    const isMatch: boolean = await bcryptjs.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid Password" }, { status: 400 })
    }

    // Optional role validation
    if (role && user.role !== role.toLowerCase()) {
      return NextResponse.json({ message: "Role mismatch" }, { status: 400 })
    }

    // Generate JWT
    const token: string = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "empty",
      },
      secretkey,
      { expiresIn: "1h" },
    )

    // Set token in cookies with secure options
    const cookieStore = await cookies()
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour (3600 seconds)
    })

    // Prepare response
    const response: LoginResponse = {
      token,
      roleData: { email, role: user.role || "empty", userId: user._id.toString() },
      message: "User logged in successfully",
    }

    // console.log("Login successful for user:", email)
    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    // console.error("Server error:", error)
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
  }
}
