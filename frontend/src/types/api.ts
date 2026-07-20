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
  streakFreezeCount: number
  weeklyGoalKm: number
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
  // RPE scale 1–5: 1=Very Easy, 2=Easy, 3=Moderate, 4=Hard, 5=Very Hard
  perceivedEffort: number | null
  createdAt: string
  updatedAt: string
}

// Badge rarity tiers inspired by game achievement systems
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'heroic'

export interface Badge {
  id: string
  name: string
  description: string
  iconUrl: string
  category: 'distance' | 'streak' | 'milestone' | 'special'
  rarity: BadgeRarity
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
  rarity: BadgeRarity
  pointsReward: number
  unlockedAt: string
}

// Badge with progress toward unlock — returned from GET /api/badges (all badges with progress)
export interface BadgeWithProgress {
  id: string
  name: string
  description: string
  iconUrl: string
  category: string
  rarity: BadgeRarity
  pointsReward: number
  isUnlocked: boolean
  unlockedAt: string | null
  currentProgress: number  // how far user is toward this badge
  targetThreshold: number  // threshold required to unlock
  progressLabel: string    // human-readable progress label e.g. "7 / 10 runs"
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
  // Weekly stats
  weeklyDistanceKm: number
  weeklyRunCount: number
  weeklyGoalKm: number
  weeklyPoints: number
  lastWeekDistanceKm: number
  lastWeekRunCount: number
  lastWeekPoints: number
  bestWeekDistanceKm: number
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
  // Refresh token returned in the response body; stored in localStorage by the client
  // for session persistence across page reloads.
  refreshToken: string
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
    streakFreezeCount: number
    createdAt: string
  }
}

// Run DTOs
export interface CreateRunRequest {
  distanceKm: number
  durationMinutes: number
  runDate: string
  notes?: string
  perceivedEffort?: number
}

export interface UpdateRunRequest {
  distanceKm: number
  durationMinutes: number
  runDate: string
  notes?: string
  perceivedEffort?: number
}

// Backend LogRun returns { run, newlyUnlockedBadges } with 201
export interface LogRunResponse {
  run: Run
  newlyUnlockedBadges: Badge[]
}

// AI screenshot import response — returned from POST /api/runs/import-screenshot
export interface ScreenshotImportResponse {
  success: boolean
  errorMessage: string | null

  // Required fields (must be present for a valid run record)
  activityDate: string | null   // ISO 8601 date string
  distanceKm: number | null
  durationMinutes: number | null

  // Optional enrichment fields
  paceMinPerKm: number | null
  caloriesBurned: number | null
  averageHeartRate: number | null
  elevationGainMeters: number | null
  cadence: number | null
  detectedPlatform: string | null  // "Strava", "Garmin", "Nike Run Club", etc.

  // 0.0–1.0 confidence indicator from the AI model
  confidence: number
}

// API error response shape
export interface ApiError {
  title: string
  status: number
  errors?: Record<string, string[]>
}
