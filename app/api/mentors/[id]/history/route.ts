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
    console.log("=== MENTOR HISTORY API DEBUG ===");
    console.log("Requested user ID:", userId);

    // Find the Profile by userId
    const mentorProfile = await Profile.findOne({ userId: userId, role: 'mentor' })
    console.log("Mentor profile found:", mentorProfile ? `${mentorProfile.username} (Profile ID: ${mentorProfile._id})` : "Not found");
    
    if (!mentorProfile) {
      console.log("Mentor profile not found for user ID:", userId);
      return NextResponse.json({ success: false, error: "Mentor profile not found" }, { status: 404 })
    }

    const mentorProfileId = mentorProfile._id

    // Find all teams this mentor has worked with (including completed ones)
    const teams = await Team.find({ mentor: mentorProfileId })
      .populate({
        path: "hackathon",
        select: "title description startDate endDate status organizer prizePool venue"
      })
      .populate({
        path: "members",
        select: "username name email profilePicture skills"
      })
      .populate({
        path: "teamLead",
        select: "username name email profilePicture"
      })
      .sort({ createdAt: -1 })
      .lean()

    console.log(`Found ${teams.length} teams for mentoring history`);

    // Transform teams into mentoring history records
    const mentoringHistory = teams.map((team: any, index: number) => {
      const hackathon = team.hackathon || {}
      const members = team.members || []
      const teamLead = team.teamLead || null

      // Calculate mentorship duration
      const hackathonStart = new Date(hackathon.startDate || Date.now())
      const hackathonEnd = new Date(hackathon.endDate || Date.now())
      const durationDays = Math.max(1, Math.ceil((hackathonEnd.getTime() - hackathonStart.getTime()) / (1000 * 60 * 60 * 24)))
      
      // Mock mentoring sessions and hours based on team progress and hackathon duration
      const progress = team.progress || 0
      const estimatedSessions = Math.max(3, Math.ceil(durationDays / 7) * 2) // Roughly 2 sessions per week
      const estimatedHours = estimatedSessions * 1.5 // 1.5 hours per session average

      // Generate mock feedback based on team performance
      const generateFeedback = () => {
        const feedbackMessages = [
          "Excellent mentorship! Really helped our team stay focused and overcome technical challenges.",
          "Great guidance throughout the project. Always available when we needed help.",
          "Provided valuable insights that improved our project significantly.",
          "Helped us structure our approach and learn new technologies effectively.",
          "Amazing mentor! Made complex concepts easy to understand."
        ]
        
        const rating = progress >= 80 ? 5 : progress >= 60 ? 4 : progress >= 40 ? 3 : 2
        return [{
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          rating: rating,
          comment: feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
        }]
      }

      // Mock final position based on progress (higher progress = better chance of top position)
      let finalPosition: number | undefined
      if (progress >= 90) {
        finalPosition = Math.floor(Math.random() * 3) + 1 // Top 3
      } else if (progress >= 70) {
        finalPosition = Math.floor(Math.random() * 7) + 4 // 4-10
      } else if (progress >= 50) {
        finalPosition = Math.floor(Math.random() * 10) + 11 // 11-20
      }

      // Mock skills transferred based on team's tech stack and project type
      const commonSkills = [
        "React Development", "Node.js", "Database Design", "API Development",
        "UI/UX Design", "Project Management", "Team Collaboration", "Problem Solving",
        "Code Review", "Testing", "Deployment", "Version Control"
      ]
      const skillsTransferred = commonSkills.slice(0, Math.floor(Math.random() * 6) + 3)

      // Mock achievements based on team performance
      const achievements = []
      if (progress >= 90) achievements.push("Outstanding Project Completion")
      if (finalPosition && finalPosition <= 3) achievements.push("Top 3 Finish")
      if (progress >= 100) achievements.push("Full Feature Implementation")
      if (team.submissionStatus === "Submitted") achievements.push("Successful Project Submission")

      // Generate student growth data
      const studentsGrowth = members.map((member: any) => ({
        student: member.username || member.name,
        skillsGained: skillsTransferred.slice(0, Math.floor(Math.random() * 4) + 2),
        improvementAreas: ["Communication", "Technical Skills", "Project Planning"].slice(0, Math.floor(Math.random() * 2) + 1)
      }))

      // Mock certificate for successful mentoring (top performing teams)
      let certificate = undefined
      if (finalPosition && finalPosition <= 3) {
        certificate = {
          _id: `cert_${team._id}`,
          title: `Excellence in Mentoring - ${hackathon.title}`,
          issuedDate: new Date(hackathonEnd.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          certificateUrl: `https://certificates.hackathon.com/mentor/${team._id}`
        }
      }

      return {
        _id: team._id,
        hackathon: {
          _id: hackathon._id || team.hackathon,
          title: hackathon.title || "Unknown Hackathon",
          startDate: hackathon.startDate || new Date().toISOString(),
          endDate: hackathon.endDate || new Date().toISOString(),
          organizer: hackathon.organizer || "Hackathon Organization"
        },
        team: {
          _id: team._id,
          name: team.name,
          members: members.map((member: any) => ({
            username: member.username || member.name,
            email: member.email,
            image: member.profilePicture
          })),
          finalPosition: finalPosition,
          project: {
            title: team.projectTitle || "Untitled Project",
            description: team.projectDescription || "No description available",
            techStack: team.techStack || ["JavaScript", "React", "Node.js"]
          }
        },
        mentorshipPeriod: {
          startDate: hackathonStart.toISOString(),
          endDate: hackathonEnd.toISOString(),
          totalSessions: estimatedSessions,
          totalHours: Math.round(estimatedHours)
        },
        performance: {
          teamProgress: progress,
          finalScore: finalPosition ? Math.max(60, 100 - (finalPosition - 1) * 10) : undefined,
          achievements: achievements,
          feedback: generateFeedback()
        },
        impact: {
          skillsTransferred: skillsTransferred,
          studentsGrowth: studentsGrowth
        },
        certificate: certificate
      }
    })

    // Calculate summary statistics
    const totalHackathons = mentoringHistory.length
    const totalTeams = mentoringHistory.length
    const totalStudents = mentoringHistory.reduce((sum, record) => sum + record.team.members.length, 0)
    const totalHours = mentoringHistory.reduce((sum, record) => sum + record.mentorshipPeriod.totalHours, 0)
    
    const allRatings = mentoringHistory.flatMap(record => record.performance.feedback.map(f => f.rating))
    const averageTeamRating = allRatings.length > 0 ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length : 0
    
    const successfulCompletions = mentoringHistory.filter(record => record.performance.teamProgress >= 90).length
    const topPerformingTeams = mentoringHistory.filter(record => record.team.finalPosition && record.team.finalPosition <= 3).length
    
    const allSkills = mentoringHistory.flatMap(record => record.impact.skillsTransferred)
    const uniqueSkills = Array.from(new Set(allSkills))

    const summary = {
      totalHackathons,
      totalTeams,
      totalStudents,
      totalHours,
      averageTeamRating: Math.round(averageTeamRating * 10) / 10,
      successfulCompletions,
      topPerformingTeams,
      skillsTransferred: uniqueSkills
    }

    return NextResponse.json({
      success: true,
      data: mentoringHistory,
      summary: summary,
      mentor: {
        id: mentorProfile._id,
        name: mentorProfile.username,
        expertise: mentorProfile.expertise || [],
        department: mentorProfile.department
      }
    })

  } catch (error) {
    console.error("Error fetching mentoring history:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch mentoring history" 
    }, { status: 500 })
  }
}