import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import db from "@/lib/db"
import Team from "@/lib/models/Team"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const team = await Team.findById(params.id)
      .populate("hackathon", "title description startDate endDate")
      .populate("members", "username name email role skills image")
      .populate("teamLead", "username name email role image")
      .populate("mentor", "username name email expertise image")

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: team,
    })
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch team" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const body = await request.json()
    console.log("Updating team with ID:", params.id, "Data:", body)

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid team ID format" }, { status: 400 })
    }

    // Ensure teamLead is included in members if provided
    if (body.members && body.teamLead) {
      if (!body.members.includes(body.teamLead)) {
        body.members = [body.teamLead, ...body.members]
      }
    }

    const team = await Team.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate([
      { path: "hackathon", select: "title description startDate endDate" },
      { path: "members", select: "username name email role skills image" },
      { path: "teamLead", select: "username name email role image" },
      { path: "mentor", select: "username name email expertise image" },
    ])

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 })
    }

    console.log("Team updated successfully:", team.name)
    return NextResponse.json({
      success: true,
      data: team,
    })
  } catch (error) {
    console.error("Error updating team:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error details:", errorMessage)
    
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update team",
      details: errorMessage
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const team = await Team.findByIdAndDelete(params.id)

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Team deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json({ success: false, error: "Failed to delete team" }, { status: 500 })
  }
}
