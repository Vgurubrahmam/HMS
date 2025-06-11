import db from "@/lib/db"
import User from "@/lib/models/User"
import Registration from "@/lib/models/Registration";
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
  console.log("API /api/registrations POST called");
  try {
    await db();
    console.log("Database connected successfully");

    let body: RegisterRequestBody;
    try {
      body = await req.json();
      console.log("Request body:", body);
    } catch (error) {
      console.error("Invalid request body:", error);
      return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
    }

    const { username, email, password, role } = body;

    if (!username || !email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const validRoles = ["coordinator", "mentor", "student", "faculty"];
    const normalizedRole = role.toLowerCase();
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json({ message: `Invalid role: ${normalizedRole}` }, { status: 400 });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashPassword,
      role: normalizedRole,
    });
    await newUser.save();

    console.log("User registered successfully:", { email, role });
    return NextResponse.json(
      {
        message: "User registered successfully",
        resetFields: true,
        closeDialog: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  console.log("API /api/registrations GET called");
  try {
    await db();
    console.log("Database connected successfully");

    const { searchParams } = new URL(req.url);
    const user = searchParams.get("user");
    const hackathon = searchParams.get("hackathon");
    const paymentStatus = searchParams.get("paymentStatus");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const query: any = {};
    if (user) query.user = user;
    if (hackathon) query.hackathon = hackathon;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    const [registrations, total] = await Promise.all([
      Registration.find(query).skip(skip).limit(limit),
      Registration.countDocuments(query),
    ]);

    const response = {
      success: true,
      data: { registrations },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    console.log("Fetch registrations successful:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Server error while fetching registrations:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}