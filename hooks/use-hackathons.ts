"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export function useHackathons(params?: {
  status?: string
  difficulty?: string
  search?: string
  page?: number
  limit?: number
}) {
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetchHackathons = async () => {
    try {
      setLoading(true)
      const response = await api.getHackathons(params)

      if (response.success && response.data) {
        setHackathons(response.data as any)
        if (response.pagination) {
          setPagination(response.pagination)
        }
        setError(null)
      } else {
        setError(response.error || "Failed to fetch hackathons")
      }
    } catch (err) {
      setError("An error occurred while fetching hackathons")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHackathons()
  }, [params?.status, params?.difficulty, params?.search, params?.page])

  const createHackathon = async (data: any) => {
    try {
      const response = await api.createHackathon(data)
      if (response.success) {
        await fetchHackathons() // Refresh the list
        return response
      }
      return response
    } catch (err) {
      return { success: false, error: "Failed to create hackathon" }
    }
  }

  const updateHackathon = async (id: string, data: any) => {
    try {
      const response = await api.updateHackathon(id, data)
      if (response.success) {
        await fetchHackathons() // Refresh the list
        return response
      }
      return response
    } catch (err) {
      return { success: false, error: "Failed to update hackathon" }
    }
  }

  const deleteHackathon = async (id: string) => {
    try {
      const response = await api.deleteHackathon(id)
      if (response.success) {
        await fetchHackathons() // Refresh the list
        return response
      }
      return response
    } catch (err) {
      return { success: false, error: "Failed to delete hackathon" }
    }
  }

  const refreshParticipantCounts = async () => {
    try {
      const response = await fetch('/api/hackathons/refresh-participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchHackathons() // Refresh hackathons after updating counts
        return result
      }
      return result
    } catch (error) {
      console.error('Failed to refresh participant counts:', error)
      return { success: false, error: 'Failed to refresh participant counts' }
    }
  }

  return {
    hackathons,
    loading,
    error,
    pagination,
    refetch: fetchHackathons,
    refreshParticipantCounts,
    createHackathon,
    updateHackathon,
    deleteHackathon,
  }
}
