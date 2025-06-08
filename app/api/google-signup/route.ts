import { NextResponse } from "next/server"
import db from "@/lib/db"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"

const secretkey="guru"
interface UserInfo {
    username: string;
    email: string;
    image: string;
    password: string;
    role: string;
}

interface RoleData {
    email: string;
    role: string;
    userId: string;
}

interface TokenPayload {
    username: string;
    email: string;
    image: string;
    role: string;
    userId: string;
}

export async function POST(req: Request): Promise<Response> {
    await db();
    const userInfo: UserInfo = await req.json();
    try {
        let user = await User.findOne({ email: userInfo.email });
        if (!user) {
            user = new User({
                username: userInfo.username,
                email: userInfo.email,
                image: userInfo.image,
                password: userInfo.password,
                role: "lead"
            });
            await user.save();
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
            { expiresIn: "7d" }
        );
        return NextResponse.json({
            token,
            roleData: {
                email: user.email,
                role: user.role,
                userId: user._id,
            } as RoleData,
            image: user.image,
            message: "Login success"
        });
    } catch (error) {
        console.error(error, "data error");
        return NextResponse.json(
            {
                message: "Google login Failed"
            },
            { status: 500 }
        );
    }
}