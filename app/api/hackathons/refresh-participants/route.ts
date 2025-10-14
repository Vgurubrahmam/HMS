import { NextResponse } from "next/server"
import { refreshParticipantCounts } from "@/lib/participant-utils"

export async function POST() {
  try {
    const result = await refreshParticipantCounts()
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error refreshing participant counts:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to refresh participant counts",
        error: error.message
      },
      { status: 500 }
    )
  }
}