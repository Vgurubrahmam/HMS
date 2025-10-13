"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { StudentProgressTracker } from "@/components/student/progress-tracker"

export default function ProgressPage() {
  return (
    <DashboardLayout userRole="student">
      <StudentProgressTracker />
    </DashboardLayout>
  )
}