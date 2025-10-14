import db from "@/lib/db"
import Hackathon from "@/lib/models/Hackathon"
import Registration from "@/lib/models/Registration"

/**
 * Refresh participant counts for all hackathons by counting confirmed registrations
 * @returns Promise with success status and number of updated hackathons
 */
export async function refreshParticipantCounts() {
  try {
    await db()

    // Get all hackathons
    const hackathons = await Hackathon.find({})
    let updatedCount = 0

    // Update participant count for each hackathon
    for (const hackathon of hackathons) {
      // Count confirmed registrations (either Completed payment or Registered status)
      const confirmedRegistrations = await Registration.countDocuments({
        hackathon: hackathon._id,
        $or: [
          { paymentStatus: "Completed" },
          { paymentStatus: "Registered" }
        ]
      })

      // Update the hackathon with the correct count
      const updated = await Hackathon.findByIdAndUpdate(
        hackathon._id,
        { currentParticipants: confirmedRegistrations },
        { new: true }
      )

      if (updated) {
        updatedCount++
      }
    }

    return {
      success: true,
      message: `Updated participant counts for ${updatedCount} hackathons`,
      updatedCount
    }
  } catch (error: any) {
    console.error("Error refreshing participant counts:", error)
    return {
      success: false,
      message: "Failed to refresh participant counts",
      error: error.message
    }
  }
}

/**
 * Refresh participant count for a specific hackathon
 * @param hackathonId - The ID of the hackathon to update
 * @returns Promise with success status
 */
export async function refreshHackathonParticipantCount(hackathonId: string) {
  try {
    await db()

    // Count confirmed registrations for this specific hackathon
    const confirmedRegistrations = await Registration.countDocuments({
      hackathon: hackathonId,
      $or: [
        { paymentStatus: "Completed" },
        { paymentStatus: "Registered" }
      ]
    })

    // Update the hackathon with the correct count
    const updated = await Hackathon.findByIdAndUpdate(
      hackathonId,
      { currentParticipants: confirmedRegistrations },
      { new: true }
    )

    if (updated) {
      return {
        success: true,
        message: "Participant count updated successfully",
        currentParticipants: confirmedRegistrations
      }
    } else {
      return {
        success: false,
        message: "Hackathon not found"
      }
    }
  } catch (error: any) {
    console.error("Error refreshing hackathon participant count:", error)
    return {
      success: false,
      message: "Failed to refresh participant count",
      error: error.message
    }
  }
}