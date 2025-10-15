import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import User from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    await db()

    const { searchParams } = request.nextUrl
    const role = searchParams.get("role")
    const department = searchParams.get("department")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const query: any = {}

    if (role && role !== "all") {
      query.role = role
    }

    if (department && department !== "all") {
      query.department = department
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const users = await User.find(query).select("-__v").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await User.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await db()

    const body = await request.json()
    const { name, email, studentId, department, year, phone, role, skills, bio, expertise } = body

    // Validate required fields
    if (!name || !email || !department || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 409 })
    }

    const user = new User({
      name,
      email,
      studentId,
      department,
      year,
      phone,
      role,
      skills: skills || [],
      bio,
      expertise: expertise || [],
    })

    await user.save()

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
  }
}
