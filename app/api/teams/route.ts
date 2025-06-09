import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Team from "@/lib/models/Team"
import UserModel from "@/lib/models/User"
import Hackathon from "@/lib/models/Hackathon"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  await db()
   try{
    // Define the TeamsData type based on your Team schema
    type TeamsData = {
      _id: string;
      name: string;
      hackathon: mongoose.Types.ObjectId;
      members: mongoose.Types.ObjectId[];
      teamLead: mongoose.Types.ObjectId;
      mentor?: mongoose.Types.ObjectId;
      projectTitle: string;
      projectDescription?: string;
      room?: string;
      createdAt?: Date;
      updatedAt?: Date;
    };

    const data: TeamsData[] = await Team.find();
    return NextResponse.json(
         { message: "Teams  Feteched  successfully", data },
         { status: 201 }
       );
     } catch (error) {
       console.error("Error fetching hackathons:", error);
       return NextResponse.json({ message: "Internal Server Error" } );
     }
}


// Detailed GET endpoint with filtering, pagination, and population
export async function GETDetailed(request: NextRequest) {
  try {
    await db();

    const { searchParams } = new URL(request.url);
    const hackathonId = searchParams.get("hackathon");
    const mentorId = searchParams.get("mentor");
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    const query: any = {};

    if (hackathonId) {
      query.hackathon = hackathonId;
    }

    if (mentorId) {
      query.mentor = mentorId;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const teams = await Team.find(query)
      .populate("hackathon", "title")
      .populate("members", "name email role")
      .populate("teamLead", "name email")
      .populate("mentor", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Team.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: teams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await db()
    console.log("called teams");
    
    // Explicitly register the User model to ensure it is accessible
    if (!mongoose.models.users) {
      mongoose.model("users", UserModel.schema);
    }

    console.log("Mongoose connection state:", mongoose.connection.readyState);

    const body = await request.json()
    const { name, hackathon, members, teamLead, mentor, projectTitle, projectDescription, room } = body

    const hackathonExists = await Hackathon.findById(hackathon);
    if (!hackathonExists) {
      return NextResponse.json({ success: false, error: "Hackathon not found" }, { status: 404 });
    }

    const teamLeadUser = await UserModel.findById(teamLead);
    if (!teamLeadUser) {
      return NextResponse.json({ success: false, error: "Team lead not found" }, { status: 404 });
    }

    const team = new Team({
      name,
      hackathon,
      members: members || [teamLead],
      teamLead,
      mentor,
      projectTitle,
      projectDescription,
      room,
    });

    await team.save();
    await team.populate([
      { path: "hackathon", select: "title" },
      { path: "members", select: "name email role" },
      { path: "teamLead", select: "name email" },
      { path: "mentor", select: "name email" },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: team,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ success: false, error: "Failed to create team" }, { status: 500 })
  }
}
