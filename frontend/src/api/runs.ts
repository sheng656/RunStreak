import { apiClient } from './client'
import type {
  Run,
  CreateRunRequest,
  UpdateRunRequest,
  LogRunResponse,
  RunsListResponse,
  ScreenshotImportResponse,
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

  // AI-powered screenshot OCR import.
  // Sends a multipart/form-data request with the image; the backend calls
  // Gemini to extract run data and returns a structured ScreenshotImportResponse.
  importScreenshot: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<ScreenshotImportResponse>('/runs/import-screenshot', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default runsApi
