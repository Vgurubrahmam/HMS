import mongoose, { Schema, model, models } from "mongoose";

const RegistrationSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
  paymentStatus: { type: String, default: "Pending" },
});

const Registration = models.Registration || model("Registration", RegistrationSchema);



export default Registration;
