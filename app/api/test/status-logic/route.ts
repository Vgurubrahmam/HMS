import { NextRequest, NextResponse } from "next/server"
import { getHackathonStatus, forceStatusCalculation } from "@/lib/status-utils"

/**
 * Quick test API to check status calculation without database
 */
export async function GET(request: NextRequest) {
  try {
    // Create a test hackathon matching your scenario
    const testHackathon = {
      title: "AI THON",
      registrationDeadline: "2025-11-12T23:59:59.000Z", // 12/11/2025 (yesterday)
      startDate: "2025-11-15T09:00:00.000Z", // 15/11/2025
      endDate: "2025-11-17T17:00:00.000Z", // 17/11/2025
      status: "Registration Open" // Current incorrect status
    }

    
    // Test with different deadline formats
    const testCases = [
      {
        name: "ISO Format (Database format)",
        hackathon: { ...testHackathon, registrationDeadline: "2025-11-12T23:59:59.000Z" }
      },
      {
        name: "DD/MM/YYYY Format", 
        hackathon: { ...testHackathon, registrationDeadline: "12/11/2025" }
      },
      {
        name: "MM/DD/YYYY Format",
        hackathon: { ...testHackathon, registrationDeadline: "11/12/2025" }
      }
    ]

    const results = testCases.map(testCase => {
      const result = getHackathonStatus(testCase.hackathon)
      
      return {
        testCase: testCase.name,
        inputDeadline: testCase.hackathon.registrationDeadline,
        calculatedStatus: result.status,
        shouldBeClosed: result.status === "Registration Closed",
        phase: result.phase,
        canRegister: result.canRegister
      }
    })

    // Current system info
    const now = new Date()
    
    return NextResponse.json({
      success: true,
      message: "Status calculation test completed",
      currentTime: {
        iso: now.toISOString(),
        local: now.toLocaleString(),
        timestamp: now.getTime()
      },
      testScenario: {
        description: "AI THON with registration deadline of 12/11/2025",
        currentDate: "13/11/2025",
        expectedStatus: "Registration Closed",
        reason: "Current date (13/11) is after deadline (12/11)"
      },
      testResults: results,
      recommendation: results.every(r => r.shouldBeClosed) 
        ? "✅ All test cases correctly identify deadline as passed"
        : "❌ Some test cases are failing - check date parsing logic"
    })

  } catch (error: any) {
    console.error("Error in status test:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test status calculation",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * Test with current system date and time
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { registrationDeadline = "12/11/2025" } = body

    const testHackathon = {
      title: "AI THON - Live Test",
      registrationDeadline,
      startDate: "2025-11-15T09:00:00.000Z",
      endDate: "2025-11-17T17:00:00.000Z", 
      status: "Registration Open"
    }

    
    const result = forceStatusCalculation(testHackathon)
    
    return NextResponse.json({
      success: true,
      input: testHackathon,
      output: result,
      isCorrect: result.status === "Registration Closed",
      message: result.status === "Registration Closed" 
        ? "✅ Correctly identified as Registration Closed"
        : "❌ Still showing as Registration Open - needs investigation"
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run live test",
        details: error.message,
      },
      { status: 500 }
    )
  }
}