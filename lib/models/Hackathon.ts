import mongoose, { Schema, type Document } from "mongoose"

export interface IHackathon extends Document {
  title: string
  description: string
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  registrationFee: number
  maxParticipants: number
  currentParticipants: number
  venue: string
  status: "Planning" | "Registration Open" | "Active" | "Completed" | "Cancelled"
  categories: string[]
  prizes: string[]
  requirements: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  createdAt: Date
  updatedAt: Date
  teamsFormed: string // Changed to number type
  mentorAssigned: string // Changed to number type
}

const HackathonSchema = new Schema<IHackathon>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    registrationFee: { type: Number, required: true, default: 0 },
    maxParticipants: { type: Number, required: true },
    currentParticipants: { type: Number, default: 0 },
    venue: { type: String, required: true },
    status: {
      type: String,
      enum: ["Planning", "Registration Open", "Active", "Completed", "Cancelled"],
      default: "Planning",
    },
    categories: [{ type: String }],
    prizes: [{ type: String }],
    requirements: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    teamsFormed: { type: String, required:true }, // Updated to number type
    mentorAssigned: { type: String, required:true }, // Updated to number type
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.hackathons || mongoose.model<IHackathon>("hackathons", HackathonSchema)
