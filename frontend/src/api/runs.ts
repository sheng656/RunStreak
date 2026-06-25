import { apiClient } from './client'
import type {
  Run,
  CreateRunRequest,
  UpdateRunRequest,
  LogRunResponse,
  RunsListResponse,
} from '../types/api'

const runsApi = {
  list: (page = 1, pageSize = 10) =>
    apiClient.get<RunsListResponse>('/runs', {
      params: { page, pageSize },
    }),

  getById: (id: string) =>
    apiClient.get<Run>(`/runs/${id}`),

  create: (data: CreateRunRequest) =>
    apiClient.post<LogRunResponse>('/runs', data),

  update: (id: string, data: UpdateRunRequest) =>
    apiClient.put<{ run: Run; newlyUnlockedBadges: unknown[] }>(`/runs/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/runs/${id}`),
}

export default runsApi
