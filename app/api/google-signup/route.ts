import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"

const secretkey = process.env.JWT_SECRET || "guru"

interface UserInfo {
  username: string
  email: string
  image: string
  password: string
  role?: string // Optional for existing users
  isExistingUser?: boolean
  studentId?: string
  expertise?: string
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
  // console.log("API /api/google-signup called")

  try {
    // Connect to database with better error handling
    try {
      await dbConnect()
      // console.log("Database connected successfully")
    } catch (dbError: any) {
      // console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          message: "Database connection failed",
          error: dbError.message,
        },
        { status: 503 },
      )
    }

    const userInfo: UserInfo = await req.json()
    // console.log("Google user info:", {
    //   ...userInfo,
    //   password: "[REDACTED]",
    //   isExistingUser: userInfo.isExistingUser,
    // })

    // Check if user already exists
    let user = await User.findOne({ email: userInfo.email })

    if (user) {
      // Existing user - use their stored role and update profile if needed
      // console.log("✅ Existing user found:", {
      //   email: user.email,
      //   role: user.role,
      //   username: user.username,
      // })

      // Update user's profile image and name if they've changed
      let userUpdated = false

      if (user.image !== userInfo.image && userInfo.image) {
        user.image = userInfo.image
        userUpdated = true
        // console.log("Updated user's profile image")
      }

      if (user.username !== userInfo.username && userInfo.username) {
        user.username = userInfo.username
        userUpdated = true
        // console.log("Updated user's username")
      }

      if (userUpdated) {
        await user.save()
        // console.log("User profile updated successfully")
      }

      // Generate token with existing user data
      const token: string = jwt.sign(
        {
          id: user._id,
          username: user.username,
          email: user.email,
          image: user.image,
          role: user.role,
        },
        secretkey,
        { expiresIn: "2h" },
      )

      return NextResponse.json({
        token,
        roleData: {
          email: user.email,
          role: user.role,
          userId: user._id,
        } as RoleData,
        image: user.image,
        message: `Welcome back, ${user.username}!`,
        userType: "existing",
      })
    } else {
      // New user - validate and use the provided role
      // console.log("❌ New user detected, creating account...")

      if (!userInfo.role) {
        return NextResponse.json(
          {
            message: "Role is required for new users",
            error: "Missing role in request",
          },
          { status: 400 },
        )
      }

      // Validate role
      const validRoles = ["coordinator", "mentor", "student", "faculty"]
      const normalizedRole = userInfo.role.toLowerCase()

      if (!validRoles.includes(normalizedRole)) {
        return NextResponse.json(
          {
            message: "Invalid role",
            error: `Role must be one of: ${validRoles.join(", ")}`,
          },
          { status: 400 },
        )
      }

      // Hash the default password using bcryptjs
      const hashedPassword = await bcryptjs.hash(userInfo.password, 12)

      // Create new user
      user = new User({
        username: userInfo.username,
        email: userInfo.email,
        image: userInfo.image,
        password: hashedPassword,
        role: normalizedRole,
        needsProfileCompletion: true, // Flag that user might need to complete profile
        authProvider: "google", // Track that this user signed up via Google
        createdAt: new Date(),
      })

      await user.save()
      // console.log("✅ New user created via Google signup:", {
      //   email: user.email,
      //   role: normalizedRole,
      //   username: user.username,
      // })

      // Generate token for new user
      const token: string = jwt.sign(
        {
          id: user._id,
          username: user.username,
          email: user.email,
          image: user.image,
          role: user.role,
        },
        secretkey,
        { expiresIn: "2h" },
      )

      return NextResponse.json({
        token,
        roleData: {
          email: user.email,
          role: user.role,
          userId: user._id,
        } as RoleData,
        image: user.image,
        message: `Welcome to HackOps, ${user.username}! Your ${normalizedRole} account has been created.`,
        userType: "new",
      })
    }
  } catch (error: any) {
    // console.error("Google signup error:", error)
    return NextResponse.json(
      {
        message: "Google login failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
