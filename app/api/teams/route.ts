import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Team from "@/lib/models/Team"
import UserModel from "@/lib/models/User"
import Profile from "@/lib/models/Profile"
import Hackathon from "@/lib/models/Hackathon"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await db();

    const { searchParams } = request.nextUrl;
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
      .populate("hackathon", "title description startDate endDate")
      .populate("members", "username name email role skills image")
      .populate("teamLead", "username name email role image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain objects for easier manipulation


    // Manually populate mentor data from Profile collection
    for (let team of teams) {
      if (team.mentor) {
        const mentorProfile = await Profile.findById(team.mentor).select("username email expertise department").lean();
        
        if (mentorProfile && !Array.isArray(mentorProfile)) {
          // Map username to name for UI compatibility
          team.mentor = {
            ...mentorProfile,
            name: (mentorProfile as any).username
          };
        } else {
          team.mentor = null;
        }
      }
    }

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
    
    // Explicitly register the User model to ensure it is accessible
    if (!mongoose.models.users) {
      mongoose.model("users", UserModel.schema);
    }

    console.log("Mongoose connection state:", mongoose.connection.readyState);

    const body = await request.json()
    console.log("Team creation data:", body)
    
    const { name, hackathon, members, teamLead, mentor, projectTitle, projectDescription, room } = body

    // Validate required fields
    if (!name || !hackathon || !projectTitle || !teamLead) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: name, hackathon, projectTitle, teamLead" 
      }, { status: 400 });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(hackathon)) {
      return NextResponse.json({ success: false, error: "Invalid hackathon ID" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(teamLead)) {
      return NextResponse.json({ success: false, error: "Invalid team lead ID" }, { status: 400 });
    }

    const hackathonExists = await Hackathon.findById(hackathon);
    if (!hackathonExists) {
      return NextResponse.json({ success: false, error: "Hackathon not found" }, { status: 404 });
    }

    const teamLeadUser = await UserModel.findById(teamLead);
    if (!teamLeadUser) {
      return NextResponse.json({ success: false, error: "Team lead not found" }, { status: 404 });
    }

    // Ensure teamLead is included in members array
    const allMembers = members && Array.isArray(members) ? members : [];
    if (teamLead && !allMembers.includes(teamLead)) {
      allMembers.unshift(teamLead); // Add team lead at the beginning
    }

    console.log("Final members array:", allMembers);
    console.log("Team lead:", teamLead);

    // Verify that all member IDs exist as users
    for (const memberId of allMembers) {
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        return NextResponse.json({ 
          success: false, 
          error: `Invalid member ID format: ${memberId}` 
        }, { status: 400 });
      }
      
      const userExists = await UserModel.findById(memberId);
      if (!userExists) {
        console.log(`User not found for ID: ${memberId}`);
        return NextResponse.json({ 
          success: false, 
          error: `Member with ID ${memberId} not found` 
        }, { status: 404 });
      }
      console.log(`User found: ${userExists.username || userExists.name} (${memberId})`);
    }

    const team = new Team({
      name,
      hackathon,
      members: allMembers,
      teamLead,
      mentor,
      projectTitle,
      projectDescription,
      room,
    });

    await team.save();
    console.log("Team saved, members before population:", team.members);
    
    await team.populate([
      { path: "hackathon", select: "title description startDate endDate" },
      { path: "members", select: "username name email role skills image" },
      { path: "teamLead", select: "username name email role image" },
      { path: "mentor", select: "username name email expertise image" },
    ]);

    console.log("Team after population:", {
      name: team.name,
      members: team.members,
      teamLead: team.teamLead,
      membersCount: team.members?.length
    });

    return NextResponse.json(
      {
        success: true,
        data: team,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error details:", errorMessage)
    
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create team",
      details: errorMessage
    }, { status: 500 })
  }
}
