import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface TeamGuidanceData {
  _id: string
  name: string
  hackathon: {
    _id: string
    title: string
    startDate: string
    endDate: string
    status: string
    venue: string
    prizePool?: number
  }
  members: Array<{
    _id: string
    name: string
    email: string
    image?: string
    role: string
    skills: string[]
  }>
  project: {
    title: string
    description: string
    repository: string
    liveUrl: string
    techStack: string[]
  }
  progress: number
  currentPhase: "Planning" | "Development" | "Testing" | "Demo" | "Completed"
  status: string
  submissionStatus: string
  milestones: Array<{
    _id: string
    title: string
    status: "Completed" | "In Progress" | "Pending"
    dueDate: string
    description: string
  }>
  meetings: Array<{
    _id: string
    title: string
    date: string
    duration: number
    attendees: string[]
    notes?: string
    type: string
  }>
  feedback: Array<{
    _id: string
    message: string
    date: string
    rating: number
    type: string
    mentor: string
  }>
  room?: string
  metrics: {
    totalMembers: number
    activeMembers: number
    lastActivity: string
    nextMilestone?: any
    riskLevel: "low" | "medium" | "high"
    engagementScore: number
  }
}

export interface GuidanceSummary {
  totalTeams: number
  activeTeams: number
  averageProgress: number
  teamsAtRisk: number
  upcomingMilestones: number
}

export interface MentorSession {
  _id: string
  team: string
  teamName?: string
  title: string
  scheduledDate: string
  duration: number
  type: "One-on-One" | "Group" | "Code Review" | "Presentation"
  status: "Scheduled" | "Completed" | "Cancelled"
  agenda?: string
  meetingLink?: string
  notes?: string
}

interface UseTeamGuidanceOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseTeamGuidanceReturn {
  // Data
  teams: TeamGuidanceData[]
  sessions: {
    all: MentorSession[]
    scheduled: MentorSession[]
    completed: MentorSession[]
    upcoming: MentorSession[]
  }
  summary: GuidanceSummary
  
  // Loading states
  loading: boolean
  sessionsLoading: boolean
  
  // Error states
  error: string | null
  sessionsError: string | null
  
  // Actions
  refetch: () => Promise<void>
  refetchSessions: () => Promise<void>
  submitFeedback: (teamId: string, feedback: { message: string; rating: number; type: string }) => Promise<boolean>
  scheduleSession: (teamId: string, sessionData: any) => Promise<boolean>
  updateTeamProgress: (teamId: string, progress: number) => Promise<boolean>
}

export function useTeamGuidance(
  mentorId: string | undefined,
  options: UseTeamGuidanceOptions = {}
): UseTeamGuidanceReturn {
  const { autoRefresh = true, refreshInterval = 60000 } = options
  const { toast } = useToast()

  // State
  const [teams, setTeams] = useState<TeamGuidanceData[]>([])
  const [sessions, setSessions] = useState<{
    all: MentorSession[]
    scheduled: MentorSession[]
    completed: MentorSession[]
    upcoming: MentorSession[]
  }>({
    all: [],
    scheduled: [],
    completed: [],
    upcoming: []
  })
  const [summary, setSummary] = useState<GuidanceSummary>({
    totalTeams: 0,
    activeTeams: 0,
    averageProgress: 0,
    teamsAtRisk: 0,
    upcomingMilestones: 0
  })

  // Loading states
  const [loading, setLoading] = useState(false)
  const [sessionsLoading, setSessionsLoading] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)
  const [sessionsError, setSessionsError] = useState<string | null>(null)

  // Fetch teams guidance data
  const fetchGuidanceData = useCallback(async () => {
    if (!mentorId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/mentors/${mentorId}/guidance`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch guidance data')
      }

      setTeams(data.data || [])
      setSummary(data.summary || summary)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch guidance data'
      setError(errorMessage)
      console.error('Error fetching guidance data:', err)
    } finally {
      setLoading(false)
    }
  }, [mentorId])

  // Fetch sessions data
  const fetchSessions = useCallback(async () => {
    if (!mentorId) return

    try {
      setSessionsLoading(true)
      setSessionsError(null)

      const response = await fetch(`/api/mentors/${mentorId}/sessions`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch sessions')
      }

      setSessions(data.data || sessions)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions'
      setSessionsError(errorMessage)
      console.error('Error fetching sessions:', err)
    } finally {
      setSessionsLoading(false)
    }
  }, [mentorId])

  // Submit feedback
  const submitFeedback = useCallback(async (
    teamId: string, 
    feedback: { message: string; rating: number; type: string }
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/teams/${teamId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedback,
          mentorId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback')
      }

      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      })

      // Refresh data to show new feedback
      await fetchGuidanceData()
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [mentorId, fetchGuidanceData, toast])

  // Schedule session
  const scheduleSession = useCallback(async (
    teamId: string,
    sessionData: any
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/mentors/${mentorId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionData,
          teamId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule session')
      }

      toast({
        title: "Success",
        description: "Session scheduled successfully",
      })

      // Refresh sessions to show new session
      await fetchSessions()
      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule session'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [mentorId, fetchSessions, toast])

  // Update team progress (mock implementation)
  const updateTeamProgress = useCallback(async (
    teamId: string,
    progress: number
  ): Promise<boolean> => {
    try {
      // Mock implementation - in real app, this would call an API
      setTeams(prevTeams => 
        prevTeams.map(team => 
          team._id === teamId 
            ? { ...team, progress }
            : team
        )
      )

      toast({
        title: "Success",
        description: "Team progress updated",
      })

      return true

    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      })
      return false
    }
  }, [toast])

  // Initial fetch
  useEffect(() => {
    if (mentorId) {
      fetchGuidanceData()
      fetchSessions()
    }
  }, [mentorId, fetchGuidanceData, fetchSessions])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !mentorId) return

    const interval = setInterval(() => {
      fetchGuidanceData()
      fetchSessions()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, mentorId, fetchGuidanceData, fetchSessions])

  return {
    // Data
    teams,
    sessions,
    summary,
    
    // Loading states
    loading,
    sessionsLoading,
    
    // Error states
    error,
    sessionsError,
    
    // Actions
    refetch: fetchGuidanceData,
    refetchSessions: fetchSessions,
    submitFeedback,
    scheduleSession,
    updateTeamProgress
  }
}