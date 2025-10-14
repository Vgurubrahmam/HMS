import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hackathons",
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
  },
  status: {
    type: String,
    enum: ["Registered", "Payment Pending", "Confirmed", "Expired", "Registration Closed"],
    default: "Registered",
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  paymentAmount: {
    type: Number,
    required: false,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);