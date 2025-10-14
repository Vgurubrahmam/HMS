import { useEffect, useRef } from 'react'

interface BackgroundStatusUpdaterProps {
  /** Update interval in milliseconds (default: 5 minutes) */
  updateInterval?: number
  /** Enable automatic status updates */
  enabled?: boolean
  /** Callback when status update completes */
  onUpdate?: (result: { updated: number; success: boolean }) => void
}

/**
 * Background component that automatically updates hackathon statuses
 * This runs in the background and periodically calls the status update API
 */
export function BackgroundStatusUpdater({
  updateInterval = 5 * 60 * 1000, // 5 minutes default
  enabled = true,
  onUpdate,
}: BackgroundStatusUpdaterProps) {
  const intervalRef = useRef<NodeJS.Timeout>()

  const updateStatuses = async () => {
    try {
      const response = await fetch('/api/hackathons/update-statuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (onUpdate) {
        onUpdate({
          updated: result.updated || 0,
          success: result.success || false,
        })
      }

      

    } catch (error) {
      
      if (onUpdate) {
        onUpdate({
          updated: 0,
          success: false,
        })
      }
    }
  }

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Run immediately on mount
    updateStatuses()

    // Set up periodic updates
    intervalRef.current = setInterval(updateStatuses, updateInterval)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, updateInterval])

  // This component doesn't render anything visible
  return null
}

/**
 * Hook for manual status updates
 */
export function useStatusUpdater() {
  const updateStatuses = async (): Promise<{ updated: number; success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/hackathons/update-statuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      return {
        updated: result.updated || 0,
        success: result.success || false,
        message: result.message || 'Status update completed',
      }

    } catch (error) {
      console.error('Failed to update hackathon statuses:', error)
      
      return {
        updated: 0,
        success: false,
        message: 'Failed to update statuses',
      }
    }
  }

  const previewUpdates = async (): Promise<{ updates: any[]; total: number; success: boolean }> => {
    try {
      const response = await fetch('/api/hackathons/update-statuses', {
        method: 'GET',
      })

      const result = await response.json()
      
      return {
        updates: result.updates || [],
        total: result.total_hackathons || 0,
        success: result.success || false,
      }

    } catch (error) {
      console.error('Failed to preview hackathon status updates:', error)
      
      return {
        updates: [],
        total: 0,
        success: false,
      }
    }
  }

  return {
    updateStatuses,
    previewUpdates,
  }
}