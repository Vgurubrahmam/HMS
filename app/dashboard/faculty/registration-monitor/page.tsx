"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { RegistrationPaymentMonitor } from "@/components/faculty/registration-payment-monitor"

export default function RegistrationMonitorPage() {
  return (
    <DashboardLayout userRole="faculty">
      <RegistrationPaymentMonitor />
    </DashboardLayout>
  )
}