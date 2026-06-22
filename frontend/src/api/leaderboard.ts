import { apiClient } from './client'
import type { LeaderboardEntry } from '../types/api'

const leaderboardApi = {
  get: (type: 'points' | 'streak' = 'points', page = 1, pageSize = 20) =>
    apiClient.get<{ entries: LeaderboardEntry[]; total: number }>('/leaderboard', {
      params: { type, page, pageSize },
    }),
}

export default leaderboardApi
