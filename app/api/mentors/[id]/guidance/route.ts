import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import db from "@/lib/db"
import Team from "@/lib/models/Team"
import Profile from "@/lib/models/Profile"
import Hackathon from "@/lib/models/Hackathon"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const userId = params.id
    console.log("=== MENTOR GUIDANCE API DEBUG ===");
    console.log("Requested user ID:", userId);

    // Find the Profile by userId
    const mentorProfile = await Profile.findOne({ userId: userId, role: 'mentor' })
    console.log("Mentor profile found:", mentorProfile ? `${mentorProfile.username} (Profile ID: ${mentorProfile._id})` : "Not found");
    
    if (!mentorProfile) {
      console.log("Mentor profile not found for user ID:", userId);
      return NextResponse.json({ success: false, error: "Mentor profile not found" }, { status: 404 })
    }

    const mentorProfileId = mentorProfile._id

    // Find teams assigned to this mentor with enhanced data
    const teams = await Team.find({ mentor: mentorProfileId })
      .populate({
        path: "hackathon",
        select: "title description startDate endDate status registrationFee venue location mode prizePool"
      })
      .populate({
        path: "members",
        select: "username name email role skills profilePicture"
      })
      .populate({
        path: "teamLead",
        select: "username name email role profilePicture"
      })
      .sort({ createdAt: -1 })
      .lean()

    console.log(`Found ${teams.length} teams for mentor guidance`);

    // Transform teams for guidance dashboard
    const guidanceData = teams.map((team: any) => {
      const hackathon = team.hackathon || {}
      const members = team.members || []
      const teamLead = team.teamLead || null

      // Calculate enhanced metrics
      const totalMembers = members.length + (teamLead ? 1 : 0)
      const progress = team.progress || 0
      
      // Determine current phase based on progress and status
      let currentPhase = "Planning"
      if (progress >= 80) currentPhase = "Demo"
      else if (progress >= 60) currentPhase = "Testing"
      else if (progress >= 30) currentPhase = "Development"
      else if (progress > 0) currentPhase = "Development"

      // Mock milestones based on phase and progress
      const milestones = [
        {
          _id: `${team._id}_milestone_1`,
          title: "Project Planning & Design",
          status: progress >= 20 ? "Completed" : progress >= 10 ? "In Progress" : "Pending",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Define project scope, create wireframes, and plan architecture"
        },
        {
          _id: `${team._id}_milestone_2`,
          title: "Core Development",
          status: progress >= 50 ? "Completed" : progress >= 25 ? "In Progress" : "Pending",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Implement core features and functionality"
        },
        {
          _id: `${team._id}_milestone_3`,
          title: "Testing & Refinement",
          status: progress >= 75 ? "Completed" : progress >= 60 ? "In Progress" : "Pending",
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Test features, fix bugs, and polish the application"
        },
        {
          _id: `${team._id}_milestone_4`,
          title: "Final Presentation",
          status: progress >= 90 ? "Completed" : progress >= 80 ? "In Progress" : "Pending",
          dueDate: hackathon.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Prepare presentation and demo materials"
        }
      ]

      // Mock feedback history
      const feedback = [
        {
          _id: `${team._id}_feedback_1`,
          message: `Great progress on ${team.projectTitle || 'the project'}! Keep up the excellent work on the implementation.`,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 4,
          type: "Progress",
          mentor: mentorProfileId
        }
      ]

      // Mock recent meetings
      const meetings = [
        {
          _id: `${team._id}_meeting_1`,
          title: "Weekly Progress Check",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          attendees: members.map((m: any) => m._id),
          notes: "Discussed current progress and upcoming milestones",
          type: "Group"
        }
      ]

      return {
        _id: team._id,
        name: team.name,
        hackathon: {
          _id: hackathon._id || team.hackathon,
          title: hackathon.title || "Unknown Hackathon",
          startDate: hackathon.startDate,
          endDate: hackathon.endDate,
          status: hackathon.status || "Active",
          venue: hackathon.venue || hackathon.location || "Online",
          prizePool: hackathon.prizePool
        },
        members: members.map((member: any) => ({
          _id: member._id,
          name: member.name || member.username,
          email: member.email,
          image: member.profilePicture,
          role: member === teamLead ? "Team Lead" : "Member",
          skills: member.skills || []
        })),
        project: {
          title: team.projectTitle || "Untitled Project",
          description: team.projectDescription || "No description available",
          repository: team.submissionUrl || team.repositoryUrl || "",
          liveUrl: team.liveUrl || "",
          techStack: team.techStack || []
        },
        progress: progress,
        currentPhase: currentPhase,
        status: team.status || "Active",
        submissionStatus: team.submissionStatus || "In Progress",
        milestones: milestones,
        meetings: meetings,
        feedback: feedback,
        room: team.room,
        // Enhanced metrics for guidance
        metrics: {
          totalMembers: totalMembers,
          activeMembers: totalMembers, // Assume all are active for now
          lastActivity: team.updatedAt || team.createdAt,
          nextMilestone: milestones.find(m => m.status !== "Completed"),
          riskLevel: progress < 30 ? "high" : progress < 60 ? "medium" : "low",
          engagementScore: Math.min(100, progress + Math.random() * 20) // Mock engagement
        }
      }
    })

    // Calculate summary statistics
    const summary = {
      totalTeams: guidanceData.length,
      activeTeams: guidanceData.filter(t => t.status === "Active").length,
      averageProgress: guidanceData.length > 0 
        ? guidanceData.reduce((sum, t) => sum + t.progress, 0) / guidanceData.length 
        : 0,
      teamsAtRisk: guidanceData.filter(t => t.metrics.riskLevel === "high").length,
      upcomingMilestones: guidanceData.flatMap(t => t.milestones)
        .filter(m => m.status === "In Progress" || m.status === "Pending").length
    }

    return NextResponse.json({
      success: true,
      data: guidanceData,
      summary: summary,
      mentor: {
        id: mentorProfile._id,
        name: mentorProfile.username,
        expertise: mentorProfile.expertise || [],
        department: mentorProfile.department
      }
    })

  } catch (error) {
    console.error("Error fetching mentor guidance data:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch mentor guidance data" 
    }, { status: 500 })
  }
}