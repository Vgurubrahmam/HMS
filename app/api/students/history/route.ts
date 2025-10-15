import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await db()
    
    const { searchParams } = request.nextUrl
    const department = searchParams.get('department')
    const year = searchParams.get('year')
    const semester = searchParams.get('semester')
    
    // Mock student history data - replace with actual database queries
    const studentsHistory = [
      {
        _id: "student1",
        student: {
          _id: "st1",
          username: "john_doe",
          email: "john.doe@university.edu",
          name: "John Doe",
          rollNumber: "CS2021001",
          department: "Computer Science",
          year: 3,
          semester: 6,
          avatar: "/avatars/john.jpg"
        },
        participationHistory: [
          {
            hackathon: {
              _id: "hack1",
              title: "Tech Innovation Challenge 2024",
              startDate: "2024-03-15",
              endDate: "2024-03-17",
              organizer: "Tech University"
            },
            registrationDate: "2024-03-10T10:00:00Z",
            paymentStatus: "Completed",
            paymentAmount: 500,
            teamName: "TechInnovators",
            teamPosition: null, // Ongoing
            projectTitle: "AI-Powered Learning Assistant",
            skills: ["React", "Node.js", "AI/ML"],
            certificatesEarned: [],
            hoursSpent: 24
          },
          {
            hackathon: {
              _id: "hack2", 
              title: "Green Tech Hackathon 2024",
              startDate: "2024-02-10",
              endDate: "2024-02-12",
              organizer: "EcoTech Institute"
            },
            registrationDate: "2024-02-05T14:30:00Z",
            paymentStatus: "Completed",
            paymentAmount: 300,
            teamName: "EcoInnovators",
            teamPosition: 5,
            projectTitle: "Smart Energy Monitor",
            skills: ["IoT", "Python", "Data Analytics"],
            certificatesEarned: ["Participation Certificate"],
            hoursSpent: 20
          }
        ],
        overallStats: {
          totalHackathons: 2,
          totalHoursSpent: 44,
          totalCertificates: 1,
          averagePosition: 5,
          skillsGained: ["React", "Node.js", "AI/ML", "IoT", "Python", "Data Analytics"],
          currentStreak: 1,
          totalSpent: 800
        }
      },
      {
        _id: "student2",
        student: {
          _id: "st2",
          username: "jane_smith",
          email: "jane.smith@university.edu", 
          name: "Jane Smith",
          rollNumber: "CS2021002",
          department: "Computer Science",
          year: 3,
          semester: 6,
          avatar: "/avatars/jane.jpg"
        },
        participationHistory: [
          {
            hackathon: {
              _id: "hack3",
              title: "Startup Weekend 2024",
              startDate: "2024-01-20",
              endDate: "2024-01-22", 
              organizer: "Innovation Hub"
            },
            registrationDate: "2024-01-15T09:00:00Z",
            paymentStatus: "Completed",
            paymentAmount: 400,
            teamName: "StartupStars",
            teamPosition: 2,
            projectTitle: "Local Business Platform",
            skills: ["Business Model", "UI/UX", "Marketing"],
            certificatesEarned: ["Runner-up Certificate", "Best UI/UX Award"],
            hoursSpent: 30
          }
        ],
        overallStats: {
          totalHackathons: 1,
          totalHoursSpent: 30,
          totalCertificates: 2,
          averagePosition: 2,
          skillsGained: ["Business Model", "UI/UX", "Marketing"],
          currentStreak: 1,
          totalSpent: 400
        }
      },
      {
        _id: "student3",
        student: {
          _id: "st3",
          username: "alice_johnson",
          email: "alice.johnson@university.edu",
          name: "Alice Johnson", 
          rollNumber: "IT2021001",
          department: "Information Technology",
          year: 2,
          semester: 4,
          avatar: "/avatars/alice.jpg"
        },
        participationHistory: [
          {
            hackathon: {
              _id: "hack2",
              title: "Green Tech Hackathon 2024",
              startDate: "2024-02-10",
              endDate: "2024-02-12",
              organizer: "EcoTech Institute"
            },
            registrationDate: "2024-02-06T16:20:00Z",
            paymentStatus: "Completed",
            paymentAmount: 300,
            teamName: "GreenTech",
            teamPosition: 1,
            projectTitle: "Carbon Footprint Tracker",
            skills: ["Sustainability", "Mobile Development", "Data Visualization"],
            certificatesEarned: ["Winner Certificate", "Best Innovation Award"],
            hoursSpent: 28
          }
        ],
        overallStats: {
          totalHackathons: 1,
          totalHoursSpent: 28,
          totalCertificates: 2,
          averagePosition: 1,
          skillsGained: ["Sustainability", "Mobile Development", "Data Visualization"],
          currentStreak: 1,
          totalSpent: 300
        }
      }
    ]

    // Filter by department if specified
    let filteredData = studentsHistory
    if (department && department !== 'all') {
      filteredData = studentsHistory.filter(s => s.student.department === department)
    }

    // Filter by year if specified
    if (year && year !== 'all') {
      filteredData = filteredData.filter(s => s.student.year.toString() === year)
    }

    return NextResponse.json({
      success: true,
      data: filteredData
    })

  } catch (error) {
    console.error("Error fetching student history:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch student history" },
      { status: 500 }
    )
  }
}