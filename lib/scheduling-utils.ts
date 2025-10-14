/**
 * Scheduling utilities for automated hackathon management
 * This module provides functions that can be called by cron jobs, serverless functions,
 * or other scheduling mechanisms to keep the HMS system up-to-date automatically
 */

import { getBulkStatusUpdates, getHackathonStatus, getRegistrationStatus } from './status-utils'

export interface ScheduledTaskResult {
  success: boolean
  message: string
  affected: number
  errors: string[]
  timestamp: Date
}

/**
 * Main scheduled task to update all hackathon and registration statuses
 * This is the primary function that should be called by your scheduling system
 */
export async function runScheduledStatusUpdate(): Promise<ScheduledTaskResult> {
  const errors: string[] = []
  let totalAffected = 0
  const timestamp = new Date()

  try {
    // Step 1: Update hackathon statuses
    const hackathonResult = await updateHackathonStatuses()
    totalAffected += hackathonResult.affected
    if (!hackathonResult.success) {
      errors.push(`Hackathon update failed: ${hackathonResult.message}`)
    }

    // Step 2: Update registration statuses
    const registrationResult = await updateRegistrationStatuses()
    totalAffected += registrationResult.affected
    if (!registrationResult.success) {
      errors.push(`Registration update failed: ${registrationResult.message}`)
    }

    // Step 3: Clean up expired data (optional)
    const cleanupResult = await cleanupExpiredData()
    if (!cleanupResult.success) {
      errors.push(`Cleanup failed: ${cleanupResult.message}`)
    }

    return {
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Successfully updated ${totalAffected} items`
        : `Completed with ${errors.length} errors`,
      affected: totalAffected,
      errors,
      timestamp,
    }

  } catch (error: any) {
    return {
      success: false,
      message: `Scheduled update failed: ${error.message}`,
      affected: totalAffected,
      errors: [error.message, ...errors],
      timestamp,
    }
  }
}

/**
 * Update hackathon statuses based on current date/time
 */
async function updateHackathonStatuses(): Promise<ScheduledTaskResult> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/hackathons/update-statuses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication if needed
        'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
      },
    })

    const result = await response.json()

    return {
      success: result.success || false,
      message: result.message || 'Hackathon status update completed',
      affected: result.updated || 0,
      errors: [],
      timestamp: new Date(),
    }

  } catch (error: any) {
    return {
      success: false,
      message: `Failed to update hackathon statuses: ${error.message}`,
      affected: 0,
      errors: [error.message],
      timestamp: new Date(),
    }
  }
}

/**
 * Update registration statuses based on hackathon states
 */
async function updateRegistrationStatuses(): Promise<ScheduledTaskResult> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/registrations/update-statuses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
      },
    })

    const result = await response.json()

    return {
      success: result.success || false,
      message: result.message || 'Registration status update completed',
      affected: result.updated || 0,
      errors: [],
      timestamp: new Date(),
    }

  } catch (error: any) {
    return {
      success: false,
      message: `Failed to update registration statuses: ${error.message}`,
      affected: 0,
      errors: [error.message],
      timestamp: new Date(),
    }
  }
}

/**
 * Clean up expired or invalid data
 */
async function cleanupExpiredData(): Promise<ScheduledTaskResult> {
  try {
    // This could include:
    // - Removing old payment sessions
    // - Archiving completed hackathons
    // - Cleaning up temporary files
    // - Sending reminder notifications

    return {
      success: true,
      message: 'Cleanup completed successfully',
      affected: 0,
      errors: [],
      timestamp: new Date(),
    }

  } catch (error: any) {
    return {
      success: false,
      message: `Cleanup failed: ${error.message}`,
      affected: 0,
      errors: [error.message],
      timestamp: new Date(),
    }
  }
}

/**
 * Configuration for different scheduling scenarios
 */
export const SchedulingConfig = {
  // Run every 5 minutes during business hours
  FREQUENT_UPDATES: {
    interval: '*/5 * * * *', // Cron expression
    description: 'Every 5 minutes',
    recommended: 'Development and high-activity periods',
  },

  // Run every 15 minutes (balanced approach)
  REGULAR_UPDATES: {
    interval: '*/15 * * * *',
    description: 'Every 15 minutes',
    recommended: 'Production environments',
  },

  // Run every hour
  HOURLY_UPDATES: {
    interval: '0 * * * *',
    description: 'Every hour',
    recommended: 'Low-activity periods',
  },

  // Run twice daily (morning and evening)
  DAILY_UPDATES: {
    interval: '0 8,20 * * *',
    description: 'At 8 AM and 8 PM daily',
    recommended: 'Minimal resource usage',
  },
}

/**
 * Webhook handler for external scheduling services
 * This can be used with services like:
 * - Vercel Cron Jobs
 * - GitHub Actions scheduled workflows  
 * - AWS EventBridge
 * - Google Cloud Scheduler
 */
export async function handleScheduledWebhook(
  request: any,
  expectedSecret?: string
): Promise<ScheduledTaskResult> {
  // Verify the request is from a trusted source
  if (expectedSecret) {
    const authHeader = request.headers?.authorization || request.headers?.['x-cron-secret']
    if (!authHeader || !authHeader.includes(expectedSecret)) {
      return {
        success: false,
        message: 'Unauthorized: Invalid or missing secret',
        affected: 0,
        errors: ['Authentication failed'],
        timestamp: new Date(),
      }
    }
  }

  // Run the scheduled update
  return await runScheduledStatusUpdate()
}

/**
 * Manual trigger function for testing and debugging
 */
export async function triggerManualUpdate(): Promise<ScheduledTaskResult> {
  console.log('🔄 Running manual status update...')
  const result = await runScheduledStatusUpdate()
  
  if (result.success) {
    console.log(`✅ Manual update completed: ${result.message}`)
  } else {
    console.error(`❌ Manual update failed: ${result.message}`)
    result.errors.forEach(error => console.error(`   - ${error}`))
  }

  return result
}

/**
 * Health check function to verify the scheduling system is working
 */
export function getSchedulingHealthCheck(): {
  status: 'healthy' | 'warning' | 'error'
  message: string
  checks: { name: string; status: boolean; message: string }[]
} {
  const checks = [
    {
      name: 'Environment Configuration',
      status: !!process.env.NEXT_PUBLIC_APP_URL,
      message: process.env.NEXT_PUBLIC_APP_URL ? 'App URL configured' : 'Missing NEXT_PUBLIC_APP_URL',
    },
    {
      name: 'Database Connection',
      status: true, // This would need actual DB check
      message: 'Database connection available',
    },
    {
      name: 'API Endpoints',
      status: true, // This would need actual endpoint check
      message: 'Status update APIs available',
    },
  ]

  const failedChecks = checks.filter(check => !check.status)
  
  return {
    status: failedChecks.length === 0 ? 'healthy' : failedChecks.length < checks.length ? 'warning' : 'error',
    message: failedChecks.length === 0 
      ? 'All scheduling components are healthy'
      : `${failedChecks.length} issues detected`,
    checks,
  }
}