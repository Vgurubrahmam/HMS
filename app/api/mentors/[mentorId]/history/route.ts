import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { mentorId: string } }
) {
  try {
    await db()
    
    const { mentorId } = params
    
    // Mock mentoring history data - replace with actual database queries
    const historyData = [
      {
        _id: "history1",
        hackathon: {
          _id: "hack2",
          title: "Green Tech Hackathon 2024",
          startDate: "2024-02-10T00:00:00Z",
          endDate: "2024-02-12T23:59:59Z",
          organizer: "EcoTech Institute"
        },
        team: {
          _id: "team2",
          name: "EcoSolutions",
          members: [
            {
              username: "alice_green",
              email: "alice@example.com",
              image: "/avatars/alice.jpg"
            },
            {
              username: "charlie_eco", 
              email: "charlie@example.com",
              image: "/avatars/charlie.jpg"
            }
          ],
          finalPosition: 2,
          project: {
            title: "Smart Waste Management System",
            description: "IoT-based waste monitoring and optimization system for smart cities",
            techStack: ["IoT", "Python", "React", "MongoDB", "TensorFlow"]
          }
        },
        mentorshipPeriod: {
          startDate: "2024-02-08T00:00:00Z",
          endDate: "2024-02-12T23:59:59Z", 
          totalSessions: 3,
          totalHours: 4.5
        },
        performance: {
          teamProgress: 100,
          finalScore: 87,
          achievements: [
            "Second Place Winner",
            "Best Environmental Impact",
            "Most Innovative Solution"
          ],
          feedback: [
            {
              date: "2024-02-11T16:00:00Z",
              rating: 5,
              comment: "Outstanding team with excellent environmental focus and technical implementation."
            },
            {
              date: "2024-02-10T14:00:00Z", 
              rating: 4,
              comment: "Great progress on IoT integration. Strong collaboration between team members."
            }
          ]
        },
        impact: {
          skillsTransferred: [
            "IoT Development",
            "Data Analytics", 
            "Environmental Sustainability",
            "System Architecture",
            "Team Collaboration"
          ],
          studentsGrowth: [
            {
              student: "alice_green",
              skillsGained: ["IoT Development", "Leadership"],
              improvementAreas: ["Public Speaking", "Time Management"]
            },
            {
              student: "charlie_eco",
              skillsGained: ["Data Analytics", "Python"],
              improvementAreas: ["Frontend Development", "UI/UX"]
            }
          ]
        },
        certificate: {
          _id: "cert_mentor_1",
          title: "Excellence in Mentoring - Green Tech Hackathon 2024",
          issuedDate: "2024-02-15T10:00:00Z",
          certificateUrl: "/certificates/mentor_cert_1.pdf"
        }
      },
      {
        _id: "history2", 
        hackathon: {
          _id: "hack1",
          title: "Tech Innovation Challenge 2024",
          startDate: "2024-03-15T00:00:00Z",
          endDate: "2024-03-17T23:59:59Z",
          organizer: "Tech University"
        },
        team: {
          _id: "team1",
          name: "TechInnovators",
          members: [
            {
              username: "john_doe",
              email: "john@example.com",
              image: "/avatars/john.jpg"
            },
            {
              username: "jane_smith",
              email: "jane@example.com", 
              image: "/avatars/jane.jpg"
            },
            {
              username: "bob_wilson",
              email: "bob@example.com",
              image: "/avatars/bob.jpg"
            }
          ],
          finalPosition: null, // Still ongoing
          project: {
            title: "AI-Powered Learning Assistant",
            description: "Intelligent tutoring system using machine learning to personalize education",
            techStack: ["React", "Node.js", "Python", "TensorFlow", "MongoDB"]
          }
        },
        mentorshipPeriod: {
          startDate: "2024-03-10T00:00:00Z",
          endDate: "2024-03-17T23:59:59Z",
          totalSessions: 4,
          totalHours: 6
        },
        performance: {
          teamProgress: 65,
          finalScore: null, // Not completed yet
          achievements: [
            "Strong Team Formation",
            "Innovative AI Implementation",
            "Good Progress Tracking"
          ],
          feedback: [
            {
              date: "2024-03-13T10:00:00Z",
              rating: 4,
              comment: "Great technical progress. Team shows strong collaboration and innovation."
            },
            {
              date: "2024-03-11T15:00:00Z",
              rating: 5, 
              comment: "Excellent project planning and task distribution. AI implementation is promising."
            }
          ]
        },
        impact: {
          skillsTransferred: [
            "AI/Machine Learning",
            "Full-Stack Development",
            "Project Management", 
            "API Design",
            "Database Design"
          ],
          studentsGrowth: [
            {
              student: "john_doe",
              skillsGained: ["AI/ML", "Leadership", "Project Management"],
              improvementAreas: ["Testing", "Documentation"]
            },
            {
              student: "jane_smith",
              skillsGained: ["UI/UX", "React", "Design Thinking"],
              improvementAreas: ["Backend Development", "Database Design"] 
            },
            {
              student: "bob_wilson",
              skillsGained: ["Python", "Machine Learning", "Data Processing"],
              improvementAreas: ["Frontend Development", "Communication"]
            }
          ]
        },
        certificate: null // Will be issued after completion
      }
    ]

    return NextResponse.json({
      success: true,
      data: historyData
    })

  } catch (error) {
    console.error("Error fetching mentoring history:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch mentoring history" },
      { status: 500 }
    )
  }
}