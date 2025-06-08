const API_BASE_URL = "/api"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error("API request failed:", error)
      return {
        success: false,
        error: "Network error occurred",
      }
    }
  }

  // Hackathons
  async getHackathons(params?: {
    status?: string
    difficulty?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/hackathons?${searchParams}`)
  }

  async getHackathon(id: string) {
    return this.request(`/hackathons/${id}`)
  }

  async createHackathon(data: any) {
    return this.request("/hackathons", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateHackathon(id: string, data: any) {
    return this.request(`/hackathons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteHackathon(id: string) {
    return this.request(`/hackathons/${id}`, {
      method: "DELETE",
    })
  }

  // Teams
  async getTeams(params?: {
    hackathon?: string
    mentor?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/teams?${searchParams}`)
  }

  async getTeam(id: string) {
    return this.request(`/teams/${id}`)
  }

  async createTeam(data: any) {
    return this.request("/teams", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTeam(id: string, data: any) {
    return this.request(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteTeam(id: string) {
    return this.request(`/teams/${id}`, {
      method: "DELETE",
    })
  }

  // Users
  async getUsers(params?: {
    role?: string
    department?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/users?${searchParams}`)
  }

  async createUser(data: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Registrations
  async getRegistrations(params?: {
    user?: string
    hackathon?: string
    paymentStatus?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/registrations?${searchParams}`)
  }

  async createRegistration(data: any) {
    return this.request("/registrations", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Certificates
  async getCertificates(params?: {
    user?: string
    hackathon?: string
    type?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/certificates?${searchParams}`)
  }

  async createCertificate(data: any) {
    return this.request("/certificates", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()
