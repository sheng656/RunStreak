import { apiClient } from './client'
import type { Challenge, ActiveChallengeSummary } from '../types/api'

const challengesApi = {
  list: () => apiClient.get<Challenge[]>('/challenges'),
  getActive: () => apiClient.get<ActiveChallengeSummary | null>('/challenges/active'),
  start: (challengeId: string) => apiClient.post<{ message: string }>('/challenges/start', { challengeId }),
}


export default challengesApi
