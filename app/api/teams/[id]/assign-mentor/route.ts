import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import db from "@/lib/db"
import Team from "@/lib/models/Team"
import Profile from "@/lib/models/Profile"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== ASSIGN MENTOR API CALLED ===")
    console.log("Team ID from params:", params.id)
    console.log("Request URL:", request.url)
    console.log("Request method:", request.method)
    
    await db()

    const body = await request.json()
    const { mentorId } = body

    console.log("Request body:", body)
    console.log("Mentor ID:", mentorId)
    console.log("Team ID:", params.id)

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log("Invalid team ID format:", params.id)
      return NextResponse.json({ success: false, error: "Invalid team ID format" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      console.log("Invalid mentor ID format:", mentorId)
      return NextResponse.json({ success: false, error: "Invalid mentor ID format" }, { status: 400 })
    }

    console.log("ObjectId validation passed")

    // Check if team exists
    console.log("Searching for team with ID:", params.id)
    const team = await Team.findById(params.id)
    console.log("Team found:", team ? `${team.name} (${team._id})` : "null")
    
    if (!team) {
      console.log("Team not found in database")
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 })
    }

    // Check if mentor exists and has mentor role
    console.log("Searching for mentor with ID:", mentorId)
    const mentor = await Profile.findById(mentorId)
    console.log("Mentor found:", mentor ? `${mentor.username} (${mentor._id}) - Role: ${mentor.role}` : "null")
    
    if (!mentor || mentor.role !== 'mentor') {
      console.log("Mentor not found or invalid role")
      return NextResponse.json({ success: false, error: "Mentor not found or invalid role" }, { status: 404 })
    }

    console.log("Starting team update...")
    // Assign mentor to team (we'll store the Profile._id in mentor field)
    const updatedTeam = await Team.findByIdAndUpdate(
      params.id,
      { 
        mentor: mentorId,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "hackathon", select: "title description startDate endDate" },
      { path: "members", select: "username name email role skills image" },
      { path: "teamLead", select: "username name email role image" }
    ])

    console.log("Team updated successfully")

    // Manually populate mentor from Profile collection since Team model refs "users"
    if (updatedTeam.mentor) {
      const mentorData = await Profile.findById(updatedTeam.mentor).select("username email expertise department")
      updatedTeam.mentor = mentorData
      console.log("Mentor data populated:", mentorData?.username)
    }

    console.log("Team mentor assigned successfully:", updatedTeam.name)
    return NextResponse.json({
      success: true,
      data: updatedTeam,
      message: `Mentor ${mentor.username} assigned to team ${team.name} successfully`
    })

  } catch (error) {
    console.error("Error assigning mentor to team:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.log("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    
    return NextResponse.json({ 
      success: false, 
      error: "Failed to assign mentor to team",
      details: errorMessage
    }, { status: 500 })
  }
}