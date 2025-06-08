import { NextResponse } from "next/server";
import db from "@/lib/db"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const secretkey="guru"

interface LoginRequestBody {
    email: string;
    password: string;
    role?: string;
}

interface RoleData {
    email: string;
    role: string;
    userId: string;
}

interface LoginResponse {
    token: string;
    roleData: RoleData;
    message: string;
}

export async function POST(req: Request): Promise<Response> {
    await db();
    const { email, password, role }: LoginRequestBody = await req.json();
    try {
        const user: any = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 400 });
        }
        const isMatch: boolean = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid Password" }, { status: 400 });
        }
        const token: string = jwt.sign(
            {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role || "empty",
            },
            secretkey,
            { expiresIn: "7d" }
        );
        const response: LoginResponse = {
            token,
            roleData: { email, role: user.role || "empty", userId: user._id },
            message: "user logged in successfully"
        };
        return NextResponse.json(response);
    } catch (error) {
        console.error("Login error", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}