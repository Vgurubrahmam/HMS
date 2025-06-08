"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export function useUsers(params?: {
  role?: string
  department?: string
  search?: string
  page?: number
  limit?: number
}) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.getUsers(params)

      if (response.success && response.data) {
        setUsers(response.data as any)
        if (response.pagination) {
          setPagination(response.pagination)
        }
        setError(null)
      } else {
        setError(response.error || "Failed to fetch users")
      }
    } catch (err) {
      setError("An error occurred while fetching users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [params?.role, params?.department, params?.search, params?.page])

  const createUser = async (data: any) => {
    try {
      const response = await api.createUser(data)
      if (response.success) {
        await fetchUsers() // Refresh the list
        return response
      }
      return response
    } catch (err) {
      return { success: false, error: "Failed to create user" }
    }
  }

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers,
    createUser,
  }
}
