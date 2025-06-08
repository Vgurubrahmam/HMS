"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export function useCertificates(params?: {
  user?: string
  hackathon?: string
  type?: string
  page?: number
  limit?: number
}) {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await api.getCertificates(params)

      if (response.success && response.data) {
        setCertificates(response.data as any)
        if (response.pagination) {
          setPagination(response.pagination)
        }
        setError(null)
      } else {
        setError(response.error || "Failed to fetch certificates")
      }
    } catch (err) {
      setError("An error occurred while fetching certificates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [params?.user, params?.hackathon, params?.type, params?.page])

  const createCertificate = async (data: any) => {
    try {
      const response = await api.createCertificate(data)
      if (response.success) {
        await fetchCertificates() // Refresh the list
        return response
      }
      return response
    } catch (err) {
      return { success: false, error: "Failed to create certificate" }
    }
  }

  return {
    certificates,
    loading,
    error,
    pagination,
    refetch: fetchCertificates,
    createCertificate,
  }
}
