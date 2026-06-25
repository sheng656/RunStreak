// Shared API types — mirrors backend DTOs.
// Keep in sync with RunStreak.Api DTOs as the backend evolves.

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

// Matches backend UserBadgeDto — returned from GET /users/:id/badges
export interface UserBadge {
  badgeId: string
  name: string
  description: string
  iconUrl: string
  category: string
  pointsReward: number
  unlockedAt: string
}

// Matches backend LeaderboardEntryDto — returned from GET /leaderboard
export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  totalPoints: number
  currentStreak: number
  longestStreak: number
  totalDistanceKm: number
  totalRuns: number
}

// Matches backend UserStatsDto — returned from GET /users/:id/stats
export interface UserStats {
  totalRuns: number
  totalDistanceKm: number
  totalDurationMinutes: number
  averagePaceMinPerKm: number
  averageDistanceKm: number
  longestRunKm: number
  currentStreak: number
  longestStreak: number
}

// Backend runs list response shape: { runs, totalCount, page, pageSize }
export interface RunsListResponse {
  runs: Run[]
  totalCount: number
  page: number
  pageSize: number
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

// Backend LogRun returns { run, newlyUnlockedBadges } with 201
export interface LogRunResponse {
  run: Run
  newlyUnlockedBadges: Badge[]
}

// API error response shape
export interface ApiError {
  title: string
  status: number
  errors?: Record<string, string[]>
}
