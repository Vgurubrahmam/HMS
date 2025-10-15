import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import db from "@/lib/db"
import Team from "@/lib/models/Team"
import Profile from "@/lib/models/Profile"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const userId = params.id
    console.log("=== MENTOR TEAMS API DEBUG ===");
    console.log("Requested user ID:", userId);

    // First, find the Profile by userId (which links to User collection)
    const mentorProfile = await Profile.findOne({ userId: userId, role: 'mentor' })
    console.log("Mentor profile found:", mentorProfile ? `${mentorProfile.username} (Profile ID: ${mentorProfile._id})` : "Not found");
    
    if (!mentorProfile) {
      console.log("Mentor profile not found for user ID:", userId);
      return NextResponse.json({ success: false, error: "Mentor profile not found" }, { status: 404 })
    }

    const mentorProfileId = mentorProfile._id

    // Find teams assigned to this mentor's Profile ID
    console.log("Searching for teams with mentor Profile ID:", mentorProfileId);
    const teams = await Team.find({ mentor: mentorProfileId })
      .populate("hackathon", "title description startDate endDate")
      .populate("members", "username name email role skills image")
      .populate("teamLead", "username name email role image")
      .sort({ createdAt: -1 })
      .lean()

    console.log(`Found ${teams.length} teams for mentor profile ${mentorProfileId}`);
    teams.forEach((team: any) => {
      console.log(`- Team: ${team.name}, Mentor ID in DB: ${team.mentor}`);
    });

    // Manually populate mentor data for consistency
    for (let team of teams) {
      if (team.mentor) {
        const mentorProfile = await Profile.findById(team.mentor).select("username email expertise department").lean()
        if (mentorProfile && !Array.isArray(mentorProfile)) {
          team.mentor = {
            ...mentorProfile,
            name: (mentorProfile as any).username
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      teams: teams,
      count: teams.length
    })

  } catch (error) {
    console.error("Error fetching mentor teams:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch mentor teams" 
    }, { status: 500 })
  }
}