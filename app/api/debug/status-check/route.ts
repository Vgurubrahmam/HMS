import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Hackathon from "@/lib/models/Hackathon"
import { debugHackathonStatus, forceStatusCalculation, getHackathonStatus } from "@/lib/status-utils"

/**
 * Debug API endpoint to test status calculation for specific hackathons
 * GET /api/debug/status-check?title=AI THON
 */
export async function GET(request: NextRequest) {
  try {
    await db()

    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'AI THON'

    // Find the specific hackathon
    const hackathon: any = await Hackathon.findOne({ 
      title: { $regex: title, $options: 'i' } 
    }).lean()

    if (!hackathon) {
      const availableHackathons = await Hackathon.find({}, { title: 1, registrationDeadline: 1, status: 1 }).lean()
      return NextResponse.json({
        success: false,
        error: `Hackathon "${title}" not found`,
        available_hackathons: availableHackathons
      })
    }

    // Debug the status calculation
    debugHackathonStatus(hackathon)

    // Get calculated status
    const calculatedStatus = forceStatusCalculation(hackathon)
    
    // Current system time info
    const now = new Date()
    const regDeadline = new Date(hackathon.registrationDeadline)
    const startDate = new Date(hackathon.startDate)
    
    const response = {
      success: true,
      hackathon: {
        title: hackathon.title,
        current_status_in_db: hackathon.status,
        calculated_status: calculatedStatus.status,
        should_update: calculatedStatus.status !== hackathon.status
      },
      dates: {
        current_time: now.toISOString(),
        current_time_readable: now.toString(),
        registration_deadline: regDeadline.toISOString(),
        registration_deadline_readable: regDeadline.toString(),
        start_date: startDate.toISOString(),
        start_date_readable: startDate.toString(),
      },
      comparisons: {
        deadline_passed: now > regDeadline,
        milliseconds_since_deadline: now.getTime() - regDeadline.getTime(),
        days_since_deadline: (now.getTime() - regDeadline.getTime()) / (1000 * 60 * 60 * 24),
        event_started: now >= startDate,
      },
      calculated_status_details: calculatedStatus,
      raw_deadline_value: hackathon.registrationDeadline,
      timezone_info: {
        system_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        system_offset: now.getTimezoneOffset(),
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error: any) {
    console.error("Error debugging status:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to debug status",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * Force update status for a specific hackathon
 * POST /api/debug/status-check
 */
export async function POST(request: NextRequest) {
  try {
    await db()
    
    const body = await request.json()
    const { title = 'AI THON' } = body

    // Find and update the hackathon
    const hackathon = await Hackathon.findOne({ 
      title: { $regex: title, $options: 'i' } 
    })

    if (!hackathon) {
      return NextResponse.json({
        success: false,
        error: `Hackathon "${title}" not found`
      })
    }

    // Calculate new status
    const newStatus = forceStatusCalculation(hackathon.toObject())
    
    // Update if needed
    let updated = false
    if (newStatus.status !== hackathon.status) {
      hackathon.status = newStatus.status
      await hackathon.save()
      updated = true
    }

    return NextResponse.json({
      success: true,
      hackathon_title: hackathon.title,
      old_status: hackathon.status,
      new_status: newStatus.status,
      updated,
      message: updated 
        ? `Status updated from "${hackathon.status}" to "${newStatus.status}"`
        : 'Status already up to date'
    })

  } catch (error: any) {
    console.error("Error forcing status update:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to force status update",
        details: error.message,
      },
      { status: 500 }
    )
  }
}