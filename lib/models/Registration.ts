import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hackathon",
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);