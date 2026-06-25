import { useEffect, useState } from 'react'
import { Medal, Trophy, Star, MapPin, Flame, Award } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import usersApi from '../api/users'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import type { UserBadge } from '../types/api'

// Map badge categories to icons for visual variety
const categoryIcons: Record<string, typeof Trophy> = {
  distance: MapPin,
  streak: Flame,
  milestone: Star,
  special: Award,
}

const categoryColors: Record<string, string> = {
  distance: 'bg-[hsl(var(--color-success)/0.1)] text-[hsl(var(--color-success))]',
  streak: 'bg-[hsl(var(--color-fire)/0.1)] text-[hsl(var(--color-fire))]',
  milestone: 'bg-[hsl(var(--color-brand)/0.1)] text-[hsl(var(--color-brand))]',
  special: 'bg-[hsl(var(--color-warning)/0.1)] text-[hsl(var(--color-warning))]',
}

export default function BadgesPage() {
  const { user } = useAuthStore()
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const res = await usersApi.getBadges(user.id)
        setBadges(res.data)
      } catch {
        // Silently handle
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const categories = ['all', ...new Set(badges.map((b) => b.category))]
  const filtered = filter === 'all' ? badges : badges.filter((b) => b.category === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading badges..." />
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Badges & Achievements</h1>
        <p className="page-subtitle">
          {badges.length} badge{badges.length !== 1 ? 's' : ''} unlocked
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`btn btn-sm whitespace-nowrap capitalize ${
                filter === cat ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {badges.length === 0 ? (
        <EmptyState
          icon={<Medal size={48} />}
          title="No badges yet"
          description="Start logging runs to unlock achievements and earn bonus points."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((badge, i) => {
            const Icon = categoryIcons[badge.category] || Trophy
            const colorClass = categoryColors[badge.category] || categoryColors.milestone

            return (
              <div
                key={badge.badgeId}
                className={`card card-interactive p-5 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Badge icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={24} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[hsl(var(--color-text))]">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-[hsl(var(--color-text-muted))] mt-0.5">
                      {badge.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="badge-chip bg-[hsl(var(--color-fire)/0.1)] text-[hsl(var(--color-fire))]">
                        +{badge.pointsReward} pts
                      </span>
                      <span className="text-xs text-[hsl(var(--color-text-muted))]">
                        {new Date(badge.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
