import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import UserModel from "@/lib/models/User"
import Registration from "@/lib/models/Registration"
import Payment from "@/lib/models/Payment"
import Hackathon from "@/lib/models/Hackathon"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await db()
    
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const year = searchParams.get('year')
    
    // Get all students with their registrations and payments
    const students = await UserModel.find({ role: 'student' }).lean()
    
    // Get all registrations with populated data
    const registrations = await Registration.find()
      .populate('user', 'username email branch year image')
      .populate('hackathon', 'title registrationFee startDate endDate')
      .lean()
    
    // Get all payments
    const payments = await Payment.find()
      .populate('user', '_id')
      .populate('hackathon', '_id')
      .lean()

    // Process student data
    const studentHistories = students.map((student: any) => {
      // Get student's registrations
      const studentRegistrations = registrations.filter((reg: any) => 
        reg.user._id.toString() === student._id.toString()
      )

      // Get student's payments
      const studentPayments = payments.filter((payment: any) => 
        payment.user._id.toString() === student._id.toString()
      )

      // Calculate payment totals
      const totalPaid = studentPayments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + p.amount, 0)
      
      const totalPending = studentRegistrations
        .filter(reg => !studentPayments.some(p => 
          p.hackathon._id.toString() === reg.hackathon._id.toString() && p.status === 'Completed'
        ))
        .reduce((sum, reg) => sum + reg.hackathon.registrationFee, 0)

      // Process registrations with payment info
      const processedRegistrations = studentRegistrations.map(reg => {
        const relatedPayment = studentPayments.find(p => 
          p.hackathon._id.toString() === reg.hackathon._id.toString()
        )

        return {
          hackathon: reg.hackathon,
          registrationDate: reg.registrationDate,
          paymentStatus: relatedPayment ? relatedPayment.status : 'Pending',
          payment: relatedPayment ? {
            amount: relatedPayment.amount,
            paymentDate: relatedPayment.paymentDate
          } : null
        }
      })

      // Calculate completed hackathons (those with end date in the past)
      const hackathonsCompleted = studentRegistrations.filter(reg => 
        new Date(reg.hackathon.endDate) < new Date()
      ).length

      // Calculate average performance (mock for now)
      const averagePerformance = Math.floor(Math.random() * 40) + 60 // 60-100%

      return {
        _id: student._id,
        username: student.username,
        email: student.email,
        image: student.image,
        branch: student.branch,
        year: student.year,
        rollNumber: student.rollNumber || student.username, // fallback to username if no rollNumber
        registrations: processedRegistrations.map(reg => ({
          hackathon: {
            _id: reg.hackathon._id,
            title: reg.hackathon.title,
            startDate: reg.hackathon.startDate,
            endDate: reg.hackathon.endDate,
            difficulty: 'Medium' // mock difficulty
          },
          registrationDate: reg.registrationDate,
          paymentStatus: reg.paymentStatus,
          team: null, // mock team data
          certificates: [] // mock certificates
        })),
        totalHackathons: studentRegistrations.length,
        completedHackathons: hackathonsCompleted,
        totalCertificates: 0, // mock certificates count
        averagePerformance,
        skillsGained: ['React', 'Node.js', 'Python', 'MongoDB'].slice(0, Math.floor(Math.random() * 4) + 1) // mock skills
      }
    })

    // Filter by department if specified
    let filteredData = studentHistories
    if (department && department !== 'all') {
      filteredData = studentHistories.filter(s => s.branch === department)
    }

    // Filter by year if specified
    if (year && year !== 'all') {
      filteredData = filteredData.filter(s => s.year === year)
    }

    // Sort by total hackathons (most active first)
    filteredData.sort((a, b) => b.totalHackathons - a.totalHackathons)

    return NextResponse.json({
      success: true,
      data: filteredData
    })

  } catch (error) {
    console.error("Error fetching student history:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch student history" },
      { status: 500 }
    )
  }
}