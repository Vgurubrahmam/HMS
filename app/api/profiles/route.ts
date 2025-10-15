import { NextResponse } from "next/server"
import db from "@/lib/db"
import Profile from "@/lib/models/Profile"

export async function GET(request: Request) {
  try {
    await db()
    
    const { searchParams } = request.nextUrl
    const userId = searchParams.get('userId')
    
    if (userId) {
      // Get specific profile by userId
      const profile = await Profile.findOne({ userId })
      
      if (!profile) {
        return NextResponse.json({ message: "Profile not found" }, { status: 404 })
      }
      
      return NextResponse.json({ data: profile })
    } else {
      // Get all profiles (admin function)
      const profiles = await Profile.find()
      return NextResponse.json({ data: profiles })
    }
  } catch (error) {
    console.error("Error fetching profiles:", error)
    return NextResponse.json(
      { message: "Error fetching profiles" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await db()
    const data = await request.json()

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: data.userId })
    
    if (existingProfile) {
      return NextResponse.json(
        { message: "Profile already exists for this user" },
        { status: 400 }
      )
    }

    const profile = new Profile(data)
    await profile.save()

    return NextResponse.json({
      message: "Profile created successfully",
      data: profile
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json(
      { message: "Error creating profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await db()
    const data = await request.json()

    if (!data.userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      )
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: data.userId },
      { $set: data },
      { new: true, upsert: true }
    )

    if (!profile) {
      throw new Error("Failed to update profile")
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      data: profile
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { message: "Error updating profile" },
      { status: 500 }
    )
  }
}
