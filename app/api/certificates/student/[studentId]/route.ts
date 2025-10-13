import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    await db()
    
    const { studentId } = params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    // Mock certificates data - replace with actual database queries
    const certificatesData = [
      {
        _id: "cert1",
        certificateNumber: "HMS-2024-001",
        student: {
          _id: studentId,
          name: "John Doe",
          email: "john.doe@example.com"
        },
        hackathon: {
          _id: "hack1",
          title: "Tech Innovation Challenge 2024",
          organizer: "Tech University",
          startDate: "2024-03-15",
          endDate: "2024-03-17"
        },
        achievement: "First Place Winner",
        type: "Winner",
        rank: 1,
        issueDate: "2024-03-20T10:00:00Z",
        verificationUrl: `https://verify.hackathon.com/cert1`,
        certificateUrl: `https://certificates.hackathon.com/cert1.pdf`,
        skills: ["React", "Node.js", "MongoDB", "AI/ML", "Team Leadership"],
        description: "Awarded for developing an innovative AI-powered solution that ranked first among 100+ participating teams.",
        issuer: {
          name: "Dr. Tech Dean",
          title: "Dean of Computer Science",
          organization: "Tech University"
        }
      },
      {
        _id: "cert2",
        certificateNumber: "HMS-2024-002",
        student: {
          _id: studentId,
          name: "John Doe",
          email: "john.doe@example.com"
        },
        hackathon: {
          _id: "hack2",
          title: "Green Tech Hackathon 2024",
          organizer: "EcoTech Institute",
          startDate: "2024-02-10",
          endDate: "2024-02-12"
        },
        achievement: "Best Environmental Impact",
        type: "Special Award",
        issueDate: "2024-02-15T14:30:00Z",
        verificationUrl: `https://verify.hackathon.com/cert2`,
        certificateUrl: `https://certificates.hackathon.com/cert2.pdf`,
        skills: ["Sustainability", "IoT", "Data Analytics", "Environmental Science"],
        description: "Recognized for creating a solution with exceptional environmental impact and sustainability focus.",
        issuer: {
          name: "Prof. Green Leader",
          title: "Environmental Tech Director",
          organization: "EcoTech Institute"
        }
      },
      {
        _id: "cert3",
        certificateNumber: "HMS-2024-003",
        student: {
          _id: studentId,
          name: "John Doe",
          email: "john.doe@example.com"
        },
        hackathon: {
          _id: "hack3",
          title: "Startup Weekend 2024",
          organizer: "Innovation Hub",
          startDate: "2024-01-20",
          endDate: "2024-01-22"
        },
        achievement: "Successful Participation",
        type: "Participation",
        issueDate: "2024-01-25T09:00:00Z",
        verificationUrl: `https://verify.hackathon.com/cert3`,
        certificateUrl: `https://certificates.hackathon.com/cert3.pdf`,
        skills: ["Entrepreneurship", "Business Model", "Pitching", "Market Research"],
        description: "Certificate of successful participation and completion of all hackathon requirements.",
        issuer: {
          name: "Startup Mentor",
          title: "Innovation Director",
          organization: "Innovation Hub"
        }
      }
    ]

    // Filter by type if specified
    let filteredCertificates = certificatesData
    if (type && type !== 'all') {
      filteredCertificates = certificatesData.filter(cert => cert.type === type)
    }

    return NextResponse.json({
      success: true,
      data: filteredCertificates
    })

  } catch (error) {
    console.error("Error fetching student certificates:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch student certificates" },
      { status: 500 }
    )
  }
}