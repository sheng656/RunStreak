import { apiClient } from './client'
import type { UserProfile, UserBadge, UserStats } from '../types/api'

const usersApi = {
  getMe: () =>
    apiClient.get<UserProfile>('/users/me'),

  updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
    apiClient.put<UserProfile>('/users/me', data),

  getBadges: (userId: string) =>
    apiClient.get<UserBadge[]>(`/users/${userId}/badges`),

  getBadgesWithProgress: () =>
    apiClient.get<import('../types/api').BadgeWithProgress[]>('/users/me/badges-progress'),

  getStats: (userId: string) =>
    apiClient.get<UserStats>(`/users/${userId}/stats`),

  updateWeeklyGoal: (goalKm: number) =>
    apiClient.put<UserProfile>('/users/me/weekly-goal', { goalKm }),
}

export default usersApi
