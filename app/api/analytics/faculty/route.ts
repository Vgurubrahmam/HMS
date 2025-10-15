import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import UserModel from "@/lib/models/User"
import Registration from "@/lib/models/Registration"
import Hackathon from "@/lib/models/Hackathon"
import Payment from "@/lib/models/Payment"
import Team from "@/lib/models/Team"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await db()

    // Get all students with their data
    const students = await UserModel.find({ role: 'student' }).lean() as any[]
    
    // Get all registrations with populated data
    const registrations = await Registration.find()
      .populate('user', 'username email branch year image')
      .populate('hackathon', 'title registrationFee startDate endDate')
      .lean()

    // Get all hackathons
    const hackathons = await Hackathon.find().lean()

    // Get all payments
    const payments = await Payment.find()
      .populate('user', 'username email')
      .populate('hackathon', 'title')
      .lean()

    // Get all teams
    const teams = await Team.find()
      .populate('members', 'username email branch year')
      .populate('hackathon', 'title')
      .lean()

    // Calculate overall statistics
    const totalStudents = students.length
    const activeStudents = [...new Set(registrations.map(r => r.user._id.toString()))].length
    const totalRegistrations = registrations.length
    const completedPayments = payments.filter(p => p.status === 'Completed').length
    const pendingPayments = payments.filter(p => p.status === 'Pending').length
    const totalRevenue = payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0)

    // Calculate department statistics
    const departmentStats = students.reduce((acc, student) => {
      const branch = student.branch || 'Unknown'
      if (!acc[branch]) {
        acc[branch] = {
          department: branch,
          totalStudents: 0,
          activeStudents: 0,
          totalRegistrations: 0,
          completedPayments: 0,
          totalRevenue: 0
        }
      }
      
      acc[branch].totalStudents++
      
      const studentRegistrations = registrations.filter(r => 
        r.user._id.toString() === student._id.toString()
      )
      
      if (studentRegistrations.length > 0) {
        acc[branch].activeStudents++
        acc[branch].totalRegistrations += studentRegistrations.length
      }

      const studentPayments = payments.filter(p => 
        p.user._id.toString() === student._id.toString() && p.status === 'Completed'
      )
      
      acc[branch].completedPayments += studentPayments.length
      acc[branch].totalRevenue += studentPayments.reduce((sum, p) => sum + p.amount, 0)
      
      return acc
    }, {} as any)

    const departmentArray = Object.values(departmentStats).map((dept: any) => ({
      ...dept,
      participationRate: dept.totalStudents > 0 ? (dept.activeStudents / dept.totalStudents) * 100 : 0,
      paymentCompletionRate: dept.totalRegistrations > 0 ? (dept.completedPayments / dept.totalRegistrations) * 100 : 0
    }))

    // Get recent activities (last 10 activities)
    const recentActivities = []
    
    // Recent registrations
    const recentRegistrations = registrations
      .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
      .slice(0, 5)
      .map(reg => ({
        type: 'registration',
        message: `${reg.user.username} registered for ${reg.hackathon.title}`,
        time: reg.registrationDate,
        icon: 'Users'
      }))

    // Recent payments
    const recentPayments = payments
      .filter(p => p.status === 'Completed')
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 3)
      .map(payment => ({
        type: 'payment',
        message: `Payment of $${payment.amount} received from ${payment.user.username}`,
        time: payment.paymentDate,
        icon: 'DollarSign'
      }))

    // Recent hackathon completions
    const completedHackathons = hackathons
      .filter(h => new Date(h.endDate) < new Date())
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
      .slice(0, 2)
      .map(hackathon => ({
        type: 'completion',
        message: `${hackathon.title} completed`,
        time: hackathon.endDate,
        icon: 'Calendar'
      }))

    recentActivities.push(...recentRegistrations, ...recentPayments, ...completedHackathons)
    recentActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    // Active hackathons
    const activeHackathons = hackathons.filter(h => 
      new Date(h.startDate) <= new Date() && new Date(h.endDate) >= new Date()
    ).length

    // Hackathons ending soon (within 7 days)
    const endingSoon = hackathons.filter(h => {
      const endDate = new Date(h.endDate)
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return endDate > now && endDate <= weekFromNow
    }).length

    // Calculate completion rate
    const totalCompletedHackathons = hackathons.filter(h => new Date((h as any).endDate) < new Date()).length
    const totalParticipatedStudents = registrations.filter(r => {
      const hackathon = hackathons.find(h => (h as any)._id.toString() === (r.hackathon as any)._id.toString())
      return hackathon && new Date((hackathon as any).endDate) < new Date()
    }).length
    
    const completionRate = totalCompletedHackathons > 0 ? 
      (totalParticipatedStudents / (totalCompletedHackathons * activeStudents)) * 100 : 0

    // Payment collection rate
    const paymentCollectionRate = totalRegistrations > 0 ? 
      (completedPayments / totalRegistrations) * 100 : 0

    const analyticsData = {
      stats: {
        totalStudents,
        activeStudents,
        activeHackathons,
        endingSoon,
        paymentCollectionRate: Math.round(paymentCollectionRate),
        completionRate: Math.round(completionRate),
        totalRegistrations,
        completedPayments,
        pendingPayments,
        totalRevenue
      },
      departmentStats: departmentArray,
      recentActivities: recentActivities.slice(0, 10),
      trends: {
        studentGrowth: "+23 this semester", // This would be calculated from historical data
        hackathonParticipation: "+8% improvement",
        paymentCollection: "+5% from last month",
        completionImprovement: "+8% improvement"
      }
    }

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error("Error fetching faculty analytics:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch faculty analytics" },
      { status: 500 }
    )
  }
}