"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export function useTeams(params?: {
  hackathon?: string
  mentor?: string
  status?: string
  page?: number
  limit?: number
}) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await api.getTeams(params)

      if (response.success && response.data) {
        setTeams(response.data as any)
        if (response.pagination) {
          setPagination(response.pagination)
        }
        setError(null)
      } else {
        setError(response.error || "Failed to fetch teams")
      }
    } catch (err) {
      setError("An error occurred while fetching teams")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [params?.hackathon, params?.mentor, params?.status, params?.page])

  const createTeam = async (data: any) => {
    try {
      const response = await api.createTeam(data)
      if (response.success) {
        await fetchTeams() // Refresh the list
        return response
      }
      return response
    } catch (err) {
      return { success: false, error: "Failed to create team" }
    }
  }

  const updateTeam = async (id: string, data: any) => {
    try {
      const response = await api.updateTeam(id, data)
      if (response.success) {
        await fetchTeams() // Refresh the list
        return response
      }
      return response
    } catch (err) {
      return { success: false, error: "Failed to update team" }
    }
  }

  const deleteTeam = async (id: string) => {
    try {
      const response = await api.deleteTeam(id)
      if (response.success) {
        await fetchTeams() // Refresh the list
        return response
      }
      return response
    } catch (err) {
      return { success: false, error: "Failed to delete team" }
    }
  }

  return {
    teams,
    loading,
    error,
    pagination,
    refetch: fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  }
}
