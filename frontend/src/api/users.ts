import { apiClient } from './client'
import type { UserProfile, Badge } from '../types/api'

const usersApi = {
  getMe: () =>
    apiClient.get<UserProfile>('/users/me'),

  updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
    apiClient.put<UserProfile>('/users/me', data),

  getBadges: (userId: string) =>
    apiClient.get<Badge[]>(`/users/${userId}/badges`),
}

export default usersApi
