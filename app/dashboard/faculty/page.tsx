import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, DollarSign, TrendingUp, GraduationCap, FileText, BarChart3 } from "lucide-react"

export default function FacultyDashboard() {
  const stats = [
    {
      title: "Total Students",
      value: "342",
      change: "+23 this semester",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Hackathons",
      value: "8",
      change: "3 ending this week",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Payment Collection",
      value: "89%",
      change: "+5% from last month",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Completion Rate",
      value: "76%",
      change: "+8% improvement",
      icon: GraduationCap,
      color: "text-orange-600",
    },
  ]

  const departmentStats = [
    { department: "Computer Science", students: 156, payments: 142, completion: 91 },
    { department: "Electronics & Communication", students: 89, payments: 78, completion: 87 },
    { department: "Information Technology", students: 67, payments: 59, completion: 88 },
    { department: "Mechanical Engineering", students: 30, payments: 25, completion: 83 },
  ]

  const recentActivities = [
    {
      type: "registration",
      message: "25 new students registered for AI Challenge",
      time: "2 hours ago",
      icon: Users,
    },
    {
      type: "payment",
      message: "Payment deadline reminder sent to 45 students",
      time: "4 hours ago",
      icon: DollarSign,
    },
    {
      type: "completion",
      message: "Web3 Hackathon completed with 78% participation",
      time: "1 day ago",
      icon: Calendar,
    },
    {
      type: "report",
      message: "Monthly progress report generated",
      time: "2 days ago",
      icon: FileText,
    },
  ]

  return (
    <DashboardLayout userRole="faculty">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
            <p className="text-gray-600">Monitor student progress and hackathon analytics</p>
          </div>
          <Button>
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
                {departmentStats.map((dept, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{dept.department}</h4>
                      <Badge variant="outline">{dept.students} students</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Collection</span>
                        <span>
                          {dept.payments}/{dept.students} ({Math.round((dept.payments / dept.students) * 100)}%)
                        </span>
                      </div>
                      <Progress value={(dept.payments / dept.students) * 100} className="h-2" />

                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span>{dept.completion}%</span>
                      </div>
                      <Progress value={dept.completion} className="h-2" />
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
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Student List
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <DollarSign className="h-6 w-6 mb-2" />
                Payment Reports
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <BarChart3 className="h-6 w-6 mb-2" />
                Analytics
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
