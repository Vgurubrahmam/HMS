import mongoose, { Schema, type Document } from "mongoose"

export interface IRegistration extends Document {
  user: mongoose.Types.ObjectId
  hackathon: mongoose.Types.ObjectId
  team?: mongoose.Types.ObjectId
  registrationDate: Date
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded"
  paymentAmount: number
  paymentDate?: Date
  transactionId?: string
  status: "Registered" | "Confirmed" | "Cancelled"
  createdAt: Date
  updatedAt: Date
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hackathon: { type: Schema.Types.ObjectId, ref: "Hackathon", required: true },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
    registrationDate: { type: Date, default: Date.now },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentAmount: { type: Number, required: true },
    paymentDate: { type: Date },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ["Registered", "Confirmed", "Cancelled"],
      default: "Registered",
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate registrations
RegistrationSchema.index({ user: 1, hackathon: 1 }, { unique: true })

export default mongoose.models.Registration || mongoose.model<IRegistration>("Registration", RegistrationSchema)
