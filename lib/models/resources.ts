import mongoose, { Schema, type Document } from "mongoose"

export interface IResource extends Document {
  title: string
  description: string
  type: "Document" | "Video" | "Link" | "Tool" | "Template"
  url?: string
  fileUrl?: string
  category: string
  tags: string[]
  uploadedBy: mongoose.Types.ObjectId
  hackathon?: mongoose.Types.ObjectId
  isPublic: boolean
  downloadCount: number
  createdAt: Date
  updatedAt: Date
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["Document", "Video", "Link", "Tool", "Template"],
      required: true,
    },
    url: { type: String },
    fileUrl: { type: String },
    category: { type: String, required: true },
    tags: [{ type: String }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hackathon: { type: Schema.Types.ObjectId, ref: "Hackathon" },
    isPublic: { type: Boolean, default: true },
    downloadCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema)
