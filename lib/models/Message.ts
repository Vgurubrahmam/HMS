import mongoose, { Schema, type Document } from "mongoose"

export interface IMessage extends Document {
  _id: string
  sender: mongoose.Types.ObjectId // User who sent the message
  recipient: mongoose.Types.ObjectId // User who should receive the message (mentor)
  team?: mongoose.Types.ObjectId // Team context (optional)
  hackathon?: mongoose.Types.ObjectId // Hackathon context (optional)
  subject: string
  content: string
  messageType: "direct" | "team_update" | "announcement" | "question" | "feedback_request" | "urgent"
  priority: "low" | "normal" | "high" | "urgent"
  isRead: boolean
  readAt?: Date
  attachments?: Array<{
    filename: string
    url: string
    size: number
    type: string
  }>
  replyTo?: mongoose.Types.ObjectId // Reference to message being replied to
  metadata?: {
    teamProgress?: number
    milestone?: string
    deadline?: Date
    tags?: string[]
  }
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { 
      type: Schema.Types.ObjectId, 
      ref: "users", 
      required: true 
    },
    recipient: { 
      type: Schema.Types.ObjectId, 
      ref: "users", 
      required: true 
    },
    team: { 
      type: Schema.Types.ObjectId, 
      ref: "teamcreations" 
    },
    hackathon: { 
      type: Schema.Types.ObjectId, 
      ref: "hackathons" 
    },
    subject: { 
      type: String, 
      required: true,
      maxlength: 200
    },
    content: { 
      type: String, 
      required: true,
      maxlength: 2000
    },
    messageType: {
      type: String,
      enum: ["direct", "team_update", "announcement", "question", "feedback_request", "urgent"],
      default: "direct"
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal"
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
    readAt: { 
      type: Date 
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number,
      type: String
    }],
    replyTo: { 
      type: Schema.Types.ObjectId, 
      ref: "messages" 
    },
    metadata: {
      teamProgress: Number,
      milestone: String,
      deadline: Date,
      tags: [String]
    }
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient querying
MessageSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })
MessageSchema.index({ sender: 1, createdAt: -1 })
MessageSchema.index({ team: 1, createdAt: -1 })
MessageSchema.index({ messageType: 1, priority: 1, createdAt: -1 })

export default mongoose.models.messages || mongoose.model("messages", MessageSchema)