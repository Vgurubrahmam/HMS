import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Registration from "@/lib/models/Registration"
import Hackathon from "@/lib/models/Hackathon"
import { getHackathonStatus, getRegistrationStatus } from "@/lib/status-utils"

/**
 * API endpoint to automatically update registration statuses based on hackathon timeline
 */
export async function POST(request: NextRequest) {
  try {
    await db()

    // Get all registrations with populated hackathon data
    const registrations = await Registration.find({})
      .populate('hackathon')
      .populate('user', 'name email')
      .lean()

    if (!registrations.length) {
      return NextResponse.json({
        success: true,
        message: "No registrations found",
        updated: 0,
      })
    }

    let updatedCount = 0
    const updateResults: any[] = []

    // Process each registration
    for (const registration of registrations) {
      if (!registration.hackathon) {
        continue // Skip registrations with invalid hackathon references
      }

      // Get current hackathon status
      const hackathonStatus = getHackathonStatus(registration.hackathon)
      
      // Calculate what the registration status should be
      const expectedRegistrationStatus = getRegistrationStatus(registration, hackathonStatus)
      
      // Check if status needs updating
      const currentStatus = registration.status || "Registered"
      const expectedStatus = expectedRegistrationStatus.status

      if (currentStatus !== expectedStatus) {
        try {
          await Registration.findByIdAndUpdate(
            registration._id,
            { 
              status: expectedStatus,
              updatedAt: new Date(),
            },
            { new: true }
          )

          updatedCount++
          updateResults.push({
            registrationId: registration._id,
            userId: registration.user?._id,
            hackathonTitle: registration.hackathon?.title,
            oldStatus: currentStatus,
            newStatus: expectedStatus,
            reason: `Hackathon status: ${hackathonStatus.status}, Phase: ${hackathonStatus.phase}`,
          })

        } catch (updateError) {
          console.error(`Failed to update registration ${registration._id}:`, updateError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} registration statuses`,
      updated: updatedCount,
      total_registrations: registrations.length,
      updates: updateResults,
    })

  } catch (error: any) {
    console.error("Error updating registration statuses:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update registration statuses",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to preview which registrations would be updated
 */
export async function GET() {
  try {
    await db()

    // Get all registrations with populated hackathon data
    const registrations = await Registration.find({})
      .populate('hackathon')
      .populate('user', 'name email')
      .lean()

    const previewResults: any[] = []

    for (const registration of registrations) {
      if (!registration.hackathon) {
        continue
      }

      // Get current hackathon status
      const hackathonStatus = getHackathonStatus(registration.hackathon)
      
      // Calculate what the registration status should be
      const expectedRegistrationStatus = getRegistrationStatus(registration, hackathonStatus)
      
      // Check if status needs updating
      const currentStatus = registration.status || "Registered"
      const expectedStatus = expectedRegistrationStatus.status

      previewResults.push({
        registrationId: registration._id,
        userId: registration.user?._id,
        userName: registration.user?.name,
        hackathonTitle: registration.hackathon?.title,
        currentStatus,
        expectedStatus,
        needsUpdate: currentStatus !== expectedStatus,
        hackathonPhase: hackathonStatus.phase,
        canPay: expectedRegistrationStatus.canPay,
        priority: expectedRegistrationStatus.priority,
      })
    }

    const needsUpdate = previewResults.filter(r => r.needsUpdate)

    return NextResponse.json({
      success: true,
      message: `Found ${needsUpdate.length} registrations that need status updates`,
      updates_needed: needsUpdate.length,
      total_registrations: registrations.length,
      preview: needsUpdate,
      all_registrations: previewResults,
    })

  } catch (error: any) {
    console.error("Error previewing registration status updates:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to preview registration status updates",
        details: error.message,
      },
      { status: 500 }
    )
  }
}