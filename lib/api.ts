const API_BASE_URL = "/api";

export interface Hackathon {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  difficulty: string;
  venue?: string;
  registrationFee?: number;
  currentParticipants?: number;
  maxParticipants?: number;
  categories?: string[];
  prizes?: string[];
  registrationDeadline?: string;
  organizer?: { name: string };
  requirements?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error ${response.status}`,
        };
      }
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error occurred",
      };
    }
  }

  // Hackathons
  async getHackathons(params?: {
    status?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Hackathon[] | { hackathons: Hackathon[] }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<Hackathon[] | { hackathons: Hackathon[] }>(`/hackathons?${searchParams}`);
  }

  async getHackathon(id: string): Promise<ApiResponse<Hackathon>> {
    return this.request<Hackathon>(`/hackathons/${id}`);
  }

  async createHackathon(data: any): Promise<ApiResponse<Hackathon>> {
    return this.request<Hackathon>("/hackathons", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateHackathon(id: string, data: any): Promise<ApiResponse<Hackathon>> {
    return this.request<Hackathon>(`/hackathons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteHackathon(id: string): Promise<ApiResponse<unknown>> {
    return this.request<unknown>(`/hackathons/${id}`, {
      method: "DELETE",
    });
  }

  // Teams
  async getTeams(params?: {
    hackathon?: string;
    mentor?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request(`/teams?${searchParams}`);
  }

  async getTeam(id: string): Promise<ApiResponse<any>> {
    return this.request(`/teams/${id}`);
  }

  async createTeam(data: any): Promise<ApiResponse<any>> {
    return this.request("/teams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTeam(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(id: string): Promise<ApiResponse<any>> {
    return this.request(`/teams/${id}`, {
      method: "DELETE",
    });
  }

  // Users
  async getUsers(params?: {
    role?: string;
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request(`/users?${searchParams}`);
  }

  async createUser(data: any): Promise<ApiResponse<any>> {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
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

    return this.request(`/hackathon-registration?${searchParams}`)
  }
  async createRegistration(data: any): Promise<ApiResponse<any>> {
    return this.request("/hackathon-registration", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Certificates
  async getCertificates(params?: {
    user?: string;
    hackathon?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request(`/certificates?${searchParams}`);
  }

  async createCertificate(data: any): Promise<ApiResponse<any>> {
    return this.request("/certificates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();