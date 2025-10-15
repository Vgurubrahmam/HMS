import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import db from "@/lib/db"
import Profile from "@/lib/models/Profile"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const userId = params.id

    // First, find the Profile by userId (which links to User collection)
    const mentorProfile = await Profile.findOne({ userId: userId, role: 'mentor' })
    
    if (!mentorProfile) {
      return NextResponse.json({ success: false, error: "Mentor profile not found" }, { status: 404 })
    }

    // For now, return empty sessions array since we don't have a sessions model
    // This can be expanded later when mentoring sessions are implemented
    const sessions: any[] = []

    return NextResponse.json({
      success: true,
      data: sessions,
      count: sessions.length
    })

  } catch (error) {
    console.error("Error fetching mentor sessions:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch mentor sessions" 
    }, { status: 500 })
  }
}