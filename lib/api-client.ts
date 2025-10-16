import { getValidToken } from '@/lib/auth-utils'

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  requireAuth?: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  private async request<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { 
      method = 'GET', 
      body, 
      headers = {}, 
      requireAuth = true 
    } = options

    const url = `${this.baseUrl}${endpoint}`
    
    // Add authorization header if required
    if (requireAuth) {
      const token = getValidToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    // Add content type for JSON requests
    if (body && typeof body === 'object') {
      headers['Content-Type'] = 'application/json'
    }

    const config: RequestInit = {
      method,
      headers,
      ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) })
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }))
        throw new Error(errorData.error || errorData.message || 'Request failed')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API request failed: ${method} ${url}`, error)
      throw error
    }
  }

  // HTTP method helpers
  async get<T = any>(endpoint: string, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requireAuth })
  }

  async post<T = any>(endpoint: string, body?: any, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, requireAuth })
  }

  async put<T = any>(endpoint: string, body?: any, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, requireAuth })
  }

  async patch<T = any>(endpoint: string, body?: any, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, requireAuth })
  }

  async delete<T = any>(endpoint: string, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requireAuth })
  }

  // Specific API endpoints for common operations
  
  // Users
  async getUsers(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/users${query}`)
  }

  async getUserProfile(userId: string) {
    return this.get(`/users/${userId}`)
  }

  async updateUserProfile(userId: string, data: any) {
    return this.put(`/users/${userId}`, data)
  }

  // Hackathons
  async getHackathons(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/hackathons${query}`)
  }

  async getHackathon(hackathonId: string) {
    return this.get(`/hackathons/${hackathonId}`)
  }

  async createHackathon(data: any) {
    return this.post('/hackathons', data)
  }

  async updateHackathon(hackathonId: string, data: any) {
    return this.put(`/hackathons/${hackathonId}`, data)
  }

  async deleteHackathon(hackathonId: string) {
    return this.delete(`/hackathons/${hackathonId}`)
  }

  // Registrations
  async getRegistrations(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/registrations${query}`)
  }

  async createRegistration(data: any) {
    return this.post('/registrations', data)
  }

  async updateRegistration(registrationId: string, data: any) {
    return this.put(`/registrations/${registrationId}`, data)
  }

  // Payments
  async getPayments(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/payments${query}`)
  }

  async createPayment(data: any) {
    return this.post('/payments', data)
  }

  async updatePayment(paymentId: string, data: any) {
    return this.put(`/payments/${paymentId}`, data)
  }

  // Teams
  async getTeams(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/teams${query}`)
  }

  async createTeam(data: any) {
    return this.post('/teams', data)
  }

  async updateTeam(teamId: string, data: any) {
    return this.put(`/teams/${teamId}`, data)
  }

  // Certificates
  async getCertificates(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/certificates${query}`)
  }

  async generateCertificate(data: any) {
    return this.post('/certificates', data)
  }

  // Analytics
  async getAnalytics(params?: Record<string, any>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/analytics${query}`)
  }
}

// Create a singleton instance
export const apiClient = new ApiClient()

// Export the class for testing or custom instances
export default ApiClient