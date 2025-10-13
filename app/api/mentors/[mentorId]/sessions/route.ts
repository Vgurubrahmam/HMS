import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { mentorId: string } }
) {
  try {
    await db()
    
    const { mentorId } = params
    
    // Mock mentor sessions data - replace with actual database queries
    const sessionsData = [
      {
        _id: "session1",
        title: "Project Planning & Architecture",
        team: {
          _id: "team1",
          name: "TechInnovators"
        },
        hackathon: {
          _id: "hack1",
          title: "Tech Innovation Challenge 2024"
        },
        scheduledAt: "2024-03-15T14:00:00Z",
        duration: 60,
        type: "Video Call",
        status: "Scheduled",
        agenda: [
          "Review project progress",
          "Discuss technical challenges", 
          "Plan next sprint"
        ],
        meetingLink: "https://meet.google.com/abc-def-ghi",
        notes: null
      },
      {
        _id: "session2",
        title: "Code Review & Best Practices",
        team: {
          _id: "team1",
          name: "TechInnovators"
        },
        hackathon: {
          _id: "hack1", 
          title: "Tech Innovation Challenge 2024"
        },
        scheduledAt: "2024-03-13T10:00:00Z",
        duration: 90,
        type: "Video Call",
        status: "Completed",
        agenda: [
          "Review frontend components",
          "Optimize backend APIs",
          "Security best practices"
        ],
        meetingLink: "https://meet.google.com/xyz-abc-def",
        notes: "Great progress on the UI. Suggested improvements to API structure. Team is well-coordinated.",
        feedback: {
          teamPreparation: 4,
          participation: 5,
          technicalProgress: 4,
          overallRating: 4.5,
          comments: "Team shows strong technical skills and good collaboration."
        }
      },
      {
        _id: "session3",
        title: "Final Presentation Prep",
        team: {
          _id: "team2",
          name: "EcoSolutions"
        },
        hackathon: {
          _id: "hack2",
          title: "Green Tech Hackathon 2024"
        },
        scheduledAt: "2024-02-11T16:00:00Z",
        duration: 45,
        type: "In-Person",
        status: "Completed",
        agenda: [
          "Practice final presentation",
          "Demo preparation",
          "Q&A session prep"
        ],
        location: "Room 201, Tech Building",
        notes: "Excellent presentation skills. Demo runs smoothly. Team is ready for final pitch.",
        feedback: {
          teamPreparation: 5,
          participation: 5,
          technicalProgress: 5,
          overallRating: 5.0,
          comments: "Outstanding team with great potential. Ready for competition."
        }
      }
    ]

    return NextResponse.json({
      success: true,
      data: sessionsData
    })

  } catch (error) {
    console.error("Error fetching mentor sessions:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch mentor sessions" },
      { status: 500 }
    )
  }
}