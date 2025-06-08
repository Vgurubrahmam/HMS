import mongoose, { Schema, type Document } from "mongoose"

export interface ICertificate extends Document {
  user: mongoose.Types.ObjectId
  hackathon: mongoose.Types.ObjectId
  team?: mongoose.Types.ObjectId
  achievement: string
  type: "Winner" | "Participation" | "Special Award"
  rank?: number
  skills: string[]
  certificateNumber: string
  issueDate: Date
  verificationUrl: string
  createdAt: Date
  updatedAt: Date
}

const CertificateSchema = new Schema<ICertificate>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hackathon: { type: Schema.Types.ObjectId, ref: "Hackathon", required: true },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
    achievement: { type: String, required: true },
    type: {
      type: String,
      enum: ["Winner", "Participation", "Special Award"],
      required: true,
    },
    rank: { type: Number },
    skills: [{ type: String }],
    certificateNumber: { type: String, required: true, unique: true },
    issueDate: { type: Date, default: Date.now },
    verificationUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema)
