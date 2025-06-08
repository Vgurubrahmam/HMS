import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Resource from "@/lib/models/resources"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const resource = await Resource.findById(params.id)
      .populate("uploadedBy", "name email")
      .populate("hackathon", "title")

    if (!resource) {
      return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: resource,
    })
  } catch (error) {
    console.error("Error fetching resource:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch resource" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const body = await request.json()

    const resource = await Resource.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate([
      { path: "uploadedBy", select: "name email" },
      { path: "hackathon", select: "title" },
    ])

    if (!resource) {
      return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: resource,
    })
  } catch (error) {
    console.error("Error updating resource:", error)
    return NextResponse.json({ success: false, error: "Failed to update resource" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const resource = await Resource.findByIdAndDelete(params.id)

    if (!resource) {
      return NextResponse.json({ success: false, error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json({ success: false, error: "Failed to delete resource" }, { status: 500 })
  }
}
