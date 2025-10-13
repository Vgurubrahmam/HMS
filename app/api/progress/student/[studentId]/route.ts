import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    await db()
    
    const { studentId } = params
    
    // Mock progress data - replace with actual database queries
    const progressData = [
      {
        _id: "1",
        hackathon: {
          _id: "hack1",
          title: "Tech Innovation Challenge 2024",
          startDate: "2024-03-15",
          endDate: "2024-03-17"
        },
        milestones: [
          {
            _id: "m1",
            title: "Team Formation",
            description: "Form your team and register",
            completed: true,
            completedAt: "2024-03-10T10:00:00Z",
            points: 10
          },
          {
            _id: "m2",
            title: "Idea Submission",
            description: "Submit your hackathon idea",
            completed: true,
            completedAt: "2024-03-12T15:30:00Z",
            points: 20
          },
          {
            _id: "m3",
            title: "Prototype Development",
            description: "Build your prototype",
            completed: false,
            dueDate: "2024-03-16T23:59:59Z",
            points: 30
          },
          {
            _id: "m4",
            title: "Final Submission",
            description: "Submit your final project",
            completed: false,
            dueDate: "2024-03-17T18:00:00Z",
            points: 40
          }
        ],
        currentPhase: "Development",
        overallProgress: 60,
        totalPoints: 30,
        maxPoints: 100,
        feedback: [
          {
            _id: "f1",
            milestone: "m1",
            mentor: "John Doe",
            comment: "Great team formation! Good mix of skills.",
            rating: 5,
            timestamp: "2024-03-10T12:00:00Z"
          },
          {
            _id: "f2",
            milestone: "m2",
            mentor: "Jane Smith",
            comment: "Innovative idea with good market potential.",
            rating: 4,
            timestamp: "2024-03-12T16:00:00Z"
          }
        ]
      }
    ]

    return NextResponse.json({
      success: true,
      data: progressData
    })

  } catch (error) {
    console.error("Error fetching student progress:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch student progress" },
      { status: 500 }
    )
  }
}