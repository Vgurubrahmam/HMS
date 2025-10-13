import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db()
    
    const { id: teamId } = params
    const body = await request.json()
    const { feedback, rating, mentorId } = body
    
    // Mock feedback submission - replace with actual database operations
    const feedbackData = {
      _id: `feedback_${Date.now()}`,
      team: teamId,
      mentor: mentorId,
      feedback: feedback,
      rating: rating,
      timestamp: new Date().toISOString(),
      type: "progress_feedback"
    }

    console.log(`Submitting feedback for team ${teamId}:`, feedbackData)

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedbackData
    })

  } catch (error) {
    console.error("Error submitting team feedback:", error)
    return NextResponse.json(
      { success: false, message: "Failed to submit feedback" },
      { status: 500 }
    )
  }
}