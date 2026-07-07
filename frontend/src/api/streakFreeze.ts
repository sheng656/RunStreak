import { apiClient } from './client'

export interface StreakFreezeStatus {
  streakFreezeCount: number
  totalPoints: number
}

export interface PurchaseResponse {
  message: string
  streakFreezeCount: number
  totalPoints: number
}

const streakFreezeApi = {
  getStatus: () => apiClient.get<StreakFreezeStatus>('/streak-freeze/status'),
  purchase: () => apiClient.post<PurchaseResponse>('/streak-freeze/purchase'),
}

export default streakFreezeApi
