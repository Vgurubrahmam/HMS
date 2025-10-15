import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Message from "@/lib/models/Message"
import Profile from "@/lib/models/Profile"
import User from "@/lib/models/User"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const userId = params.id
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const messageType = searchParams.get('type')
    const unreadOnly = searchParams.get('unread') === 'true'
    
    // First, find the Profile by userId to get the profile ID
    const mentorProfile = await Profile.findOne({ userId: userId, role: 'mentor' })
    
    if (!mentorProfile) {
      return NextResponse.json({ success: false, error: "Mentor profile not found" }, { status: 404 })
    }

    // Build query for messages sent to this mentor
    const query: any = { 
      recipient: mentorProfile._id 
    }
    
    if (messageType) {
      query.messageType = messageType
    }
    
    if (unreadOnly) {
      query.isRead = false
    }

    // Get total count for pagination
    const totalMessages = await Message.countDocuments(query)
    
    // Fetch messages with populated sender and team information
    const messages = await Message.find(query)
      .populate({
        path: 'sender',
        model: 'profiles',
        select: 'username email image role department'
      })
      .populate({
        path: 'team',
        model: 'teamcreations',
        select: 'name projectTitle hackathon',
        populate: {
          path: 'hackathon',
          model: 'hackathons',
          select: 'title'
        }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    // Calculate pagination info
    const totalPages = Math.ceil(totalMessages / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          totalMessages,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        unreadCount: await Message.countDocuments({ 
          recipient: mentorProfile._id, 
          isRead: false 
        })
      }
    })

  } catch (error) {
    console.error("Error fetching mentor messages:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch mentor messages" 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db()

    const userId = params.id
    const body = await request.json()
    const { messageIds, markAsRead } = body
    
    // First, find the Profile by userId
    const mentorProfile = await Profile.findOne({ userId: userId, role: 'mentor' })
    
    if (!mentorProfile) {
      return NextResponse.json({ success: false, error: "Mentor profile not found" }, { status: 404 })
    }

    // Update read status for specified messages
    const updateQuery: any = {
      _id: { $in: messageIds },
      recipient: mentorProfile._id
    }
    
    const updateData: any = {
      isRead: markAsRead,
      ...(markAsRead && { readAt: new Date() })
    }

    const result = await Message.updateMany(updateQuery, updateData)

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} messages marked as ${markAsRead ? 'read' : 'unread'}`
      }
    })

  } catch (error) {
    console.error("Error updating message status:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update message status" 
    }, { status: 500 })
  }
}