import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Profile from "@/lib/models/Profile"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db()
    
    const mentor = await Profile.findById(params.id)
    
    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: "Mentor not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: mentor
    })

  } catch (error) {
    console.error("Error fetching mentor:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch mentor" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if mentor exists
    const existingMentor = await Profile.findById(params.id)
    if (!existingMentor || existingMentor.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: "Mentor not found" },
        { status: 404 }
      )
    }

    // Check if email is already taken by another mentor
    if (email !== existingMentor.email) {
      const emailExists = await Profile.findOne({ 
        email, 
        role: 'mentor', 
        _id: { $ne: params.id } 
      })
      
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email already exists for another mentor" },
          { status: 409 }
        )
      }
    }

    // Update mentor profile
    const updatedMentor = await Profile.findByIdAndUpdate(
      params.id,
      {
        username,
        email,
        phone,
        gender,
        image,
        department,
        designation,
        specialization,
        expertise: expertise || [],
        company,
        experience
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      data: updatedMentor,
      message: "Mentor updated successfully"
    })

  } catch (error) {
    console.error("Error updating mentor:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update mentor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db()
    
    // Check if mentor exists
    const mentor = await Profile.findById(params.id)
    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: "Mentor not found" },
        { status: 404 }
      )
    }

    // TODO: Check if mentor has active team assignments
    // You may want to prevent deletion if mentor has active teams
    // or automatically unassign teams before deletion

    await Profile.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: "Mentor deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting mentor:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete mentor" },
      { status: 500 }
    )
  }
}