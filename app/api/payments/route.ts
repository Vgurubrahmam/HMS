import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import Payment from "@/lib/models/Payment";
import Registration from "@/lib/models/Registration";
import User from "@/lib/models/User";
import Hackathon from "@/lib/models/Hackathon";

// GET method for fetching payments
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await db();

    const { searchParams } = new URL(req.url);
    const user = searchParams.get("user");
    const hackathon = searchParams.get("hackathon");
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

    // Build query
    const query: any = {};
    if (user) query.user = user;
    if (hackathon) query.hackathon = hackathon;
    if (status) query.status = status;

   
  

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .skip(skip)
        .limit(limit)
        .populate("user", "username email")
        .populate("hackathon", "title registrationFee")
        .populate("registration", "paymentStatus"),
      Payment.countDocuments(query),
    ]);

  

    const response = {
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Server error while fetching payments:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST method for creating payments
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await db();

    const body = await req.json();
    const { user, hackathon, registration, amount, paymentMethod, dueDate, description } = body;

    // Validate required fields
    if (!user || !hackathon || !registration || !amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: "User, hackathon, registration, amount, and payment method are required" },
        { status: 400 }
      );
    }

    // Create payment object
    const paymentData = {
      user,
      hackathon,
      registration,
      amount,
      paymentMethod,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      description: description || "Hackathon registration fee",
    };

    const newPayment = new Payment(paymentData);
    await newPayment.save();

    return NextResponse.json(
      {
        success: true,
        message: "Payment created successfully",
        data: newPayment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
