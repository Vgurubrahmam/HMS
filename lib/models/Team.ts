import mongoose, { Schema, type Document } from "mongoose"

export interface ITeam extends Document {
  name: string
  hackathon: mongoose.Types.ObjectId
  members: mongoose.Types.ObjectId[]
  teamLead: mongoose.Types.ObjectId
  mentor?: mongoose.Types.ObjectId
  projectTitle: string
  projectDescription?: string
  progress: number
  status: "Active" | "Inactive" | "Completed" | "Disqualified"
  room?: string
  submissionStatus: "Planning" | "In Progress" | "Submitted" | "Evaluated"
  submissionUrl?: string
  score?: number
  rank?: number
  createdAt: Date
  updatedAt: Date
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    hackathon: { type: Schema.Types.ObjectId, ref: "hackathons" },
    members: [{ type: Schema.Types.ObjectId }],
    teamLead: { type: Schema.Types.ObjectId },
    mentor: { type: Schema.Types.ObjectId },
    projectTitle: { type: String, required: true },
    projectDescription: { type: String },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Completed", "Disqualified"],
      default: "Active",
    },
    room: { type: String },
    submissionStatus: {
      type: String,
      enum: ["Planning", "In Progress", "Submitted", "Evaluated"],
      default: "Planning",
    },
    submissionUrl: { type: String },
    score: { type: Number },
    rank: { type: Number },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.teamcreations || mongoose.model("teamcreations", TeamSchema)
