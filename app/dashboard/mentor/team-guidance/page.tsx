"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { MentorTeamGuidance } from "@/components/mentor/team-guidance"

export default function TeamGuidancePage() {
  return (
    <DashboardLayout userRole="mentor">
      <MentorTeamGuidance />
    </DashboardLayout>
  )
}