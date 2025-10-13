import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    await db()
    
    const { studentId } = params
    
    // Mock achievements data - replace with actual database queries
    const achievementsData = [
      {
        _id: "achievement1",
        title: "First Time Participant",
        description: "Completed your first hackathon registration",
        type: "milestone",
        icon: "🏆",
        earnedAt: "2024-03-10T10:00:00Z",
        points: 10,
        hackathon: {
          _id: "hack1",
          title: "Tech Innovation Challenge 2024"
        }
      },
      {
        _id: "achievement2",
        title: "Idea Generator",
        description: "Successfully submitted an innovative project idea",
        type: "skill",
        icon: "💡",
        earnedAt: "2024-03-12T15:30:00Z",
        points: 20,
        hackathon: {
          _id: "hack1",
          title: "Tech Innovation Challenge 2024"
        }
      },
      {
        _id: "achievement3",
        title: "Team Player",
        description: "Collaborated effectively with team members",
        type: "collaboration",
        icon: "🤝",
        earnedAt: "2024-03-14T09:00:00Z",
        points: 15,
        hackathon: {
          _id: "hack1",
          title: "Tech Innovation Challenge 2024"
        }
      },
      {
        _id: "achievement4",
        title: "Code Warrior",
        description: "Wrote high-quality, efficient code",
        type: "technical",
        icon: "⚔️",
        earnedAt: "2024-03-15T14:22:00Z",
        points: 25,
        hackathon: {
          _id: "hack1",
          title: "Tech Innovation Challenge 2024"
        }
      }
    ]

    const stats = {
      totalAchievements: achievementsData.length,
      totalPoints: achievementsData.reduce((sum, achievement) => sum + achievement.points, 0),
      byType: {
        milestone: achievementsData.filter(a => a.type === "milestone").length,
        skill: achievementsData.filter(a => a.type === "skill").length,
        collaboration: achievementsData.filter(a => a.type === "collaboration").length,
        technical: achievementsData.filter(a => a.type === "technical").length
      },
      recentAchievements: achievementsData
        .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
        .slice(0, 3)
    }

    return NextResponse.json({
      success: true,
      data: {
        achievements: achievementsData,
        stats: stats
      }
    })

  } catch (error) {
    console.error("Error fetching student achievements:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch student achievements" },
      { status: 500 }
    )
  }
}