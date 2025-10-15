import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Resource from "@/lib/models/resources"

export async function GET(request: NextRequest) {
  try {
    await db()

    const { searchParams } = request.nextUrl
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const hackathon = searchParams.get("hackathon")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const query: any = {}

    if (type && type !== "all") {
      query.type = type
    }

    if (category && category !== "all") {
      query.category = category
    }

    if (hackathon) {
      query.hackathon = hackathon
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const skip = (page - 1) * limit

    const resources = await Resource.find(query)
      .populate("uploadedBy", "name email")
      .populate("hackathon", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Resource.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch resources" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await db()

    const body = await request.json()
    const { title, description, type, url, fileUrl, category, tags, uploadedBy, hackathon, isPublic } = body

    if (!title || !description || !type || !category || !uploadedBy) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const resource = new Resource({
      title,
      description,
      type,
      url,
      fileUrl,
      category,
      tags: tags || [],
      uploadedBy,
      hackathon,
      isPublic: isPublic !== undefined ? isPublic : true,
    })

    await resource.save()
    await resource.populate([
      { path: "uploadedBy", select: "name email" },
      { path: "hackathon", select: "title" },
    ])

    return NextResponse.json(
      {
        success: true,
        data: resource,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating resource:", error)
    return NextResponse.json({ success: false, error: "Failed to create resource" }, { status: 500 })
  }
}
