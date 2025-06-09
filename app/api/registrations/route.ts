import db from "@/lib/db"
import User from "@/lib/models/User"
import bcrypt from "bcrypt"
import { NextRequest, NextResponse } from "next/server";

interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface JsonResponse {
  message: string;
  error?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse<JsonResponse>> {
  await db();
  const { username, email, password, role }: RegisterRequestBody = await req.json();
  try {
    const exstingUser = await User.findOne({ email });
    if (exstingUser) {
      return NextResponse.json({ message: "User alreay exists" }, { status: 400 });
    }
    const validRoles = ["Coordinator", "mentor", "student", "faculty"];
    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json({ message: `Invalid role: ${role}` }, { status: 400 });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashPassword,
      role,
    });
    await newUser.save();
    return NextResponse.json({ message: "user registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Server error", error);
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}