import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Hackathon from "@/lib/models/Hackathon"
import { forceStatusCalculation } from "@/lib/status-utils"

/**
 * Force refresh all hackathon statuses - especially for debugging date issues
 * POST /api/hackathons/force-refresh
 */
export async function POST(request: NextRequest) {
  try {
    await db()

    // Get all hackathons
    const hackathons = await Hackathon.find({}).lean()
    
    
    const updateResults = []
    let updatedCount = 0

    for (const hackathon of hackathons) {
      const oldStatus = hackathon.status
      const calculatedStatus = forceStatusCalculation(hackathon)
      
    
      // Force update if different
      if (calculatedStatus.status !== oldStatus) {
        try {
          await Hackathon.findByIdAndUpdate(
            hackathon._id,
            { 
              status: calculatedStatus.status,
              updatedAt: new Date()
            }
          )
          
          updatedCount++
          updateResults.push({
            id: hackathon._id,
            title: hackathon.title,
            oldStatus,
            newStatus: calculatedStatus.status,
            registrationDeadline: hackathon.registrationDeadline,
            updated: true
          })
          
        } catch (updateError) {
          const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error'
          updateResults.push({
            id: hackathon._id,
            title: hackathon.title,
            oldStatus,
            newStatus: calculatedStatus.status,
            error: errorMessage,
            updated: false
          })
        }
      } else {
        updateResults.push({
          id: hackathon._id,
          title: hackathon.title,
          status: oldStatus,
          updated: false,
          reason: "Status already correct"
        })
      }
    }

    
    return NextResponse.json({
      success: true,
      message: `Force refresh completed: ${updatedCount} hackathons updated`,
      totalHackathons: hackathons.length,
      updatedCount,
      currentTime: new Date().toISOString(),
      results: updateResults
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to force refresh hackathon statuses",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * Preview what would be updated without actually updating
 */
export async function GET(request: NextRequest) {
  try {
    await db()

    const hackathons = await Hackathon.find({}).lean()
    
    const previewResults = hackathons.map(hackathon => {
      const currentStatus = hackathon.status
      const calculatedStatus = forceStatusCalculation(hackathon)
      
      return {
        id: hackathon._id,
        title: hackathon.title,
        currentStatus,
        calculatedStatus: calculatedStatus.status,
        shouldUpdate: calculatedStatus.status !== currentStatus,
        registrationDeadline: hackathon.registrationDeadline,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        statusDetails: calculatedStatus
      }
    })

    const needsUpdate = previewResults.filter(r => r.shouldUpdate)
    
    return NextResponse.json({
      success: true,
      message: `Preview: ${needsUpdate.length} hackathons need status updates`,
      totalHackathons: hackathons.length,
      needsUpdateCount: needsUpdate.length,
      currentTime: new Date().toISOString(),
      needsUpdate,
      allHackathons: previewResults
    })

  } catch (error: any) {
    console.error("Preview failed:", error)
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