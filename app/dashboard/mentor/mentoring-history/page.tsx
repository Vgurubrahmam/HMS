"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { MentoringHistory } from "@/components/mentor/mentoring-history"

export default function MentoringHistoryPage() {
  return (
    <DashboardLayout userRole="mentor">
      <MentoringHistory />
    </DashboardLayout>
  )
}