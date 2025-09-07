import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import Hackathon from "@/lib/models/Hackathon";
import mongoose from "mongoose";

interface HackathonData {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  registrationFee: number;
  maxParticipants: number;
  venue: string;
  categories: string[];
  prizes: string[];
  currentParticipants: number;
  mentorAssigned: string;
  teamsFormed: string;
  status: string;
  difficulty: string;
  organizer?: { name: string };
  requirements?: string[];
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db();

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ success: false, message: "Invalid Hackathon ID", error: "Invalid Hackathon ID" }, { status: 400 });
    }

    const hackathon = await Hackathon.findById(params.id);

    if (!hackathon) {
      return NextResponse.json({ success: false, message: "Hackathon not found", error: "Hackathon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Hackathon fetched successfully",
      data: hackathon,
    });
  } catch (error: any) {
    console.error("Error fetching hackathon:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ success: false, message: "Failed to fetch hackathon", error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

interface PutParams {
  params: {
    id: string;
  };
}

interface PutResponse {
  success: boolean;
  message: string;
  hackathon?: HackathonData;
  error?: string;
}

export async function PUT(
  req: NextRequest,
  { params }: PutParams
): Promise<NextResponse<PutResponse>> {
  try {
    await db();

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ success: false, message: "Invalid Hackathon ID", error: "Invalid Hackathon ID" }, { status: 400 });
    }

    const body = await req.json();

    // Optional: Add validation for body fields similar to POST (e.g., dates, numerics, enums)
    // For brevity, assuming partial updates; you can extend as needed

    const updatedHackathon = await Hackathon.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true, // Ensure schema validators run on update
    });

    if (!updatedHackathon) {
      return NextResponse.json({ success: false, message: "Hackathon not found", error: "Hackathon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Hackathon updated successfully",
      hackathon: updatedHackathon,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating hackathon:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ success: false, message: "Failed to update hackathon", error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

interface DeleteParams {
  params: {
    id: string;
  };
}

interface DeleteResponse {
  success: boolean;
  message: string;
  error?: string;
}

export async function DELETE(
  req: NextRequest,
  { params }: DeleteParams
): Promise<NextResponse<DeleteResponse>> {
  try {
    await db();

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ success: false, message: "Invalid Hackathon ID", error: "Invalid Hackathon ID" }, { status: 400 });
    }

    const deletedHackathon = await Hackathon.findByIdAndDelete(params.id);

    if (!deletedHackathon) {
      return NextResponse.json({ success: false, message: "Hackathon not found", error: "Hackathon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Hackathon deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting hackathon:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ success: false, message: "Failed to delete hackathon", error: error.message || "Internal Server Error" }, { status: 500 });
  }
}