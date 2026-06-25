import { apiClient } from './client'
import type { UserProfile, UserBadge, UserStats } from '../types/api'

const usersApi = {
  getMe: () =>
    apiClient.get<UserProfile>('/users/me'),

  updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
    apiClient.put<UserProfile>('/users/me', data),

  getBadges: (userId: string) =>
    apiClient.get<UserBadge[]>(`/users/${userId}/badges`),

  getStats: (userId: string) =>
    apiClient.get<UserStats>(`/users/${userId}/stats`),
}

export default usersApi
