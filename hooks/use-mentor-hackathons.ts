import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface MentorTeam {
  _id: string
  name: string
  projectTitle: string
  progress: number
  status: string
  submissionStatus: string
  memberCount: number
  members: Array<{
    _id: string
    name: string
    email: string
    image?: string
  }>
  teamLead: {
    _id: string
    name: string
    email: string
    image?: string
  } | null
  room?: string
  createdAt: string
  updatedAt: string
}

interface MentorHackathon {
  _id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  registrationStartDate: string
  registrationEndDate: string
  venue?: string
  location?: string
  mode: string
  maxParticipants: number
  currentParticipants: number
  registrationFee: number
  prizePool?: number
  organizer: string
  status: 'upcoming' | 'active' | 'completed'
  mentorStats: {
    teamCount: number
    averageProgress: number
    completedTeams: number
    activeTeams: number
    totalStudents: number
  }
  teams: MentorTeam[]
  daysUntilStart?: number | null
  daysUntilEnd?: number | null
  daysElapsed?: number | null
  createdAt: string
  updatedAt: string
}

interface MentorHackathonsData {
  hackathons: MentorHackathon[]
  pagination: {
    page: number
    limit: number
    totalHackathons: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  summary: {
    totalHackathons: number
    activeHackathons: number
    upcomingHackathons: number
    completedHackathons: number
    totalTeams: number
    totalStudents: number
    averageTeamProgress: number
    completedTeamSubmissions: number
  }
}

interface UseMentorHackathonsOptions {
  userId?: string
  page?: number
  limit?: number
  status?: 'all' | 'upcoming' | 'active' | 'completed'
  search?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseMentorHackathonsReturn {
  data: MentorHackathonsData | null
  hackathons: MentorHackathon[]
  summary: MentorHackathonsData['summary'] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  refresh: () => Promise<void>
}

export function useMentorHackathons(options: UseMentorHackathonsOptions = {}): UseMentorHackathonsReturn {
  const {
    userId,
    page = 1,
    limit = 10,
    status = 'all',
    search = '',
    autoRefresh = true,
    refreshInterval = 60000 // 1 minute
  } = options

  const [data, setData] = useState<MentorHackathonsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMentorHackathons = useCallback(async (showToast = false) => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      
      if (status !== 'all') {
        params.append('status', status)
      }
      
      if (search.trim()) {
        params.append('search', search.trim())
      }

      const response = await fetch(`/api/mentors/${userId}/hackathons?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mentor hackathons: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch mentor hackathons")
      }

      setData(result.data)
      
      if (showToast) {
        toast({
          title: "Success",
          description: "Hackathons data refreshed successfully"
        })
      }
    } catch (err) {
      console.error("Error fetching mentor hackathons:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch mentor hackathons"
      setError(errorMessage)
      
      if (showToast) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }, [userId, page, limit, status, search, toast])

  const refetch = useCallback(async () => {
    setLoading(true)
    await fetchMentorHackathons(false)
  }, [fetchMentorHackathons])

  const refresh = useCallback(async () => {
    await fetchMentorHackathons(true)
  }, [fetchMentorHackathons])

  // Initial fetch
  useEffect(() => {
    fetchMentorHackathons()
  }, [fetchMentorHackathons])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return

    const interval = setInterval(() => {
      fetchMentorHackathons(false)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchMentorHackathons, userId])

  return {
    data,
    hackathons: data?.hackathons || [],
    summary: data?.summary || null,
    loading,
    error,
    refetch,
    refresh
  }
}