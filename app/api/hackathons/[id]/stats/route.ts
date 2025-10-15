import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Team from "@/lib/models/Team"
import Registration from "@/lib/models/Registration"
import Profile from "@/lib/models/Profile"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db();
    const hackathonId = params.id;


    // Validate hackathon ID format
    if (!hackathonId || hackathonId.length !== 24) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid hackathon ID format" 
        }, 
        { status: 400 }
      );
    }

    // Get teams count for this hackathon
    const teamsCount = await Team.countDocuments({ 
      hackathon: hackathonId 
    });

    console.log("Teams count:", teamsCount);

    // Get current participants count from registrations
    const participantsCount = await Registration.countDocuments({ 
      hackathon: hackathonId,
      paymentStatus: { $in: ["Completed", "Paid", "Registered"] }
    });

    console.log("Participants count:", participantsCount);

    // Get mentors assigned to teams in this hackathon
    const teamsWithMentors = await Team.find({ 
      hackathon: hackathonId,
      mentor: { $exists: true, $ne: null }
    }).distinct('mentor');
    
    const mentorsCount = teamsWithMentors.length;

    console.log("Mentors count:", mentorsCount);

    const result = {
      teamsCount,
      participantsCount,
      mentorsCount,
      hackathonId
    };

    console.log("Final stats result:", result);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error fetching hackathon stats:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch hackathon statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}