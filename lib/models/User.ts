import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String ,
      required: true,
    },
    role: {
      type: String,
      enum: ["coordinator", "mentor", "student", "faculty"], // Ensure lowercase enum values
      default: "student",
      lowercase: true, // Automatically convert values to lowercase
    },
    image : {
      type: String,
      default : "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
    }
  },
  { timestamps: true }
);

const UserModel = mongoose.models.users || mongoose.model("users", userSchema);
export  default UserModel;
