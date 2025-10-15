import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Message from "@/lib/models/Message"
import Profile from "@/lib/models/Profile"
import User from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    await db()

    const body = await request.json()
    const {
      senderId,
      recipientId,
      teamId,
      hackathonId,
      subject,
      content,
      messageType = "direct",
      priority = "normal",
      metadata
    } = body

    // Validate required fields
    if (!senderId || !recipientId || !subject || !content) {
      return NextResponse.json({
        success: false,
        error: "Sender, recipient, subject, and content are required"
      }, { status: 400 })
    }

    // Find sender profile
    const senderProfile = await Profile.findOne({ userId: senderId })
    if (!senderProfile) {
      return NextResponse.json({
        success: false,
        error: "Sender profile not found"
      }, { status: 404 })
    }

    // Find recipient profile
    const recipientProfile = await Profile.findOne({ userId: recipientId, role: 'mentor' })
    if (!recipientProfile) {
      return NextResponse.json({
        success: false,
        error: "Mentor recipient not found"
      }, { status: 404 })
    }

    // Create new message
    const message = new Message({
      sender: senderProfile._id,
      recipient: recipientProfile._id,
      team: teamId || undefined,
      hackathon: hackathonId || undefined,
      subject,
      content,
      messageType,
      priority,
      metadata: metadata || {}
    })

    await message.save()

    // Populate the message with sender and team info before returning
    const populatedMessage = await Message.findById(message._id)
      .populate({
        path: 'sender',
        model: 'profiles',
        select: 'username email image role department'
      })
      .populate({
        path: 'recipient',
        model: 'profiles',
        select: 'username email image role'
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

    return NextResponse.json({
      success: true,
      data: populatedMessage,
      message: "Message sent successfully"
    }, { status: 201 })

  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to send message"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await db()
    
    const { searchParams } = request.nextUrl
    const senderId = searchParams.get('senderId')
    const recipientId = searchParams.get('recipientId')
    const teamId = searchParams.get('teamId')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    const query: any = {}
    
    if (senderId) {
      const senderProfile = await Profile.findOne({ userId: senderId })
      if (senderProfile) {
        query.sender = senderProfile._id
      }
    }
    
    if (recipientId) {
      const recipientProfile = await Profile.findOne({ userId: recipientId })
      if (recipientProfile) {
        query.recipient = recipientProfile._id
      }
    }
    
    if (teamId) {
      query.team = teamId
    }

    const messages = await Message.find(query)
      .populate({
        path: 'sender',
        model: 'profiles',
        select: 'username email image role department'
      })
      .populate({
        path: 'recipient',
        model: 'profiles', 
        select: 'username email image role'
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
      .limit(limit)

    return NextResponse.json({
      success: true,
      data: messages
    })

  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch messages"
    }, { status: 500 })
  }
}