import { useEffect, useState } from 'react'
import { Compass, CheckCircle, Flag, MapPin, Award, ArrowRight, Trophy, AlertTriangle, X } from 'lucide-react'
import challengesApi from '../api/challenges'
import usersApi from '../api/users'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ShareCard from '../components/ui/ShareCard'
import toast from 'react-hot-toast'
import type { Challenge, BadgeWithProgress } from '../types/api'

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [pendingChallenge, setPendingChallenge] = useState<Challenge | null>(null)
  const [userBadges, setUserBadges] = useState<BadgeWithProgress[]>([])
  const [selectedBadgeForShare, setSelectedBadgeForShare] = useState<BadgeWithProgress | null>(null)

  async function loadChallenges() {
    try {
      const [challengesRes, badgesRes] = await Promise.all([
        challengesApi.list(),
        usersApi.getBadgesWithProgress()
      ])
      setChallenges(challengesRes.data)
      setUserBadges(badgesRes.data)
    } catch {
      toast.error('Failed to load challenges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChallenges()
  }, [])

  const activeChallenge = challenges.find(c => c.isActive && !c.isCompleted)
  const completedChallenges = challenges.filter(c => c.isCompleted)

  function handleStartClick(challenge: Challenge) {
    if (activeChallenge && activeChallenge.id !== challenge.id) {
      setPendingChallenge(challenge)
    } else {
      executeStart(challenge.id)
    }
  }

  async function executeStart(challengeId: string) {
    setStartingId(challengeId)
    try {
      await challengesApi.start(challengeId)
      toast.success('Route Challenge activated!')
      setPendingChallenge(null)
      await loadChallenges()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to start challenge'
      toast.error(msg)
    } finally {
      setStartingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading route challenges..." />
      </div>
    )
  }

  return (
    <div className="page-container space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-[hsl(var(--color-surface))] via-[hsl(var(--color-surface-2))]/50 to-[hsl(var(--color-surface))] relative overflow-hidden animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--color-brand))] to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Compass size={22} />
              </div>
              <h1 className="text-2xl font-black text-[hsl(var(--color-text))]">Route Challenges</h1>
            </div>
            <p className="text-sm text-[hsl(var(--color-text-muted))] mt-2 max-w-2xl">
              Embark on iconic real-world distance routes. Pick one active challenge to tackle cumulatively over your daily runs. Reach the finish line to unlock exclusive badges and rewards.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[hsl(var(--color-text-muted))] border-t sm:border-t-0 sm:border-l border-[hsl(var(--color-border))] pt-3 sm:pt-0 sm:pl-4">
            <div>
              <p className="text-lg font-black text-[hsl(var(--color-text))]">{completedChallenges.length} / {challenges.length}</p>
              <p>Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenge Spotlight Card (if any) */}
      {activeChallenge && (
        <div className="card p-6 border-2 border-[hsl(var(--color-brand))]/40 bg-gradient-to-r from-[hsl(var(--color-brand))]/5 via-[hsl(var(--color-surface))] to-[hsl(var(--color-surface))] shadow-lg animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--color-brand))] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              <Flag size={12} /> Currently Active Route
            </span>
            <span className="text-xs font-semibold text-[hsl(var(--color-text-muted))]">
              Started {activeChallenge.startedAt ? new Date(activeChallenge.startedAt).toLocaleDateString() : ''}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">{activeChallenge.name}</h2>
              <p className="text-sm text-[hsl(var(--color-text-muted))]">{activeChallenge.description}</p>
              
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                  <span className="text-[hsl(var(--color-text))]">
                    {activeChallenge.progressDistanceKm} km / {activeChallenge.targetDistanceKm} km
                  </span>
                  <span className="text-[hsl(var(--color-brand))] font-bold">
                    {activeChallenge.completionPercentage}%
                  </span>
                </div>
                <div className="h-3 bg-[hsl(var(--color-surface-3))] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--color-brand))] via-indigo-500 to-teal-400 transition-all duration-700 shadow-sm"
                    style={{ width: `${activeChallenge.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-[hsl(var(--color-surface-2))]/60 rounded-2xl border border-[hsl(var(--color-border))]/40 shrink-0 min-w-[160px]">
              {activeChallenge.iconUrl ? (
                <img src={activeChallenge.iconUrl} alt={activeChallenge.name} className="w-8 h-8 object-contain mb-1" />
              ) : (
                <Trophy size={28} className="text-amber-500 mb-1" />
              )}
              <span className="text-xs font-bold text-[hsl(var(--color-text))] text-center">Reward Badge</span>
              <span className="text-[10px] text-[hsl(var(--color-text-muted))] uppercase tracking-wider mt-0.5">{activeChallenge.rarity}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of all Route Challenges */}
      <div className="grid md:grid-cols-2 gap-4">
        {challenges.map((c) => {
          const isCurrentActive = c.isActive && !c.isCompleted
          const isCompleted = c.isCompleted
          
          const challengeBadges = userBadges.filter(b => b.category === 'challenge' && b.name.startsWith(c.name))
          const unlockedChallengeBadges = challengeBadges.filter(b => b.isUnlocked)
          const highestUnlockedBadge = unlockedChallengeBadges.sort((a, b) => b.targetThreshold - a.targetThreshold)[0]

          return (
            <div
              key={c.id}
              className={`card p-5 flex flex-col justify-between transition-all duration-200 ${
                isCurrentActive
                  ? 'border-[hsl(var(--color-brand))] ring-1 ring-[hsl(var(--color-brand))]/30'
                  : isCompleted
                  ? 'bg-[hsl(var(--color-surface-2))]/30 border-emerald-500/30'
                  : 'hover:border-[hsl(var(--color-border-light))]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 relative ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : isCurrentActive
                        ? 'bg-[hsl(var(--color-brand))]/10 text-[hsl(var(--color-brand))]'
                        : 'bg-[hsl(var(--color-surface-3))] text-[hsl(var(--color-text-muted))]'
                    }`}>
                      {c.iconUrl ? (
                        <img src={c.iconUrl} alt={c.name} className="w-6 h-6 object-contain" />
                      ) : isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <MapPin size={20} />
                      )}
                      {isCompleted && c.iconUrl && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                          <CheckCircle size={10} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[hsl(var(--color-text))] text-base flex items-center gap-2">
                        {c.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))]">
                        {c.targetDistanceKm} km · {c.rarity}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {c.completionCount > 0 && (
                      <span className="text-[10px] font-bold text-[hsl(var(--color-brand))] bg-[hsl(var(--color-brand))]/10 px-2 py-0.5 rounded border border-[hsl(var(--color-brand))]/20">
                        Completed ×{c.completionCount}
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle size={10} /> Finished
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                  {c.description}
                </p>

                {/* Progress bar if started */}
                {(c.progressDistanceKm > 0 || isCurrentActive || isCompleted) && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                      <span>{c.progressDistanceKm} / {c.targetDistanceKm} km</span>
                      <span>{c.completionPercentage}%</span>
                    </div>
                    <div className="h-1.5 bg-[hsl(var(--color-surface-3))] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-[hsl(var(--color-brand))]'
                        }`}
                        style={{ width: `${c.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[hsl(var(--color-border))]/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--color-text-muted))]">
                  <Award size={14} className="text-amber-500" />
                  <span>
                    {highestUnlockedBadge ? (
                      <span className="text-amber-500 font-bold">{highestUnlockedBadge.name.split(' ').pop()} Tier</span>
                    ) : (
                      'Challenge Badge'
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {highestUnlockedBadge && (
                    <button
                      type="button"
                      onClick={() => setSelectedBadgeForShare(highestUnlockedBadge)}
                      className="text-xs font-bold text-[hsl(var(--color-brand))] flex items-center gap-1 hover:underline"
                    >
                      Share Badge
                    </button>
                  )}
                  {isCurrentActive ? (
                    <span className="text-xs font-bold text-[hsl(var(--color-brand))] flex items-center gap-1">
                      Active Challenge <ArrowRight size={12} />
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={startingId === c.id}
                      onClick={() => handleStartClick(c)}
                      className="btn btn-secondary btn-sm text-xs"
                    >
                      {startingId === c.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Start Challenge'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Confirmation Modal when switching active challenge */}
      {pendingChallenge && activeChallenge && (
        <div className="fixed inset-0 z-50 bg-[hsl(var(--color-overlay))] backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-md w-full p-6 space-y-5 shadow-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] animate-fade-in-up relative">
            <button
              type="button"
              onClick={() => setPendingChallenge(null)}
              className="absolute top-4 right-4 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] p-1 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[hsl(var(--color-text))]">Switch Active Challenge?</h3>
                <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                  Activating <span className="font-semibold text-[hsl(var(--color-text))]">{pendingChallenge.name}</span> will pause your current route.
                </p>
              </div>
            </div>

            {/* Current Active Route Card Summary */}
            <div className="p-3.5 rounded-xl bg-[hsl(var(--color-surface-2))]/70 border border-[hsl(var(--color-border))]/50 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-[hsl(var(--color-text-muted))]">Currently Active:</span>
                <span className="text-[hsl(var(--color-brand))] font-bold">{activeChallenge.name}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[hsl(var(--color-text-muted))]">
                <span>Progress: {activeChallenge.progressDistanceKm} / {activeChallenge.targetDistanceKm} km</span>
                <span>{activeChallenge.completionPercentage}%</span>
              </div>
              <div className="h-1.5 bg-[hsl(var(--color-surface-3))] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[hsl(var(--color-brand))]"
                  style={{ width: `${activeChallenge.completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[hsl(var(--color-border))]/40">
              <button
                type="button"
                onClick={() => setPendingChallenge(null)}
                disabled={startingId === pendingChallenge.id}
                className="btn btn-secondary text-xs px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeStart(pendingChallenge.id)}
                disabled={startingId === pendingChallenge.id}
                className="btn btn-fire text-xs px-4"
              >
                {startingId === pendingChallenge.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Switch Route'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Badge Modal */}
      {selectedBadgeForShare && (
        <ShareCard
          variant="badge"
          badge={selectedBadgeForShare}
          onClose={() => setSelectedBadgeForShare(null)}
        />
      )}
    </div>
  )
}

