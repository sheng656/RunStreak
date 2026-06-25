import { apiClient } from './client'
import type { LeaderboardEntry } from '../types/api'

const leaderboardApi = {
  // Backend returns List<LeaderboardEntryDto> directly (no wrapper object)
  get: (type: 'points' | 'streak' = 'points', page = 1, pageSize = 20) =>
    apiClient.get<LeaderboardEntry[]>('/leaderboard', {
      params: { type, page, pageSize },
    }),
}

export default leaderboardApi
