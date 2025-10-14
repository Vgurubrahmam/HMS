import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Hackathon from "@/lib/models/Hackathon"
import { getBulkStatusUpdates } from "@/lib/status-utils"

/**
 * API endpoint to automatically update hackathon statuses based on current date
 * This can be called by a cron job or scheduled task for automated updates
 */
export async function POST(request: NextRequest) {
  try {
    await db()

    // Get all hackathons
    const hackathons = await Hackathon.find({}).lean()

    // Calculate which hackathons need status updates
    const statusUpdates = getBulkStatusUpdates(hackathons)

    if (statusUpdates.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No status updates needed",
        updated: 0,
      })
    }

    // Perform bulk updates
    const updatePromises = statusUpdates.map(update =>
      Hackathon.findByIdAndUpdate(
        update.id,
        { status: update.status },
        { new: true }
      )
    )

    const updatedHackathons = await Promise.all(updatePromises)
    const successCount = updatedHackathons.filter(h => h !== null).length

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${successCount} hackathon statuses`,
      updated: successCount,
      updates: statusUpdates,
    })

  } catch (error: any) {
    console.error("Error updating hackathon statuses:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update hackathon statuses",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to preview which hackathons would be updated
 */
export async function GET() {
  try {
    await db()

    // Get all hackathons
    const hackathons = await Hackathon.find({}).lean()

    // Calculate which hackathons need status updates (without actually updating)
    const statusUpdates = getBulkStatusUpdates(hackathons)

    return NextResponse.json({
      success: true,
      message: `Found ${statusUpdates.length} hackathons that need status updates`,
      updates: statusUpdates,
      total_hackathons: hackathons.length,
    })

  } catch (error: any) {
    console.error("Error previewing hackathon status updates:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to preview hackathon status updates",
        details: error.message,
      },
      { status: 500 }
    )
  }
}