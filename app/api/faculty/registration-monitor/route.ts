import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import Registration from "@/lib/models/Registration"
import Payment from "@/lib/models/Payment"
import UserModel from "@/lib/models/User"
import Hackathon from "@/lib/models/Hackathon"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await db()

    // Fetch all registrations with populated user and hackathon data
    const registrations = await Registration.find()
      .populate('user', 'username email branch year image')
      .populate('hackathon', 'title registrationFee startDate endDate')
      .sort({ createdAt: -1 })
      .lean()

    // Fetch all payments
    const payments = await Payment.find()
      .populate('user', '_id')
      .populate('hackathon', '_id')
      .lean()

    // Process registrations and merge with payment data
    const processedRegistrations = registrations.map(registration => {
      // Find related payment
      const relatedPayment = payments.find(payment => 
        payment.user._id.toString() === registration.user._id.toString() &&
        payment.hackathon._id.toString() === registration.hackathon._id.toString()
      )

      // Determine payment status
      let paymentStatus = 'Pending'
      if (relatedPayment) {
        paymentStatus = relatedPayment.status
      }

      return {
        _id: registration._id,
        user: {
          _id: registration.user._id,
          username: registration.user.username,
          email: registration.user.email,
          branch: registration.user.branch || 'N/A',
          year: registration.user.year || 'N/A',
          image: registration.user.image
        },
        hackathon: {
          _id: registration.hackathon._id,
          title: registration.hackathon.title,
          registrationFee: registration.hackathon.registrationFee,
          startDate: registration.hackathon.startDate,
          endDate: registration.hackathon.endDate
        },
        registrationDate: registration.createdAt || registration.registrationDate,
        paymentStatus,
        payment: relatedPayment ? {
          _id: relatedPayment._id,
          amount: relatedPayment.amount,
          method: relatedPayment.method,
          transactionId: relatedPayment.transactionId,
          paymentDate: relatedPayment.paymentDate,
          status: relatedPayment.status
        } : null,
        status: registration.status || 'active'
      }
    })

    // Calculate statistics
    const stats = {
      totalRegistrations: processedRegistrations.length,
      completedPayments: processedRegistrations.filter(r => r.paymentStatus === 'Completed').length,
      pendingPayments: processedRegistrations.filter(r => r.paymentStatus === 'Pending').length,
      failedPayments: processedRegistrations.filter(r => r.paymentStatus === 'Failed').length,
      totalRevenue: processedRegistrations
        .filter(r => r.paymentStatus === 'Completed')
        .reduce((sum, r) => sum + (r.payment?.amount || r.hackathon.registrationFee), 0),
      pendingRevenue: processedRegistrations
        .filter(r => r.paymentStatus === 'Pending')
        .reduce((sum, r) => sum + r.hackathon.registrationFee, 0)
    }

    // Get unique departments for filtering
    const departments = [...new Set(processedRegistrations.map(r => r.user.branch).filter(Boolean))]

    // Get active hackathons for filtering
    const activeHackathons = await Hackathon.find({ 
      status: { $in: ['upcoming', 'ongoing'] } 
    }).select('_id title').lean()

    return NextResponse.json({
      success: true,
      data: {
        registrations: processedRegistrations,
        stats,
        departments,
        hackathons: activeHackathons
      }
    })

  } catch (error) {
    console.error("Error fetching registration monitor data:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch registration monitor data" },
      { status: 500 }
    )
  }
}