import { NextResponse } from "next/server"
import db from "@/lib/db"
import Profile from "@/lib/models/Profile"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db()
    const profile = await Profile.findOne({ userId: params.id })

    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { message: "Error fetching profile" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db()
    const data = await request.json()

    const profile = await Profile.findOneAndUpdate(
      { userId: params.id },
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