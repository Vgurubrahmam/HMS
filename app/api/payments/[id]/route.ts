import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import Payment from "@/lib/models/Payment";
import Registration from "@/lib/models/Registration";
import Hackathon from "@/lib/models/Hackathon";
import { refreshHackathonParticipantCount } from "@/lib/participant-utils";
import mongoose from "mongoose";

// PUT method for updating payment status
export async function PUT(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    await db();

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ success: false, message: "Invalid Payment ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status, transactionId } = body;

    // Validate status
    if (status && !["Pending", "Completed", "Failed", "Refunded"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid payment status" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (transactionId) updateData.transactionId = transactionId;
    if (status === "Completed") updateData.paymentDate = new Date();

    const updatedPayment = await Payment.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "username email").populate("hackathon", "title").populate("registration");

    if (!updatedPayment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    // If payment is completed, update the registration status and participant count
    if (status === "Completed" && updatedPayment.registration) {
      const registration = await Registration.findByIdAndUpdate(updatedPayment.registration._id, {
        paymentStatus: "Completed",
      }, { new: true });

      // Update hackathon participant count if registration exists
      if (registration && registration.hackathon) {
        await refreshHackathonParticipantCount(registration.hackathon.toString());
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update payment", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET method for fetching a single payment
export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    await db();

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ success: false, message: "Invalid Payment ID" }, { status: 400 });
    }

    const payment = await Payment.findById(params.id)
      .populate("user", "username email")
      .populate("hackathon", "title registrationFee")
      .populate("registration", "paymentStatus");

    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
