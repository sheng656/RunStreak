// Shared API types — mirrors backend DTOs.

export interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl: string | null
  totalPoints: number
  currentStreak: number
  longestStreak: number
  totalDistanceKm: number
  totalRuns: number
  createdAt: string
}
// Keep in sync with RunStreak.Api DTOs as the backend evolves.

export interface Run {
  id: string
  userId: string
  distanceKm: number
  durationMinutes: number
  paceMinPerKm: number
  runDate: string // ISO 8601
  notes: string | null
  pointsEarned: number
  createdAt: string
  updatedAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  iconUrl: string
  category: 'distance' | 'streak' | 'milestone' | 'special'
  pointsReward: number
  isUnlocked: boolean
  unlockedAt: string | null
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarUrl: string | null
  totalPoints: number
  currentStreak: number
  isCurrentUser: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Auth DTOs
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  displayName: string
}

export interface AuthResponse {
  accessToken: string
  user: {
    id: string
    username: string
    email: string
    displayName: string
    avatarUrl: string | null
    totalPoints: number
    currentStreak: number
    longestStreak: number
    totalDistanceKm: number
    totalRuns: number
    createdAt: string
  }
}

// Run DTOs
export interface CreateRunRequest {
  distanceKm: number
  durationMinutes: number
  runDate: string
  notes?: string
}

export interface UpdateRunRequest {
  distanceKm: number
  durationMinutes: number
  runDate: string
  notes?: string
}

export interface LogRunResponse {
  run: Run
  pointsEarned: number
  newlyUnlockedBadges: Badge[]
}

// API error response shape
export interface ApiError {
  title: string
  status: number
  errors?: Record<string, string[]>
}
