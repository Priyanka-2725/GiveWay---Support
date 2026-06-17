import axios, { AxiosError, AxiosInstance } from 'axios'

type RequestParams = Record<string, string | number | boolean | undefined>

const TOKEN_STORAGE_KEY = 'auth_token'

function hasWindow() {
  return typeof window !== 'undefined'
}

function normalizeRole(role?: string) {
  return role?.toLowerCase()
}

class ApiClient {
  private token: string | null = null
  private http: AxiosInstance

  constructor() {
    this.http = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    })

    this.http.interceptors.request.use((config) => {
      const token = this.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.http.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ message?: string }>) => {
        const message = error.response?.data?.message || error.message || 'API request failed'
        return Promise.reject(new Error(message))
      }
    )
  }

  setToken(token: string) {
    this.token = token
    if (hasWindow()) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    if (!hasWindow()) return null

    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) {
      this.token = stored
    }
    return this.token
  }

  clearToken() {
    this.token = null
    if (hasWindow()) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }

  private async request<T>(method: 'get' | 'post' | 'patch' | 'delete', url: string, data?: unknown, params?: RequestParams): Promise<T> {
    const response = await this.http.request<T>({ method, url, data, params })
    return response.data
  }

  async signup(email: string, password: string, name?: string, role?: string) {
    const response = await this.request<{ token: string; user: any; message: string }>('post', '/auth/register', {
      email,
      password,
      name,
      role: normalizeRole(role),
    })
    this.setToken(response.token)
    return response
  }

  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any; message: string }>('post', '/auth/login', {
      email,
      password,
    })
    this.setToken(response.token)
    return response
  }

  async logout() {
    await this.request<{ success: boolean }>('post', '/auth/logout')
    this.clearToken()
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('get', '/auth/me')
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('post', '/auth/forgot-password', { email })
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ message: string }>('post', '/auth/reset-password', { token, password })
  }

  async verifyEmail(token: string) {
    return this.request<{ message: string; user: any }>('post', '/auth/verify-email', { token })
  }

  async updateUser(id: string, data: any) {
    return this.request<{ user: any }>('patch', `/users/${id}`, data)
  }

  async getNgos(params?: { verified?: boolean; limit?: number; cause?: string; state?: string }) {
    return this.request<{ ngos: any[] }>('get', '/ngos', undefined, params)
  }

  async getNgo(id: string) {
    return this.request<{ ngo: any }>('get', `/ngos/${id}`)
  }

  async createNgo(ngoData: any) {
    return this.request<{ ngo: any }>('post', '/ngos', ngoData)
  }

  async updateNgo(id: string, ngoData: any) {
    return this.request<{ ngo: any }>('patch', `/ngos/${id}`, ngoData)
  }

  async deleteNgo(id: string) {
    return this.request<{ success: boolean }>('delete', `/ngos/${id}`)
  }

  async getDonations(params?: { userId?: string; ngoId?: string; limit?: number }) {
    return this.request<{ donations: any[] }>('get', '/donations', undefined, params)
  }

  async createDonation(amount: number, userId: string, ngoId: string, message?: string) {
    return this.request<{ donation: any }>('post', '/donations', { amount, userId, ngoId, message })
  }

  async getNotifications(userId: string) {
    return this.request<{ notifications: any[] }>('get', `/notifications/${userId}`)
  }

  async markNotificationAsRead(id: string) {
    return this.request<{ success: boolean }>('patch', `/notifications/${id}/read`)
  }

  async getVolunteerRequests(params?: { ngoId?: string; userId?: string }) {
    return this.request<{ volunteerRequests: any[] }>('get', '/volunteers', undefined, params)
  }

  async createVolunteerRequest(ngoId: string, data: any) {
    return this.request<{ volunteerRequest: any }>('post', `/volunteers/${ngoId}`, data)
  }

  async updateVolunteerRequestStatus(id: string, status: 'accepted' | 'rejected') {
    return this.request<{ volunteerRequest: any }>('patch', `/volunteers/${id}/status`, { status })
  }

  async getMyFeed() {
    return this.request<{ feedItems: any[] }>('get', '/feed/my')
  }
}

export const apiClient = new ApiClient()
export default apiClient
