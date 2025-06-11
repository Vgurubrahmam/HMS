import { NextResponse } from "next/server"
import db from "@/lib/db"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"

const secretkey = process.env.JWT_SECRET || "guru"

interface UserInfo {
  username: string
  email: string
  image: string
  password: string
}

interface RoleData {
  email: string
  role: string
  userId: string
}

interface TokenPayload {
  username: string
  email: string
  image: string
  role: string
  userId: string
}

export async function POST(req: Request): Promise<Response> {
  console.log("API /api/google-signup called")

  try {
    await db()
    console.log("Database connected successfully")

    const userInfo: UserInfo = await req.json()
    console.log("Google user info:", { ...userInfo, password: "[REDACTED]" })

    let user = await User.findOne({ email: userInfo.email })

    if (!user) {
      // Hash the default password using bcryptjs
      const hashedPassword = await bcryptjs.hash(userInfo.password, 12)

      user = new User({
        username: userInfo.username,
        email: userInfo.email,
        image: userInfo.image,
        password: hashedPassword,
        role: "coordinator",
      })
      await user.save()
      console.log("New user created via Google signup")
    } else {
      console.log("Existing user found, logging in")
    }

    const token: string = jwt.sign(
      {
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
        userId: user._id,
      } as TokenPayload,
      secretkey,
      { expiresIn: "7d" },
    )

    return NextResponse.json({
      token,
      roleData: {
        email: user.email,
        role: user.role,
        userId: user._id,
      } as RoleData,
      image: user.image,
      message: "Login success",
    })
  } catch (error: any) {
    console.error("Google signup error:", error)
    return NextResponse.json(
      {
        message: "Google login Failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
