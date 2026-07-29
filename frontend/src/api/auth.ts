import { apiClient } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/api'

const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  // Called on app mount to silently restore the session from the stored refresh token.
  // The refresh token is read from localStorage by the caller and passed here.
  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<{ message: string }>('/auth/change-password', { currentPassword, newPassword }),

  resetDemo: () =>
    apiClient.post<{ message: string }>('/auth/reset-demo'),
}

export default authApi
