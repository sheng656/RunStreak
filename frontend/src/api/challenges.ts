import client from './client'
import type { Challenge, ActiveChallengeSummary } from '../types/api'

const challengesApi = {
  list: () => client.get<Challenge[]>('/challenges'),
  getActive: () => client.get<ActiveChallengeSummary | null>('/challenges/active'),
  start: (challengeId: string) => client.post<{ message: string }>('/challenges/start', { challengeId }),
}

export default challengesApi
