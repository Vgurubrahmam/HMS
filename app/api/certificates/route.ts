import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Certificate from "@/lib/models/Certificate"

export async function GET(request: NextRequest) {
  try {
    await db()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user")
    const hackathonId = searchParams.get("hackathon")
    const type = searchParams.get("type")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const query: any = {}

    if (userId) {
      query.user = userId
    }

    if (hackathonId) {
      query.hackathon = hackathonId
    }

    if (type && type !== "all") {
      query.type = type
    }

    const skip = (page - 1) * limit

    const certificates = await Certificate.find(query)
      .populate("user", "name email")
      .populate("hackathon", "title")
      .populate("team", "name")
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Certificate.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: certificates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    // console.error("Error fetching certificates:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch certificates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await db()

    const body = await request.json()
    const { user, hackathon, team, achievement, type, rank, skills } = body

    // Validate required fields
    if (!user || !hackathon || !achievement || !type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Generate unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const certificate = new Certificate({
      user,
      hackathon,
      team,
      achievement,
      type,
      rank,
      skills: skills || [],
      certificateNumber,
      verificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${certificateNumber}`,
    })

    await certificate.save()
    await certificate.populate([
      { path: "user", select: "name email" },
      { path: "hackathon", select: "title" },
      { path: "team", select: "name" },
    ])

    return NextResponse.json(
      {
        success: true,
        data: certificate,
      },
      { status: 201 },
    )
  } catch (error) {
    // console.error("Error creating certificate:", error)
    return NextResponse.json({ success: false, error: "Failed to create certificate" }, { status: 500 })
  }
}
