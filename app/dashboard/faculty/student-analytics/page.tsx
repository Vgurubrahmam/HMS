"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { StudentHistoryAnalytics } from "@/components/faculty/student-history-analytics"

export default function StudentAnalyticsPage() {
  return (
    <DashboardLayout userRole="faculty">
      <StudentHistoryAnalytics />
    </DashboardLayout>
  )
}