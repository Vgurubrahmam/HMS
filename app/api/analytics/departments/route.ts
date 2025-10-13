import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await db()
    
    // Mock department analytics data - replace with actual database queries
    const departmentAnalytics = [
      {
        _id: "dept1",
        department: "Computer Science",
        totalStudents: 45,
        activeParticipants: 28,
        participationRate: 62.2,
        totalHackathons: 12,
        averageTeamSize: 3.2,
        hackathonStats: {
          totalParticipations: 85,
          winners: 8,
          runnerUps: 12,
          participations: 65,
          winRate: 9.4
        },
        skillsDistribution: [
          { skill: "React", students: 15, percentage: 53.6 },
          { skill: "Node.js", students: 12, percentage: 42.9 },
          { skill: "Python", students: 18, percentage: 64.3 },
          { skill: "AI/ML", students: 8, percentage: 28.6 },
          { skill: "Database", students: 10, percentage: 35.7 }
        ],
        monthlyParticipation: [
          { month: "Jan", participations: 12 },
          { month: "Feb", participations: 18 },
          { month: "Mar", participations: 25 },
          { month: "Apr", participations: 15 },
          { month: "May", participations: 8 },
          { month: "Jun", participations: 7 }
        ],
        topPerformers: [
          {
            student: {
              name: "John Doe",
              rollNumber: "CS2021001",
              year: 3
            },
            hackathons: 3,
            wins: 1,
            totalHours: 72
          },
          {
            student: {
              name: "Jane Smith", 
              rollNumber: "CS2021002",
              year: 3
            },
            hackathons: 2,
            wins: 1,
            totalHours: 48
          }
        ]
      },
      {
        _id: "dept2",
        department: "Information Technology",
        totalStudents: 38,
        activeParticipants: 22,
        participationRate: 57.9,
        totalHackathons: 8,
        averageTeamSize: 2.8,
        hackathonStats: {
          totalParticipations: 56,
          winners: 5,
          runnerUps: 8,
          participations: 43,
          winRate: 8.9
        },
        skillsDistribution: [
          { skill: "Mobile Development", students: 12, percentage: 54.5 },
          { skill: "Web Development", students: 16, percentage: 72.7 },
          { skill: "Data Analytics", students: 9, percentage: 40.9 },
          { skill: "IoT", students: 7, percentage: 31.8 },
          { skill: "UI/UX", students: 14, percentage: 63.6 }
        ],
        monthlyParticipation: [
          { month: "Jan", participations: 8 },
          { month: "Feb", participations: 12 },
          { month: "Mar", participations: 18 },
          { month: "Apr", participations: 10 },
          { month: "May", participations: 5 },
          { month: "Jun", participations: 3 }
        ],
        topPerformers: [
          {
            student: {
              name: "Alice Johnson",
              rollNumber: "IT2021001", 
              year: 2
            },
            hackathons: 2,
            wins: 1,
            totalHours: 45
          }
        ]
      },
      {
        _id: "dept3",
        department: "Electronics Engineering",
        totalStudents: 32,
        activeParticipants: 15,
        participationRate: 46.9,
        totalHackathons: 6,
        averageTeamSize: 3.0,
        hackathonStats: {
          totalParticipations: 38,
          winners: 3,
          runnerUps: 5,
          participations: 30,
          winRate: 7.9
        },
        skillsDistribution: [
          { skill: "IoT", students: 8, percentage: 53.3 },
          { skill: "Embedded Systems", students: 10, percentage: 66.7 },
          { skill: "Hardware Design", students: 12, percentage: 80.0 },
          { skill: "Sensors", students: 9, percentage: 60.0 },
          { skill: "Automation", students: 6, percentage: 40.0 }
        ],
        monthlyParticipation: [
          { month: "Jan", participations: 5 },
          { month: "Feb", participations: 8 },
          { month: "Mar", participations: 12 },
          { month: "Apr", participations: 7 },
          { month: "May", participations: 4 },
          { month: "Jun", participations: 2 }
        ],
        topPerformers: [
          {
            student: {
              name: "Bob Wilson",
              rollNumber: "EE2021001",
              year: 3
            },
            hackathons: 2,
            wins: 1,
            totalHours: 40
          }
        ]
      }
    ]

    // Calculate summary statistics
    const summary = {
      totalDepartments: departmentAnalytics.length,
      totalStudents: departmentAnalytics.reduce((sum, dept) => sum + dept.totalStudents, 0),
      totalActiveParticipants: departmentAnalytics.reduce((sum, dept) => sum + dept.activeParticipants, 0),
      overallParticipationRate: departmentAnalytics.reduce((sum, dept) => sum + dept.participationRate, 0) / departmentAnalytics.length,
      totalHackathonParticipations: departmentAnalytics.reduce((sum, dept) => sum + dept.hackathonStats.totalParticipations, 0),
      totalWinners: departmentAnalytics.reduce((sum, dept) => sum + dept.hackathonStats.winners, 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        departments: departmentAnalytics,
        summary: summary
      }
    })

  } catch (error) {
    console.error("Error fetching department analytics:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch department analytics" },
      { status: 500 }
    )
  }
}