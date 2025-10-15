import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import db from "@/lib/db"
import Team from "@/lib/models/Team"
import Profile from "@/lib/models/Profile"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== DEBUG TEAM API CALLED ===")
    console.log("Team ID from params:", params.id)
    
    await db()

    console.log("Database connected")
    console.log("ObjectId validation for", params.id, ":", mongoose.Types.ObjectId.isValid(params.id))

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid team ID format",
        debug: {
          teamId: params.id,
          isValidObjectId: false
        }
      }, { status: 400 })
    }

    // Search for the team
    const team = await Team.findById(params.id)
    console.log("Team search result:", team ? `Found: ${team.name}` : "Not found")

    // Get all teams for comparison
    const allTeams = await Team.find({}, '_id name').limit(10)
    console.log("Sample teams in database:", allTeams.map(t => ({ id: t._id.toString(), name: t.name })))

    // Get mentors count
    const mentorsCount = await Profile.countDocuments({ role: 'mentor' })
    console.log("Mentors in database:", mentorsCount)

    return NextResponse.json({
      success: true,
      debug: {
        requestedTeamId: params.id,
        isValidObjectId: mongoose.Types.ObjectId.isValid(params.id),
        teamFound: !!team,
        teamDetails: team ? { id: team._id, name: team.name, mentor: team.mentor } : null,
        sampleTeams: allTeams.map(t => ({ id: t._id.toString(), name: t.name })),
        mentorsCount,
        databaseState: "connected"
      }
    })

  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Debug API failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}