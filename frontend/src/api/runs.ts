import { apiClient } from './client'
import type {
  Run,
  CreateRunRequest,
  UpdateRunRequest,
  LogRunResponse,
  PaginatedResponse,
} from '../types/api'

const runsApi = {
  list: (page = 1, pageSize = 10) =>
    apiClient.get<PaginatedResponse<Run>>('/runs', {
      params: { page, pageSize },
    }),

  getById: (id: string) =>
    apiClient.get<Run>(`/runs/${id}`),

  create: (data: CreateRunRequest) =>
    apiClient.post<LogRunResponse>('/runs', data),

  update: (id: string, data: UpdateRunRequest) =>
    apiClient.put<Run>(`/runs/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/runs/${id}`),
}

export default runsApi
