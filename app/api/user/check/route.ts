import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    console.log("Checking user existence for email:", email)

    const user = await User.findOne({ email }).select("email role username image createdAt authProvider")

    if (user) {
      

      return NextResponse.json({
        exists: true,
        user: {
          email: user.email,
          role: user.role,
          username: user.username,
          image: user.image,
          authProvider: user.authProvider || "email",
          isGoogleUser: user.authProvider === "google",
        },
      })
    } else {
      return NextResponse.json({
        exists: false,
        user: null,
      })
    }
  } catch (error: any) {
    console.error("Error checking user:", error)
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 })
  }
}
