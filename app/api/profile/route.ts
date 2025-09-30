import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import Profile from "@/lib/models/Profile";

// GET: Fetch user profile by _id
export async function GET(req: NextRequest) {
  try {
    await db();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await Profile.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create or update user profile by _id
export async function POST(req: NextRequest) {
  try {
    await db();
    const body = await req.json();
    const { id, username, email, phone, branch, year, gender, github, image } = body;

    if (!id || !username || !email) {
      return NextResponse.json({ error: "ID, username, and email are required" }, { status: 400 });
    }

    const result = await Profile.findByIdAndUpdate(
      id, // MongoDB _id
      {
        username,
        email,
        phone,
        branch,
        year,
        gender,
        github,
        image,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
