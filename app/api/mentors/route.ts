import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Profile from "@/lib/models/Profile"

export async function GET(request: NextRequest) {
  try {
    await db()
    
    const { searchParams } = request.nextUrl
    const department = searchParams.get('department')
    const search = searchParams.get('search')
    
    // Build query to fetch mentors from Profile collection
    const query: any = { role: 'mentor' }
    
    if (department && department !== 'all') {
      query.department = { $regex: department, $options: 'i' }
    }
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { expertise: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Fetch mentors from database
    const mentors = await Profile.find(query).select('-__v').sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: mentors
    })

  } catch (error) {
    console.error("Error fetching mentors:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch mentors" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await db()
    
    const body = await request.json()
    const { 
      username, 
      email, 
      phone, 
      department, 
      designation, 
      specialization, 
      expertise, 
      company, 
      experience,
      image,
      gender 
    } = body

    // Validate required fields
    if (!username || !email || !department) {
      return NextResponse.json(
        { success: false, message: "Username, email, and department are required" },
        { status: 400 }
      )
    }

    // Check if mentor already exists
    const existingMentor = await Profile.findOne({ email, role: 'mentor' })
    if (existingMentor) {
      return NextResponse.json(
        { success: false, message: "Mentor with this email already exists" },
        { status: 409 }
      )
    }

    // Create new mentor profile
    const mentorProfile = new Profile({
      userId: new Date().getTime().toString(), // Generate temporary userId
      username,
      email,
      role: 'mentor',
      phone,
      gender,
      image,
      department,
      designation,
      specialization,
      expertise: expertise || [],
      company,
      experience
    })

    await mentorProfile.save()

    return NextResponse.json({
      success: true,
      data: mentorProfile,
      message: "Mentor created successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating mentor:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create mentor" },
      { status: 500 }
    )
  }
}