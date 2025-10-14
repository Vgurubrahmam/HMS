import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import Payment from "@/lib/models/Payment";
import Registration from "@/lib/models/Registration";
import Hackathon from "@/lib/models/Hackathon";

/**
 * API to sync payments for registrations that don't have payment records
 * This helps ensure that every registration has a corresponding payment record
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await db();

    const { userId } = await req.json();

    // Find registrations for the user that don't have payments
    const registrations = await Registration.find({ user: userId })
      .populate('hackathon', 'title registrationFee')
      .populate('user', 'username email');

  

    const createdPayments = [];
    let existingPayments = 0;

    for (const registration of registrations) {
      // Check if payment already exists for this registration
      const existingPayment = await Payment.findOne({
        user: userId,
        registration: registration._id
      });

      if (existingPayment) {
        existingPayments++;
        continue;
      }

      // Create payment record for registration
      const paymentData = {
        user: userId,
        hackathon: registration.hackathon._id,
        registration: registration._id,
        amount: registration.hackathon.registrationFee || 0,
        status: registration.paymentStatus === "Completed" ? "Completed" : "Pending",
        paymentMethod: "PayPal", // Default payment method
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        description: `Registration fee for ${registration.hackathon.title}`,
      };

      const newPayment = new Payment(paymentData);
      await newPayment.save();
      createdPayments.push(newPayment);

    }

    return NextResponse.json({
      success: true,
      message: `Sync completed. Created ${createdPayments.length} new payments, ${existingPayments} already existed.`,
      data: {
        createdCount: createdPayments.length,
        existingCount: existingPayments,
        totalRegistrations: registrations.length,
        createdPayments: createdPayments.map(p => ({
          id: p._id,
          hackathon: p.hackathon,
          amount: p.amount,
          status: p.status
        }))
      }
    });

  } catch (error) {
    console.error("Error syncing payments:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to sync payments",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check payment sync status for a user
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await db();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's registrations and payments
    const [registrations, payments] = await Promise.all([
      Registration.find({ user: userId })
        .populate('hackathon', 'title registrationFee')
        .lean(),
      Payment.find({ user: userId })
        .populate('hackathon', 'title')
        .populate('registration')
        .lean()
    ]);

    // Check which registrations don't have payments
    const registrationsWithoutPayments = registrations.filter(registration => {
      return !payments.some(payment => 
        payment.registration._id.toString() === (registration as any)._id.toString()
      );
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRegistrations: registrations.length,
        totalPayments: payments.length,
        registrationsWithoutPayments: registrationsWithoutPayments.length,
        needsSync: registrationsWithoutPayments.length > 0,
        registrations: registrations.map(r => ({
          id: (r as any)._id,
          hackathon: r.hackathon?.title,
          paymentStatus: (r as any).paymentStatus,
          hasPayment: payments.some(p => p.registration._id.toString() === (r as any)._id.toString())
        })),
        payments: payments.map(p => ({
          id: p._id,
          hackathon: p.hackathon?.title,
          amount: p.amount,
          status: p.status,
          registrationId: p.registration._id
        }))
      }
    });

  } catch (error) {
    console.error("Error checking payment sync status:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to check payment sync status",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}