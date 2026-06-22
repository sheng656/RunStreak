import { apiClient } from './client'
import type { Badge } from '../types/api'

const badgesApi = {
  getAll: () =>
    apiClient.get<Badge[]>('/badges'),
}

export default badgesApi
