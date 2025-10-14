/**
 * Status utility functions for hackathons and registrations
 * Provides real-time status updates based on current date and project timeline
 */

/**
 * Helper function to parse hackathon dates consistently
 * Handles various date formats and ensures proper timezone handling
 */
function parseHackathonDate(dateInput: any): Date {
  if (!dateInput) return new Date()
  
  // If it's already a Date object
  if (dateInput instanceof Date) {
    return dateInput
  }
  
  // If it's a string, try different parsing approaches
  if (typeof dateInput === 'string') {
    // Handle DD/MM/YYYY format (common in forms)
    if (dateInput.includes('/') && dateInput.split('/').length === 3) {
      const parts = dateInput.split('/')
      if (parts.length === 3) {
        // Assume DD/MM/YYYY format
        const [day, month, year] = parts
        const parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        console.log(`📅 Parsed date ${dateInput} as:`, parsed.toISOString())
        return parsed
      }
    }
    
    // Handle ISO string or other formats
    const parsed = new Date(dateInput)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }
  
  // Fallback to current date if parsing fails
  console.warn('⚠️ Failed to parse date:', dateInput, 'using current date')
  return new Date()
}

export interface HackathonStatus {
  status: "Planning" | "Registration Open" | "Registration Closed" | "Active" | "Completed" | "Cancelled"
  phase: "upcoming" | "registration" | "preparation" | "ongoing" | "finished"
  daysUntil?: number
  timeRemaining?: string
  canRegister: boolean
  isActive: boolean
  isCompleted: boolean
}

export interface RegistrationStatus {
  status: "Registered" | "Payment Pending" | "Confirmed" | "Expired" | "Registration Closed"
  paymentStatus: "Pending" | "Completed" | "Failed" | "Refunded"
  canPay: boolean
  isActive: boolean
  priority: "high" | "medium" | "low"
}

/**
 * Calculate hackathon status based on current date and hackathon timeline
 */
export function getHackathonStatus(hackathon: any): HackathonStatus {
  const now = new Date()
  
  // Use improved date parsing to handle various formats
  const registrationDeadline = parseHackathonDate(hackathon.registrationDeadline)
  const startDate = parseHackathonDate(hackathon.startDate)
  const endDate = parseHackathonDate(hackathon.endDate)

  // Enhanced debug logging for date comparison
  

  // Validate that all dates are valid
  if (isNaN(registrationDeadline.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
   
    return {
      status: "Planning",
      phase: "upcoming",
      canRegister: false,
      isActive: false,
      isCompleted: false,
    }
  }

  // Calculate time differences in milliseconds
  const msUntilRegistrationDeadline = registrationDeadline.getTime() - now.getTime()
  const msUntilStart = startDate.getTime() - now.getTime()
  const msUntilEnd = endDate.getTime() - now.getTime()

  // Convert to days (using Math.floor for more accurate comparison)
  const daysUntilRegistrationDeadline = Math.floor(msUntilRegistrationDeadline / (1000 * 60 * 60 * 24))
  const daysUntilStart = Math.floor(msUntilStart / (1000 * 60 * 60 * 24))
  const daysUntilEnd = Math.floor(msUntilEnd / (1000 * 60 * 60 * 24))

 
  

  // Determine current phase and status
  let status: HackathonStatus["status"]
  let phase: HackathonStatus["phase"]
  let canRegister = false
  let isActive = false
  let isCompleted = false
  let timeRemaining: string | undefined
  let daysUntil: number | undefined

  // Check if hackathon is manually cancelled
  if (hackathon.status === "Cancelled") {
    return {
      status: "Cancelled",
      phase: "finished",
      canRegister: false,
      isActive: false,
      isCompleted: true,
    }
  }

  // Use clear boolean comparisons for more reliable date logic
  const isDeadlinePassed = now.getTime() > registrationDeadline.getTime()
  const isEventStarted = now.getTime() >= startDate.getTime()  
  const isEventEnded = now.getTime() > endDate.getTime()

  

  // Determine status based on timeline - using precise boolean logic
  if (isEventEnded) {
    // Event has ended
    status = "Completed"
    phase = "finished"
    isCompleted = true
    daysUntil = Math.abs(daysUntilEnd)
    timeRemaining = formatTimeRemaining(Math.abs(daysUntilEnd))
  } else if (isEventStarted) {
    // Event is currently happening
    status = "Active"
    phase = "ongoing"
    isActive = true
    daysUntil = Math.abs(daysUntilEnd)
    timeRemaining = formatTimeRemaining(Math.abs(daysUntilEnd))
  } else if (isDeadlinePassed) {
    // Registration has closed but event hasn't started
    status = "Registration Closed"
    phase = "preparation"
    daysUntil = Math.abs(daysUntilStart)
    timeRemaining = formatTimeRemaining(Math.abs(daysUntilStart))
  } else {
    // Registration is still open
    status = "Registration Open"
    phase = "registration"
    canRegister = true
    daysUntil = Math.abs(daysUntilRegistrationDeadline)
    timeRemaining = formatTimeRemaining(Math.abs(daysUntilRegistrationDeadline))
  }

  // Override with manual status if it makes sense
  if (hackathon.status === "Planning" && status === "Registration Open") {
    status = "Planning"
    phase = "upcoming"
    canRegister = false
  }

  return {
    status,
    phase,
    daysUntil: daysUntil || 0,
    timeRemaining,
    canRegister,
    isActive,
    isCompleted,
  }
}

/**
 * Calculate registration status for a user's registration
 */
export function getRegistrationStatus(registration: any, hackathonStatus: HackathonStatus): RegistrationStatus {
  const paymentStatus = registration.paymentStatus || "Pending"
  let status: RegistrationStatus["status"]
  let canPay = false
  let isActive = false
  let priority: RegistrationStatus["priority"] = "low"

  // Check if registration period is over
  if (!hackathonStatus.canRegister && hackathonStatus.status === "Registration Closed") {
    if (paymentStatus === "Completed") {
      status = "Confirmed"
      isActive = true
      priority = "medium"
    } else if (paymentStatus === "Pending") {
      // Registration exists but payment not completed and registration closed
      status = "Expired"
      priority = "low"
    } else {
      status = "Registered"
      isActive = true
      priority = "medium"
    }
  } else if (hackathonStatus.isCompleted) {
    // Event is over
    status = paymentStatus === "Completed" ? "Confirmed" : "Expired"
    isActive = false
    priority = "low"
  } else {
    // Registration is still open or event is active
    switch (paymentStatus) {
      case "Completed":
        status = "Confirmed"
        isActive = true
        priority = "high"
        break
      case "Pending":
        status = "Payment Pending"
        canPay = true
        isActive = true
        priority = "high"
        break
      case "Failed":
        status = "Payment Pending"
        canPay = true
        isActive = true
        priority = "high"
        break
      case "Refunded":
        status = "Expired"
        isActive = false
        priority = "low"
        break
      default:
        status = "Registered"
        isActive = true
        priority = "medium"
    }
  }

  return {
    status,
    paymentStatus,
    canPay,
    isActive,
    priority,
  }
}

/**
 * Format time remaining in a human-readable way
 */
function formatTimeRemaining(days: number): string {
  if (days < 0) return "Expired"
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  if (days < 7) return `${days} days`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? "1 week" : `${weeks} weeks`
  }
  const months = Math.floor(days / 30)
  return months === 1 ? "1 month" : `${months} months`
}

/**
 * Get status badge color based on status type
 */
export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "Registration Open":
      return "bg-green-100 text-green-800 border-green-200"
    case "Registration Closed":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "Active":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "Completed":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200"
    case "Planning":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "Confirmed":
      return "bg-green-100 text-green-800 border-green-200"
    case "Payment Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Expired":
      return "bg-red-100 text-red-800 border-red-200"
    case "Registered":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

/**
 * Get priority icon for registration status
 */
export function getStatusIcon(status: string): string {
  switch (status) {
    case "Registration Open":
      return ""
    case "Registration Closed":
      return ""
    case "Active":
      return ""
    case "Completed":
      return ""
    case "Cancelled":
      return ""
    case "Planning":
      return ""
    case "Confirmed":
      return ""
    case "Payment Pending":
      return ""
    case "Expired":
      return ""
    case "Registered":
      return ""
    default:
      return ""
  }
}

/**
 * Check if automatic status updates should occur
 * This can be used with a cron job or scheduled task
 */
export function shouldUpdateHackathonStatuses(): boolean {
  // Update statuses daily at midnight or when the app starts
  return true
}

/**
 * Bulk update hackathon statuses based on current date
 */
export function getBulkStatusUpdates(hackathons: any[]): Array<{ id: string; status: string }> {
  return hackathons
    .map((hackathon) => {
      const statusInfo = getHackathonStatus(hackathon)
      if (statusInfo.status !== hackathon.status) {
        return {
          id: hackathon._id,
          status: statusInfo.status,
        }
      }
      return null
    })
    .filter(Boolean) as Array<{ id: string; status: string }>
}

/**
 * Test function to debug status calculation for specific hackathon
 */
export function debugHackathonStatus(hackathon: any): void {
  console.log('\n🔍 DEBUGGING HACKATHON STATUS:')
  console.log('================================')
  
  const now = new Date()
  const registrationDeadline = new Date(hackathon.registrationDeadline)
  
  // Test with your specific case
  console.log('Current Date (now):', now.toString())
  console.log('Registration Deadline:', registrationDeadline.toString())
  console.log('Registration Deadline Raw:', hackathon.registrationDeadline)
  
  console.log('\nComparisons:')
  console.log('now > registrationDeadline:', now > registrationDeadline)
  console.log('now.getTime() > registrationDeadline.getTime():', now.getTime() > registrationDeadline.getTime())
  
  const timeDiff = now.getTime() - registrationDeadline.getTime()
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
  console.log('Time difference (ms):', timeDiff)
  console.log('Days difference:', daysDiff)
  
  const calculatedStatus = getHackathonStatus(hackathon)
  console.log('\nCalculated Status:', calculatedStatus)
  console.log('Current DB Status:', hackathon.status)
  console.log('Should Update:', calculatedStatus.status !== hackathon.status)
  console.log('================================\n')
}

/**
 * Force status update for debugging - bypasses any caching
 */
export function forceStatusCalculation(hackathon: any): HackathonStatus {
  // Clear any console to see fresh logs
  const result = getHackathonStatus(hackathon)
  
  // Additional validation
  const now = new Date()
  const regDeadline = new Date(hackathon.registrationDeadline)
  
  if (now > regDeadline && result.status === "Registration Open") {
    console.error('🚨 ERROR: Status calculation failed!')
    console.error('Current time:', now.toISOString())
    console.error('Registration deadline:', regDeadline.toISOString())
    console.error('Expected: Registration Closed, Got:', result.status)
  }
  
  return result
}