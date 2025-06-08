import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Team from "@/lib/models/Team"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const team = await Team.findById(params.id)
      .populate("hackathon", "title")
      .populate("members", "name email role skills")
      .populate("teamLead", "name email")
      .populate("mentor", "name email")

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

    const team = await Team.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate([
      { path: "hackathon", select: "title" },
      { path: "members", select: "name email role" },
      { path: "teamLead", select: "name email" },
      { path: "mentor", select: "name email" },
    ])

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: team,
    })
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ success: false, error: "Failed to update team" }, { status: 500 })
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
