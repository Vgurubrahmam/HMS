"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, DollarSign, TrendingUp, GraduationCap, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface FacultyAnalytics {
  stats: {
    totalStudents: number
    activeStudents: number
    activeHackathons: number
    endingSoon: number
    paymentCollectionRate: number
    completionRate: number
    totalRegistrations: number
    completedPayments: number
    pendingPayments: number
    totalRevenue: number
  }
  departmentStats: Array<{
    department: string
    totalStudents: number
    activeStudents: number
    totalRegistrations: number
    participationRate: number
    paymentCompletionRate: number
    totalRevenue: number
  }>
  recentActivities: Array<{
    type: string
    message: string
    time: string
    icon: string
  }>
  trends: {
    studentGrowth: string
    hackathonParticipation: string
    paymentCollection: string
    completionImprovement: string
  }
}

export default function FacultyDashboard() {
  const [analytics, setAnalytics] = useState<FacultyAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/analytics/faculty")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch analytics data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics) {
    return (
      <DashboardLayout userRole="faculty">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const stats = [
    {
      title: "Total Students",
      value: analytics.stats.totalStudents.toString(),
      change: analytics.trends.studentGrowth,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Hackathons",
      value: analytics.stats.activeHackathons.toString(),
      change: `${analytics.stats.endingSoon} ending this week`,
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Payment Collection",
      value: `${analytics.stats.paymentCollectionRate}%`,
      change: analytics.trends.paymentCollection,
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Completion Rate",
      value: `${analytics.stats.completionRate}%`,
      change: analytics.trends.completionImprovement,
      icon: GraduationCap,
      color: "text-orange-600",
    },
  ]

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Less than an hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "1 day ago"
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return Users
      case 'DollarSign': return DollarSign
      case 'Calendar': return Calendar
      default: return FileText
    }
  }

  return (
    <DashboardLayout userRole="faculty">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
            <p className="text-gray-600">Monitor student progress and hackathon analytics</p>
          </div>
          <Button onClick={() => window.print()}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Department Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>Student participation and payment status by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.departmentStats.map((dept, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{dept.department}</h4>
                      <Badge variant="outline">{dept.totalStudents} students</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participation Rate</span>
                        <span>{dept.participationRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={dept.participationRate} className="h-2" />

                      <div className="flex justify-between text-sm">
                        <span>Payment Completion</span>
                        <span>{dept.paymentCompletionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={dept.paymentCompletionRate} className="h-2" />

                      <div className="flex justify-between text-sm mt-2">
                        <span>Revenue Generated</span>
                        <span className="font-medium">${dept.totalRevenue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivities.map((activity, index) => {
                  const Icon = getActivityIcon(activity.icon)
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.time)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used faculty tools and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard/faculty/students">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <Users className="h-6 w-6 mb-2" />
                  Student List
                </Button>
              </Link>
              <Link href="/dashboard/faculty/payments">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <DollarSign className="h-6 w-6 mb-2" />
                  Payment Reports
                </Button>
              </Link>
              <Link href="/dashboard/faculty/student-analytics">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/dashboard/faculty/registration-monitor">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <FileText className="h-6 w-6 mb-2" />
                  Monitor
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Registrations</span>
                  <span className="font-bold">{analytics.stats.totalRegistrations}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Students</span>
                  <span className="font-bold text-green-600">{analytics.stats.activeStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participation Rate</span>
                  <span className="font-bold text-blue-600">
                    {((analytics.stats.activeStudents / analytics.stats.totalStudents) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Completed Payments</span>
                  <span className="font-bold text-green-600">{analytics.stats.completedPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Payments</span>
                  <span className="font-bold text-yellow-600">{analytics.stats.pendingPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Revenue</span>
                  <span className="font-bold text-purple-600">${analytics.stats.totalRevenue}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Completion Rate</span>
                  <span className="font-bold">{analytics.stats.completionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Collection</span>
                  <span className="font-bold">{analytics.stats.paymentCollectionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Hackathons</span>
                  <span className="font-bold text-blue-600">{analytics.stats.activeHackathons}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
