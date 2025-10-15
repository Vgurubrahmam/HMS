import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Team from "@/lib/models/Team"
import Profile from "@/lib/models/Profile"
import Hackathon from "@/lib/models/Hackathon"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const userId = params.id
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // 'upcoming', 'active', 'completed', 'all'
    const search = searchParams.get('search')
    
    // First, find the Profile by userId to get the profile ID
    const mentorProfile = await Profile.findOne({ userId: userId, role: 'mentor' })
    
    if (!mentorProfile) {
      return NextResponse.json({ success: false, error: "Mentor profile not found" }, { status: 404 })
    }

    // Find all teams where this mentor is assigned
    const mentorTeams = await Team.find({ 
      mentor: mentorProfile._id 
    })
    .populate({
      path: 'hackathon',
      model: 'hackathons'
    })
    .populate({
      path: 'members',
      model: 'users',
      select: 'username email name profilePicture'
    })
    .populate({
      path: 'teamLead',
      model: 'users',
      select: 'username email name profilePicture'
    })

    // Get unique hackathon IDs
    const hackathonIds = [...new Set(mentorTeams.map(team => team.hackathon?._id?.toString()).filter(Boolean))]
    
    // Build query for hackathons
    const hackathonQuery: any = {
      _id: { $in: hackathonIds }
    }

    // Add search filter
    if (search) {
      hackathonQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } }
      ]
    }

    // Add status filter
    const now = new Date()
    if (status && status !== 'all') {
      switch (status) {
        case 'upcoming':
          hackathonQuery.startDate = { $gt: now }
          break
        case 'active':
          hackathonQuery.startDate = { $lte: now }
          hackathonQuery.endDate = { $gte: now }
          break
        case 'completed':
          hackathonQuery.endDate = { $lt: now }
          break
      }
    }

    // Fetch hackathons with pagination
    const totalHackathons = await Hackathon.countDocuments(hackathonQuery)
    const hackathons = await Hackathon.find(hackathonQuery)
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Enhance hackathons with mentor-specific data
    const enhancedHackathons = await Promise.all(
      hackathons.map(async (hackathon: any) => {
        // Get teams for this hackathon and mentor
        const hackathonTeams = mentorTeams.filter(
          team => team.hackathon?._id?.toString() === hackathon._id.toString()
        )

        // Calculate mentor-specific stats
        const teamCount = hackathonTeams.length
        const totalProgress = hackathonTeams.reduce((sum, team) => sum + (team.progress || 0), 0)
        const averageProgress = teamCount > 0 ? Math.round(totalProgress / teamCount) : 0
        const completedTeams = hackathonTeams.filter(team => 
          team.submissionStatus === 'Submitted' || team.submissionStatus === 'Evaluated'
        ).length
        const activeTeams = hackathonTeams.filter(team => 
          team.status === 'Active'
        ).length

        // Determine hackathon status
        const startDate = new Date(hackathon.startDate)
        const endDate = new Date(hackathon.endDate)
        let hackathonStatus = 'upcoming'
        
        if (endDate < now) {
          hackathonStatus = 'completed'
        } else if (startDate <= now && endDate >= now) {
          hackathonStatus = 'active'
        }

        // Get team details with members
        const teamsDetails = hackathonTeams.map(team => ({
          _id: team._id,
          name: team.name,
          projectTitle: team.projectTitle,
          progress: team.progress || 0,
          status: team.status,
          submissionStatus: team.submissionStatus,
          memberCount: team.members?.length || 0,
          members: team.members?.map((member: any) => ({
            _id: member._id,
            name: member.name || member.username,
            email: member.email,
            image: member.profilePicture
          })) || [],
          teamLead: team.teamLead ? {
            _id: team.teamLead._id,
            name: team.teamLead.name || team.teamLead.username,
            email: team.teamLead.email,
            image: team.teamLead.profilePicture
          } : null,
          room: team.room,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt
        }))

        return {
          ...hackathon,
          status: hackathonStatus,
          mentorStats: {
            teamCount,
            averageProgress,
            completedTeams,
            activeTeams,
            totalStudents: hackathonTeams.reduce((sum, team) => sum + (team.members?.length || 0), 0)
          },
          teams: teamsDetails,
          daysUntilStart: startDate > now ? Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
          daysUntilEnd: endDate > now ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
          daysElapsed: endDate < now ? Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) : null
        }
      })
    )

    // Calculate pagination info
    const totalPages = Math.ceil(totalHackathons / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Calculate summary statistics
    const allMentorTeams = mentorTeams
    const summaryStats = {
      totalHackathons: hackathonIds.length,
      activeHackathons: enhancedHackathons.filter(h => h.status === 'active').length,
      upcomingHackathons: enhancedHackathons.filter(h => h.status === 'upcoming').length,
      completedHackathons: enhancedHackathons.filter(h => h.status === 'completed').length,
      totalTeams: allMentorTeams.length,
      totalStudents: allMentorTeams.reduce((sum, team) => sum + (team.members?.length || 0), 0),
      averageTeamProgress: allMentorTeams.length > 0 
        ? Math.round(allMentorTeams.reduce((sum, team) => sum + (team.progress || 0), 0) / allMentorTeams.length)
        : 0,
      completedTeamSubmissions: allMentorTeams.filter(team => 
        team.submissionStatus === 'Submitted' || team.submissionStatus === 'Evaluated'
      ).length
    }

    return NextResponse.json({
      success: true,
      data: {
        hackathons: enhancedHackathons,
        pagination: {
          page,
          limit,
          totalHackathons,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        summary: summaryStats
      }
    })

  } catch (error) {
    console.error("Error fetching mentor hackathons:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch mentor hackathons" 
    }, { status: 500 })
  }
}