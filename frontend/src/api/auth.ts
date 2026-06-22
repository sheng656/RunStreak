import { apiClient } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/api'

const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  logout: () =>
    apiClient.post('/auth/logout'),

  // Called on app mount to silently restore the session.
  // The refresh cookie is HttpOnly and auto-attached by the browser.
  // The X-CSRF-Token header is handled by the response interceptor in client.ts.
  refresh: () =>
    apiClient.post<{ accessToken: string }>('/auth/refresh'),
}

export default authApi
