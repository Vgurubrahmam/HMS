import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    await db()
    
    const body = await request.json()
    const { 
      title, 
      teamId, 
      mentorId, 
      scheduledAt, 
      duration, 
      type, 
      agenda, 
      meetingLink, 
      location 
    } = body
    
    // Mock session creation - replace with actual database operations
    const sessionData = {
      _id: `session_${Date.now()}`,
      title,
      team: teamId,
      mentor: mentorId,
      scheduledAt,
      duration: parseInt(duration),
      type,
      status: "Scheduled",
      agenda: Array.isArray(agenda) ? agenda : agenda.split('\n').filter((item: string) => item.trim()),
      meetingLink,
      location,
      createdAt: new Date().toISOString(),
      notes: null,
      feedback: null
    }

    console.log("Creating mentoring session:", sessionData)

    return NextResponse.json({
      success: true,
      message: "Mentoring session scheduled successfully",
      data: sessionData
    })

  } catch (error) {
    console.error("Error creating mentoring session:", error)
    return NextResponse.json(
      { success: false, message: "Failed to schedule mentoring session" },
      { status: 500 }
    )
  }
}