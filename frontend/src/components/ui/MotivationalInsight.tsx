import { Flame, Target, Trophy, Clock, Star, Zap } from 'lucide-react'
import type { UserProfile } from '../../types/api'
import type { Run } from '../../types/api'

interface MotivationalInsightProps {
  user: UserProfile
  recentRuns: Run[]
  weeklyDistanceKm: number
  weeklyGoalKm: number
  closestBadgeName?: string
  closestBadgeKmLeft?: number
}

interface InsightMessage {
  icon: React.ReactNode
  text: string
  accent: 'fire' | 'brand' | 'success' | 'warning' | 'muted'
}

function getInsight(
  user: UserProfile,
  recentRuns: Run[],
  weeklyDistanceKm: number,
  weeklyGoalKm: number,
  closestBadgeName?: string,
  closestBadgeKmLeft?: number,
): InsightMessage {
  const todayStr = new Date().toISOString().split('T')[0]
  const hasRunToday = recentRuns.some(r => r.runDate.split('T')[0] === todayStr)

  // 1. Streak at risk (has active streak but hasn't run today)
  if (user.currentStreak > 0 && !hasRunToday) {
    return {
      icon: <Flame size={16} />,
      text: `Your ${user.currentStreak}-day streak is on the line — log a run today to keep it alive! 🔥`,
      accent: 'fire',
    }
  }

  // 2. Streak multiplier milestone (just hit 7 days)
  if (user.currentStreak === 7) {
    return {
      icon: <Zap size={16} />,
      text: `7-day streak unlocked! You're now earning 1.5× points on every run. Keep it going! 🚀`,
      accent: 'brand',
    }
  }

  // 3. Just hit a round-number streak milestone (14, 21, 30, 60, 100...)
  const streakMilestones = [14, 21, 30, 60, 100, 150, 200, 365]
  if (streakMilestones.includes(user.currentStreak) && hasRunToday) {
    return {
      icon: <Trophy size={16} />,
      text: `${user.currentStreak} days strong! You're on fire — this is a milestone worth celebrating. 🏆`,
      accent: 'warning',
    }
  }

  // 4. Weekly goal almost reached (≥ 80% there)
  if (weeklyGoalKm > 0 && weeklyDistanceKm >= weeklyGoalKm * 0.8 && weeklyDistanceKm < weeklyGoalKm) {
    const remaining = (weeklyGoalKm - weeklyDistanceKm).toFixed(1)
    return {
      icon: <Target size={16} />,
      text: `Almost there! Just ${remaining} km left to hit your weekly goal of ${weeklyGoalKm} km. 🎯`,
      accent: 'success',
    }
  }

  // 5. Weekly goal already hit
  if (weeklyGoalKm > 0 && weeklyDistanceKm >= weeklyGoalKm) {
    const extra = (weeklyDistanceKm - weeklyGoalKm).toFixed(1)
    return {
      icon: <Star size={16} />,
      text: `Goal crushed! You're ${extra} km past your ${weeklyGoalKm} km target this week. Outstanding! ⭐`,
      accent: 'success',
    }
  }

  // 6. Close to a badge unlock
  if (closestBadgeName && closestBadgeKmLeft !== undefined && closestBadgeKmLeft <= 10 && closestBadgeKmLeft > 0) {
    return {
      icon: <Trophy size={16} />,
      text: `Only ${closestBadgeKmLeft.toFixed(1)} km from unlocking "${closestBadgeName}" — so close! 🏅`,
      accent: 'warning',
    }
  }

  // 7. No runs logged yet
  if (user.totalRuns === 0) {
    return {
      icon: <Flame size={16} />,
      text: `Welcome! Log your first run to start earning points and building your streak. 🌟`,
      accent: 'brand',
    }
  }

  // 8. Comeback nudge (last run was 2+ days ago, no streak)
  if (recentRuns.length > 0 && user.currentStreak === 0) {
    return {
      icon: <Clock size={16} />,
      text: `Ready to get back out there? Even a short 2 km jog can restart your streak today.`,
      accent: 'muted',
    }
  }

  // 9. Ran today — positive reinforcement
  if (hasRunToday) {
    return {
      icon: <Flame size={16} />,
      text: `Great work today! Come back tomorrow to keep your ${user.currentStreak}-day streak alive. 🔥`,
      accent: 'fire',
    }
  }

  // Default — general encouragement
  return {
    icon: <Zap size={16} />,
    text: `Every run counts. Keep showing up and the results will follow.`,
    accent: 'brand',
  }
}

const accentStyles: Record<string, string> = {
  fire: 'bg-[hsl(var(--color-fire)/0.08)] border-[hsl(var(--color-fire)/0.25)] text-[hsl(var(--color-fire))]',
  brand: 'bg-[hsl(var(--color-brand)/0.08)] border-[hsl(var(--color-brand)/0.25)] text-[hsl(var(--color-brand))]',
  success: 'bg-emerald-500/8 border-emerald-500/25 text-emerald-400',
  warning: 'bg-amber-500/8 border-amber-500/25 text-amber-400',
  muted: 'bg-[hsl(var(--color-surface-2))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]',
}

export default function MotivationalInsight({
  user,
  recentRuns,
  weeklyDistanceKm,
  weeklyGoalKm,
  closestBadgeName,
  closestBadgeKmLeft,
}: MotivationalInsightProps) {
  const insight = getInsight(user, recentRuns, weeklyDistanceKm, weeklyGoalKm, closestBadgeName, closestBadgeKmLeft)

  return (
    <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-sm animate-fade-in ${accentStyles[insight.accent]}`}>
      <span className="shrink-0 mt-0.5">{insight.icon}</span>
      <p className="leading-relaxed font-medium">{insight.text}</p>
    </div>
  )
}
