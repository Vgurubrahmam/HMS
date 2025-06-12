import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Hackathon from "@/lib/models/Hackathon"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const hackathon = await Hackathon.findById(params.id)

    if (!hackathon) {
      return NextResponse.json({ success: false, error: "Hackathon not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: hackathon,
    })
  } catch (error) {
    // console.error("Error fetching hackathon:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch hackathon" }, { status: 500 })
  }
}

// put method

interface PutParams {
  params: {
    id: string
  }
}

interface PutResponse {
  message: string
  hackathon?: any
  error?: string
}

export async function PUT(
  req: NextRequest,
  { params }: PutParams
): Promise<NextResponse<PutResponse>> {
  await db()
  const id = params.id
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid Hackathon ID" }, { status: 400 })
  }
  const body = await req.json()
  try {
    // Added logging for debugging the PUT method
    console.log("Incoming PUT request body:", body);

    const updatedHackathon = await Hackathon.findByIdAndUpdate(id, body, {
      new: true
    })

    if (!updatedHackathon) {
      // console.error("Hackathon not found:", id)
      return NextResponse.json({ message: "Hackathon not found", error: "Hackathon not found" }, { status: 400 })
    }

    // console.log("Hackathon updated successfully:", updatedHackathon)
    return NextResponse.json({ message: "Hackathon updated successfully", hackathon: updatedHackathon }, { status: 201 })
  } catch (error) {
    // console.error("Error updating hackathon:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

interface DeleteParams {
  params: {
    id: string
  }
}

interface DeleteResponse {
  message: string
}

export async function DELETE(
  req: NextRequest,
  { params }: DeleteParams
): Promise<NextResponse<DeleteResponse>> {
  await db();

  const { id } = params;
  // console.log(id);
  
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid Hackathon ID" }, { status: 400 });
  }

  try {
    const deleted = await Hackathon.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Hackathon not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hackathon deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
