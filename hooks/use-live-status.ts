import { useState, useEffect, useMemo } from 'react'
import { getHackathonStatus, getRegistrationStatus, type HackathonStatus, type RegistrationStatus } from '@/lib/status-utils'

/**
 * Custom hook for managing real-time hackathon status updates
 */
export function useHackathonStatus(hackathon: any): HackathonStatus {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute to keep statuses fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Calculate status based on current time
  const status = useMemo(() => {
    if (!hackathon) {
      return {
        status: "Planning" as const,
        phase: "upcoming" as const,
        canRegister: false,
        isActive: false,
        isCompleted: false,
      }
    }
    return getHackathonStatus(hackathon)
  }, [hackathon, currentTime])

  return status
}

/**
 * Custom hook for managing real-time registration status updates
 */
export function useRegistrationStatus(registration: any, hackathon: any): RegistrationStatus {
  const hackathonStatus = useHackathonStatus(hackathon)

  const status = useMemo(() => {
    if (!registration) {
      return {
        status: "Registration Closed" as const,
        paymentStatus: "Pending" as const,
        canPay: false,
        isActive: false,
        priority: "low" as const,
      }
    }
    return getRegistrationStatus(registration, hackathonStatus)
  }, [registration, hackathonStatus])

  return status
}

/**
 * Custom hook for managing multiple hackathon statuses with real-time updates
 */
export function useHackathonStatuses(hackathons: any[]): Array<{ hackathon: any; status: HackathonStatus }> {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Calculate statuses for all hackathons
  const statuses = useMemo(() => {
    return hackathons.map(hackathon => ({
      hackathon,
      status: getHackathonStatus(hackathon)
    }))
  }, [hackathons, currentTime])

  return statuses
}

/**
 * Custom hook for managing multiple registration statuses
 */
export function useRegistrationStatuses(
  registrations: any[],
  hackathons: any[]
): Array<{ registration: any; status: RegistrationStatus; hackathon: any }> {
  const hackathonStatuses = useHackathonStatuses(hackathons)

  const statuses = useMemo(() => {
    return registrations.map(registration => {
      const hackathon = hackathons.find(h => h._id === registration.hackathon?._id || registration.hackathon)
      const hackathonStatusInfo = hackathonStatuses.find(hs => hs.hackathon._id === hackathon?._id)
      
      return {
        registration,
        hackathon,
        status: getRegistrationStatus(registration, hackathonStatusInfo?.status || {
          status: "Planning" as const,
          phase: "upcoming" as const,
          canRegister: false,
          isActive: false,
          isCompleted: false,
        })
      }
    })
  }, [registrations, hackathons, hackathonStatuses])

  return statuses
}

/**
 * Hook to get live statistics for dashboard
 */
export function useLiveDashboardStats(hackathons: any[], registrations: any[], teams: any[], certificates: any[], userId: string) {
  const hackathonStatuses = useHackathonStatuses(hackathons)
  const registrationStatuses = useRegistrationStatuses(registrations, hackathons)

  const stats = useMemo(() => {
    // Filter user's data
    const myRegistrations = registrations.filter((r: any) => r.user?._id === userId || r.user === userId)
    const myTeams = teams.filter(
      (t: any) => t.members?.some((m: any) => m._id === userId || m === userId) || t.teamLead?._id === userId || t.teamLead === userId
    )
    const myCertificates = certificates.filter((c: any) => c.user?._id === userId || c.user === userId)

    // Calculate live statistics
    const openHackathons = hackathonStatuses.filter(hs => hs.status.canRegister).length
    const activeRegistrations = myRegistrations.filter((r: any) => {
      const regStatus = registrationStatuses.find(rs => rs.registration._id === r._id)
      return regStatus?.status.isActive
    }).length
    const confirmedRegistrations = myRegistrations.filter((r: any) => r.paymentStatus === "Completed").length
    const pendingPayments = myRegistrations.filter((r: any) => {
      const regStatus = registrationStatuses.find(rs => rs.registration._id === r._id)
      return regStatus?.status.canPay
    }).length
    const activeTeams = myTeams.filter((t: any) => t.status === "Active").length
    const completedHackathons = hackathonStatuses.filter(hs => hs.status.isCompleted).length

    return {
      openHackathons,
      totalRegistrations: myRegistrations.length,
      activeRegistrations,
      confirmedRegistrations,
      pendingPayments,
      totalTeams: myTeams.length,
      activeTeams,
      totalCertificates: myCertificates.length,
      winnerCertificates: myCertificates.filter((c: any) => c.type === "Winner").length,
      completedHackathons,
      upcomingEvents: hackathonStatuses.filter(hs => 
        hs.status.phase === "registration" || hs.status.phase === "preparation"
      ).length,
    }
  }, [hackathonStatuses, registrationStatuses, registrations, teams, certificates, userId])

  return stats
}

/**
 * Hook for deadline notifications and alerts
 */
export function useDeadlineAlerts(hackathons: any[], registrations: any[]): Array<{
  type: 'registration_deadline' | 'payment_deadline' | 'event_starting' | 'event_ending'
  message: string
  priority: 'high' | 'medium' | 'low'
  hackathon: any
  daysLeft: number
}> {
  const hackathonStatuses = useHackathonStatuses(hackathons)

  const alerts = useMemo(() => {
    const alertList: Array<{
      type: 'registration_deadline' | 'payment_deadline' | 'event_starting' | 'event_ending'
      message: string
      priority: 'high' | 'medium' | 'low'
      hackathon: any
      daysLeft: number
    }> = []

    hackathonStatuses.forEach(({ hackathon, status }) => {
      const daysLeft = status.daysUntil || 0

      // Registration deadline alerts
      if (status.canRegister && daysLeft <= 7) {
        alertList.push({
          type: 'registration_deadline',
          message: `Registration for "${hackathon.title}" closes in ${status.timeRemaining}`,
          priority: daysLeft <= 1 ? 'high' : daysLeft <= 3 ? 'medium' : 'low',
          hackathon,
          daysLeft
        })
      }

      // Event starting alerts
      if (status.phase === 'preparation' && daysLeft <= 7) {
        alertList.push({
          type: 'event_starting',
          message: `"${hackathon.title}" starts in ${status.timeRemaining}`,
          priority: daysLeft <= 1 ? 'high' : daysLeft <= 3 ? 'medium' : 'low',
          hackathon,
          daysLeft
        })
      }

      // Event ending alerts (for active events)
      if (status.isActive && daysLeft <= 2) {
        alertList.push({
          type: 'event_ending',
          message: `"${hackathon.title}" ends in ${status.timeRemaining}`,
          priority: 'high',
          hackathon,
          daysLeft
        })
      }
    })

    // Payment deadline alerts
    registrations.forEach((registration: any) => {
      if (registration.paymentStatus === "Pending") {
        const hackathon = hackathons.find(h => h._id === registration.hackathon?._id)
        if (hackathon) {
          const status = getHackathonStatus(hackathon)
          const daysLeft = status.daysUntil || 0
          
          if (status.canRegister && daysLeft <= 7) {
            alertList.push({
              type: 'payment_deadline',
              message: `Payment pending for "${hackathon.title}" - ${status.timeRemaining} left to register`,
              priority: daysLeft <= 1 ? 'high' : 'medium',
              hackathon,
              daysLeft
            })
          }
        }
      }
    })

    // Sort by priority and days left
    return alertList.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return a.daysLeft - b.daysLeft
    })
  }, [hackathonStatuses, registrations, hackathons])

  return alerts
}