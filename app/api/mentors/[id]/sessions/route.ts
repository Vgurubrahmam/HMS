import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import db from "@/lib/db"
import Profile from "@/lib/models/Profile"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const userId = params.id
    
    // Find mentor profile
    const mentorProfile = await Profile.findOne({ userId: userId, role: 'mentor' })
    
    if (!mentorProfile) {
      return NextResponse.json({ success: false, error: "Mentor profile not found" }, { status: 404 })
    }

    // Mock mentoring sessions data - in real implementation, fetch from MentoringSession model
    const sessions = [
      {
        _id: `session_${mentorProfile._id}_1`,
        team: "team_id_1",
        teamName: "Innovators Hub",
        title: "Weekly Progress Review",
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        type: "Group",
        status: "Scheduled",
        agenda: "Review current progress, discuss challenges, plan next steps",
        meetingLink: "https://meet.google.com/abc-def-ghi",
        notes: null
      },
      {
        _id: `session_${mentorProfile._id}_2`,
        team: "team_id_2", 
        teamName: "Code Crusaders",
        title: "Technical Architecture Review",
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 90,
        type: "Code Review",
        status: "Scheduled",
        agenda: "Review system architecture, discuss scalability concerns",
        meetingLink: "https://meet.google.com/xyz-abc-def",
        notes: null
      },
      {
        _id: `session_${mentorProfile._id}_3`,
        team: "team_id_1",
        teamName: "Innovators Hub", 
        title: "Project Kickoff",
        scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 120,
        type: "Group",
        status: "Completed",
        agenda: "Project introduction, team formation, initial planning",
        meetingLink: "https://meet.google.com/completed-link",
        notes: "Great team energy! Clear project vision established. Next session: deep-dive into technical requirements."
      }
    ]

    // Separate by status
    const scheduled = sessions.filter(s => s.status === "Scheduled")
    const completed = sessions.filter(s => s.status === "Completed")
    const upcoming = scheduled.filter(s => new Date(s.scheduledDate) > new Date())

    return NextResponse.json({
      success: true,
      data: {
        all: sessions,
        scheduled: scheduled,
        completed: completed,
        upcoming: upcoming
      },
      summary: {
        totalSessions: sessions.length,
        upcomingSessions: upcoming.length,
        completedSessions: completed.length,
        nextSession: upcoming.length > 0 ? upcoming[0] : null
      }
    })

  } catch (error) {
    console.error("Error fetching mentor sessions:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch mentor sessions" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()
    
    const userId = params.id
    const body = await request.json()
    const { 
      teamId,
      title, 
      scheduledDate, 
      duration, 
      type, 
      agenda,
      meetingLink
    } = body
    
    // Find mentor profile
    const mentorProfile = await Profile.findOne({ userId: userId, role: 'mentor' })
    
    if (!mentorProfile) {
      return NextResponse.json({ success: false, error: "Mentor profile not found" }, { status: 404 })
    }

    // Create new session - in real implementation, save to MentoringSession model
    const newSession = {
      _id: `session_${Date.now()}`,
      team: teamId,
      mentor: mentorProfile._id,
      title,
      scheduledDate,
      duration: parseInt(duration),
      type,
      status: "Scheduled",
      agenda,
      meetingLink: meetingLink || `https://meet.google.com/generated-${Date.now()}`,
      createdAt: new Date().toISOString(),
      notes: null
    }

    console.log("Creating mentoring session:", newSession)

    return NextResponse.json({
      success: true,
      message: "Mentoring session scheduled successfully",
      data: newSession
    })

  } catch (error) {
    console.error("Error creating mentoring session:", error)
    return NextResponse.json(
      { success: false, message: "Failed to schedule mentoring session" },
      { status: 500 }
    )
  }
}