import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await db()
    
    // Mock mentors data - replace with actual database queries
    const mentorsData = [
      {
        _id: "mentor1",
        username: "john_mentor",
        name: "John Smith",
        email: "john.mentor@university.edu",
        image: "/avatars/john_mentor.jpg",
        department: "Computer Science",
        expertise: ["React", "Node.js", "Machine Learning", "Cloud Computing"],
        experience: "5 years",
        bio: "Full-stack developer with expertise in modern web technologies and AI/ML.",
        availability: "Available",
        rating: 4.8,
        totalSessions: 25,
        activeTeams: 2,
        completedHackathons: 8,
        skills: [
          "JavaScript", "TypeScript", "React", "Node.js", 
          "Python", "Machine Learning", "AWS", "Docker"
        ],
        contact: {
          phone: "+1234567890",
          office: "Room 301, CS Building",
          officeHours: "Mon-Fri 2:00 PM - 4:00 PM"
        }
      },
      {
        _id: "mentor2", 
        username: "sarah_tech",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@university.edu",
        image: "/avatars/sarah_mentor.jpg",
        department: "Information Technology",
        expertise: ["Mobile Development", "UI/UX Design", "Database Design", "Project Management"],
        experience: "8 years",
        bio: "Senior software architect specializing in mobile applications and user experience design.",
        availability: "Available",
        rating: 4.9,
        totalSessions: 42,
        activeTeams: 3,
        completedHackathons: 15,
        skills: [
          "React Native", "Flutter", "Swift", "Kotlin",
          "UI/UX Design", "Figma", "MongoDB", "PostgreSQL"
        ],
        contact: {
          phone: "+1234567891",
          office: "Room 205, IT Building", 
          officeHours: "Tue-Thu 10:00 AM - 12:00 PM"
        }
      },
      {
        _id: "mentor3",
        username: "mike_innovation",
        name: "Michael Chen",
        email: "mike.chen@university.edu",
        image: "/avatars/mike_mentor.jpg",
        department: "Electronics Engineering",
        expertise: ["IoT Development", "Hardware Design", "Embedded Systems", "Innovation"],
        experience: "6 years",
        bio: "Hardware engineer and innovation specialist with focus on IoT and embedded systems.",
        availability: "Busy",
        rating: 4.7,
        totalSessions: 18,
        activeTeams: 1,
        completedHackathons: 6,
        skills: [
          "Arduino", "Raspberry Pi", "C/C++", "Python",
          "Circuit Design", "PCB Design", "Sensors", "Automation"
        ],
        contact: {
          phone: "+1234567892",
          office: "Room 402, EE Building",
          officeHours: "Wed-Fri 1:00 PM - 3:00 PM"
        }
      },
      {
        _id: "mentor4",
        username: "lisa_data",
        name: "Dr. Lisa Wang",
        email: "lisa.wang@university.edu",
        image: "/avatars/lisa_mentor.jpg",
        department: "Data Science",
        expertise: ["Data Analytics", "Machine Learning", "Statistical Analysis", "Big Data"],
        experience: "10 years",
        bio: "Data scientist with extensive experience in ML algorithms and big data processing.",
        availability: "Available",
        rating: 4.9,
        totalSessions: 35,
        activeTeams: 2,
        completedHackathons: 12,
        skills: [
          "Python", "R", "SQL", "TensorFlow", "PyTorch",
          "Pandas", "NumPy", "Tableau", "Apache Spark"
        ],
        contact: {
          phone: "+1234567893", 
          office: "Room 506, Data Center",
          officeHours: "Mon-Wed 3:00 PM - 5:00 PM"
        }
      }
    ]

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const availability = searchParams.get('availability')
    
    // Filter mentors if query parameters provided
    let filteredMentors = mentorsData
    
    if (department && department !== 'all') {
      filteredMentors = filteredMentors.filter(mentor => 
        mentor.department.toLowerCase().includes(department.toLowerCase())
      )
    }
    
    if (availability && availability !== 'all') {
      filteredMentors = filteredMentors.filter(mentor => 
        mentor.availability.toLowerCase() === availability.toLowerCase()
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredMentors
    })

  } catch (error) {
    console.error("Error fetching mentors:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch mentors" },
      { status: 500 }
    )
  }
}