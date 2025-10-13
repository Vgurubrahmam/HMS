import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { mentorId: string } }
) {
  try {
    await db()
    
    const { mentorId } = params
    
    // Mock mentor teams data - replace with actual database queries
    const teamsData = [
      {
        _id: "team1",
        name: "TechInnovators",
        hackathon: {
          _id: "hack1",
          title: "Tech Innovation Challenge 2024",
          startDate: "2024-03-15",
          endDate: "2024-03-17",
          status: "Active"
        },
        members: [
          {
            _id: "student1",
            username: "john_doe",
            email: "john@example.com",
            role: "Team Lead",
            skills: ["React", "Node.js"]
          },
          {
            _id: "student2", 
            username: "jane_smith",
            email: "jane@example.com",
            role: "Designer",
            skills: ["UI/UX", "Figma"]
          },
          {
            _id: "student3",
            username: "bob_wilson",
            email: "bob@example.com", 
            role: "Developer",
            skills: ["Python", "ML"]
          }
        ],
        project: {
          title: "AI-Powered Learning Assistant",
          description: "An intelligent tutoring system using machine learning",
          category: "Education Technology",
          techStack: ["React", "Node.js", "Python", "TensorFlow"],
          repositoryUrl: "https://github.com/team/project",
          status: "In Progress"
        },
        progress: {
          overall: 65,
          milestones: [
            { name: "Planning", completed: true, completedAt: "2024-03-10" },
            { name: "Design", completed: true, completedAt: "2024-03-12" },
            { name: "Development", completed: false, dueDate: "2024-03-16" },
            { name: "Testing", completed: false, dueDate: "2024-03-17" }
          ]
        },
        mentoring: {
          totalSessions: 4,
          lastSessionDate: "2024-03-13T10:00:00Z",
          nextSessionDate: "2024-03-15T14:00:00Z",
          totalHours: 6,
          avgRating: 4.5
        }
      },
      {
        _id: "team2",
        name: "EcoSolutions",
        hackathon: {
          _id: "hack2",
          title: "Green Tech Hackathon 2024",
          startDate: "2024-02-10",
          endDate: "2024-02-12",
          status: "Completed"
        },
        members: [
          {
            _id: "student4",
            username: "alice_green",
            email: "alice@example.com",
            role: "Team Lead",
            skills: ["Sustainability", "IoT"]
          },
          {
            _id: "student5",
            username: "charlie_eco",
            email: "charlie@example.com",
            role: "Data Analyst",
            skills: ["Data Science", "Python"]
          }
        ],
        project: {
          title: "Smart Waste Management System",
          description: "IoT-based waste monitoring and optimization",
          category: "Environmental Technology",
          techStack: ["IoT", "Python", "React", "MongoDB"],
          repositoryUrl: "https://github.com/team/eco-project",
          status: "Completed"
        },
        progress: {
          overall: 100,
          milestones: [
            { name: "Planning", completed: true, completedAt: "2024-02-08" },
            { name: "Design", completed: true, completedAt: "2024-02-09" },
            { name: "Development", completed: true, completedAt: "2024-02-11" },
            { name: "Testing", completed: true, completedAt: "2024-02-12" }
          ]
        },
        mentoring: {
          totalSessions: 3,
          lastSessionDate: "2024-02-11T16:00:00Z", 
          nextSessionDate: null,
          totalHours: 4.5,
          avgRating: 5.0
        },
        finalResult: {
          position: 2,
          award: "Runner-up",
          feedback: "Excellent environmental impact and technical implementation"
        }
      }
    ]

    return NextResponse.json({
      success: true,
      data: teamsData
    })

  } catch (error) {
    console.error("Error fetching mentor teams:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch mentor teams" },
      { status: 500 }
    )
  }
}