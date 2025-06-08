"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export function useRegistrations(params?: {
  user?: string
  hackathon?: string
  paymentStatus?: string
  page?: number
  limit?: number
}) {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const response = await api.getRegistrations(params)

      if (response.success && response.data) {
        setRegistrations(response.data as any)
        if (response.pagination) {
          setPagination(response.pagination)
        }
        setError(null)
      } else {
        setError(response.error || "Failed to fetch registrations")
      }
    } catch (err) {
      setError("An error occurred while fetching registrations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [params?.user, params?.hackathon, params?.paymentStatus, params?.page])

  const createRegistration = async (data: any) => {
    try {
      const response = await api.createRegistration(data)
      if (response.success) {
        await fetchRegistrations() // Refresh the list
        return response
      }
      return response
    } catch (err) {
      return { success: false, error: "Failed to create registration" }
    }
  }

  return {
    registrations,
    loading,
    error,
    pagination,
    refetch: fetchRegistrations,
    createRegistration,
  }
}
