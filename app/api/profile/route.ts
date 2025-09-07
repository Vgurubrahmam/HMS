import { NextResponse } from "next/server";
import db from "@/lib/db";
import Profile from "@/lib/models/Profile";

// GET: Fetch user profile
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await db();
    const userProfile = await Profile.findOne({ id: userId });

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create or update user profile
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, username, email, phone, branch, year, gender, github,profile } = body;

    if (!id || !username || !email) {
      return NextResponse.json({ error: "ID, username, and email are required" }, { status: 400 });
    }

    await db();
    const result = await Profile.findOneAndUpdate(
      { id },
      {
        $set: {
          username,
          email,
          phone,
          branch,
          year,
          gender,
          github,
          profile
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
