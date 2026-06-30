import { useEffect, useState } from 'react'
import { Medal, Trophy, Star, MapPin, Flame, Award, Lock, Sparkles } from 'lucide-react'
import usersApi from '../api/users'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import type { BadgeWithProgress, BadgeRarity } from '../types/api'

const categoryIcons: Record<string, typeof Trophy> = {
  distance: MapPin,
  streak: Flame,
  milestone: Star,
  special: Award,
}

const RARITY_DESCRIPTIONS: Record<BadgeRarity, { border: string; glow: string; text: string; bg: string; label: string }> = {
  common: {
    border: 'border-slate-500/20',
    glow: '',
    text: 'text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
    label: 'Common',
  },
  rare: {
    border: 'border-blue-500/20',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    label: 'Rare',
  },
  epic: {
    border: 'border-purple-500/20 border-l-purple-500/50',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    label: 'Epic',
  },
  legendary: {
    border: 'border-amber-500/35 border-l-amber-500',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    label: 'Legendary',
  },
  heroic: {
    border: 'border-rose-500/40 border-l-rose-500 border-l-2',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.35)]',
    text: 'text-rose-500',
    bg: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    label: 'Heroic',
  },
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeRarity, setActiveRarity] = useState<string>('all')

  useEffect(() => {
    async function load() {
      try {
        const res = await usersApi.getBadgesWithProgress()
        setBadges(res.data)
      } catch {
        // Fallback or silent handle
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading badges..." />
      </div>
    )
  }

  // Filter lists
  const categories = ['all', 'distance', 'streak', 'milestone', 'special']
  const rarities = ['all', 'common', 'rare', 'epic', 'legendary', 'heroic']

  // Apply filters
  const filteredBadges = badges.filter((b) => {
    const matchCategory = activeCategory === 'all' || b.category === activeCategory
    const matchRarity = activeRarity === 'all' || b.rarity === activeRarity
    return matchCategory && matchRarity
  })

  // Calculations for stats summary
  const unlockedCount = badges.filter((b) => b.isUnlocked).length
  const totalCount = badges.length
  const totalPointsAwarded = badges.filter((b) => b.isUnlocked).reduce((sum, b) => sum + b.pointsReward, 0)

  // Group by category for visual sections
  const categoriesToRender = activeCategory === 'all' 
    ? ['distance', 'streak', 'milestone', 'special']
    : [activeCategory]

  return (
    <div className="page-container space-y-6">
      {/* Header and stats card */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="page-title">Badges &amp; Achievements</h1>
          <p className="page-subtitle">Track your goals and unlock bonus points</p>
        </div>
        <div className="flex gap-4 bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 self-stretch sm:self-auto justify-around sm:justify-start">
          <div className="text-center sm:text-left px-2">
            <span className="text-xs text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-semibold">Unlocked</span>
            <p className="text-2xl font-black text-[hsl(var(--color-text))]">{unlockedCount} / {totalCount}</p>
          </div>
          <div className="border-l border-[hsl(var(--color-border))] mx-1" />
          <div className="text-center sm:text-left px-2">
            <span className="text-xs text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-semibold">Bonus Points</span>
            <p className="text-2xl font-black text-amber-500">+{totalPointsAwarded} pts</p>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="space-y-1.5">
            <span className="text-xs text-[hsl(var(--color-text-muted))] font-bold uppercase tracking-wider">Category</span>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`btn btn-sm capitalize whitespace-nowrap px-3 py-1 text-xs ${
                    activeCategory === cat ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rarity */}
          <div className="space-y-1.5">
            <span className="text-xs text-[hsl(var(--color-text-muted))] font-bold uppercase tracking-wider">Rarity</span>
            <div className="flex flex-wrap gap-1">
              {rarities.map((rare) => (
                <button
                  key={rare}
                  onClick={() => setActiveRarity(rare)}
                  className={`btn btn-sm capitalize whitespace-nowrap px-3 py-1 text-xs ${
                    activeRarity === rare ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {rare}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Badges presentation */}
      {filteredBadges.length === 0 ? (
        <EmptyState
          icon={<Medal size={48} />}
          title="No badges found"
          description="Try adjusting your filter settings above."
        />
      ) : (
        <div className="space-y-8">
          {categoriesToRender.map((cat) => {
            const catBadges = filteredBadges.filter((b) => b.category === cat)
            if (catBadges.length === 0) return null

            const catUnlocked = badges.filter((b) => b.category === cat && b.isUnlocked).length
            const catTotal = badges.filter((b) => b.category === cat).length
            const progressPercent = catTotal > 0 ? (catUnlocked / catTotal) * 100 : 0

            return (
              <div key={cat} className="space-y-3">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[hsl(var(--color-border))]">
                  <h2 className="text-lg font-extrabold text-[hsl(var(--color-text))] capitalize flex items-center gap-2">
                    {cat === 'distance' && <MapPin size={18} className="text-emerald-500" />}
                    {cat === 'streak' && <Flame size={18} className="text-orange-500 animate-pulse" />}
                    {cat === 'milestone' && <Star size={18} className="text-yellow-500" />}
                    {cat === 'special' && <Award size={18} className="text-blue-500" />}
                    {cat} Achievements
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[hsl(var(--color-text-muted))]">
                      {catUnlocked} / {catTotal} Unlocked
                    </span>
                    <div className="w-24 h-1.5 bg-[hsl(var(--color-border))] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Badge Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catBadges.map((badge) => {
                    const Icon = categoryIcons[badge.category] || Trophy
                    const t = RARITY_DESCRIPTIONS[badge.rarity] || RARITY_DESCRIPTIONS.common

                    return (
                      <div
                        key={badge.id}
                        className={`card relative overflow-hidden flex flex-col p-5 border transition-all duration-300 ${
                          badge.isUnlocked
                            ? `${t.border} ${t.glow} hover:-translate-y-0.5 hover:shadow-lg`
                            : 'border-[hsl(var(--color-border))] bg-slate-900/10 opacity-70 grayscale-[35%]'
                        }`}
                      >
                        {/* Lock Overlay for Locked Badges */}
                        {!badge.isUnlocked && (
                          <div className="absolute top-3 right-3 text-[hsl(var(--color-text-muted))]" title="Locked">
                            <Lock size={14} />
                          </div>
                        )}

                        {/* Unlocked Sparkle Indicator */}
                        {badge.isUnlocked && (
                          <div className="absolute top-3 right-3 text-emerald-500" title="Unlocked">
                            <Sparkles size={14} className="animate-pulse" />
                          </div>
                        )}

                        <div className="flex gap-4 items-start flex-1">
                          {/* Badge Icon circle */}
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                              badge.isUnlocked
                                ? `${t.bg} border-current`
                                : 'bg-[hsl(var(--color-surface-2))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]'
                            }`}
                          >
                            {badge.iconUrl && badge.isUnlocked ? (
                              <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8 object-contain" />
                            ) : (
                              <Icon size={22} />
                            )}
                          </div>

                          {/* Badge Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-bold truncate text-sm sm:text-base ${badge.isUnlocked ? 'text-[hsl(var(--color-text))]' : 'text-[hsl(var(--color-text-muted))]'}`}>
                                {badge.name}
                              </h3>
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border leading-none ${t.bg}`}>
                                {t.label}
                              </span>
                            </div>
                            <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                              {badge.description}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar & Rewards at the bottom */}
                        <div className="mt-4 pt-3 border-t border-[hsl(var(--color-border))] flex items-center justify-between gap-4">
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded">
                            +{badge.pointsReward} pts
                          </span>
                          
                          {/* Locked progress */}
                          {!badge.isUnlocked && badge.targetThreshold > 0 && (
                            <div className="flex-1 max-w-[150px] space-y-1 text-right">
                              <div className="h-1 bg-[hsl(var(--color-border))] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-slate-500 rounded-full" 
                                  style={{ width: `${Math.min((badge.currentProgress / badge.targetThreshold) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-[9px] font-bold text-[hsl(var(--color-text-muted))]">
                                {badge.progressLabel}
                              </span>
                            </div>
                          )}

                          {/* Unlocked date */}
                          {badge.isUnlocked && badge.unlockedAt && (
                            <span className="text-[10px] font-medium text-[hsl(var(--color-text-muted))]">
                              Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
