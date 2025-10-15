import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import db from "@/lib/db"
import Team from "@/lib/models/Team"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    console.log("Unassigning mentor from team:", params.id)

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid team ID format" }, { status: 400 })
    }

    // Check if team exists
    const team = await Team.findById(params.id)
    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 })
    }

    // Remove mentor from team
    const updatedTeam = await Team.findByIdAndUpdate(
      params.id,
      { 
        $unset: { mentor: 1 },
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "hackathon", select: "title description startDate endDate" },
      { path: "members", select: "username name email role skills image" },
      { path: "teamLead", select: "username name email role image" }
    ])

    console.log("Team mentor unassigned successfully:", updatedTeam.name)
    return NextResponse.json({
      success: true,
      data: updatedTeam,
      message: `Mentor unassigned from team ${team.name} successfully`
    })

  } catch (error) {
    console.error("Error unassigning mentor from team:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    
    return NextResponse.json({ 
      success: false, 
      error: "Failed to unassign mentor from team",
      details: errorMessage
    }, { status: 500 })
  }
}