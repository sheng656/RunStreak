import { useState, useEffect, useRef } from 'react'
import { Flame, Trophy, MapPin, Zap, Award, ChevronLeft, ChevronRight } from 'lucide-react'

interface ShowcaseSlide {
  id: string
  title: string
  subtitle: string
  tag: string
  icon: React.ReactNode
  color: string
  accentColor: string
  renderContent: () => React.ReactNode
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'dashboard',
    title: 'Track Streaks & Progress',
    subtitle: 'Daily habit building with streak freezes, weekly goals, and insights',
    tag: 'Dashboard',
    icon: <Flame className="text-orange-400" size={16} />,
    color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30',
    accentColor: 'hsl(25 95% 53%)',
    renderContent: () => (
      <div className="space-y-3 text-left">
        <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl gradient-fire flex items-center justify-center text-white font-bold text-lg">
              14
            </div>
            <div>
              <div className="text-xs font-bold text-white">Current Streak</div>
              <div className="text-[11px] text-orange-300">14 days consecutive 🔥</div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">On Fire</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>Weekly Goal</span>
            <span className="text-emerald-400 font-bold">28.4 / 35.0 km</span>
          </div>
          <div className="h-2.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full gradient-fire rounded-full w-[81%]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="text-[10px] text-slate-400">Total Distance</div>
            <div className="text-sm font-bold text-white mt-0.5">248.5 km</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="text-[10px] text-slate-400">Total Points</div>
            <div className="text-sm font-bold text-amber-400 mt-0.5">3,420 pts</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'import',
    title: 'AI Screenshot Import',
    subtitle: 'Import runs from Strava, Nike Run Club, or Garmin via OCR',
    tag: 'Smart Import',
    icon: <Zap className="text-cyan-400" size={16} />,
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
    accentColor: 'hsl(189 94% 43%)',
    renderContent: () => (
      <div className="space-y-3 text-left">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300">
            <Zap size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-cyan-200">Gemini AI OCR</div>
            <div className="text-[10px] text-cyan-300/80">Detected: Strava Activity</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-700/50">
            <span className="text-slate-400">Distance</span>
            <span className="font-bold text-white">10.25 km</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/50">
            <span className="text-slate-400">Duration</span>
            <span className="font-bold text-white">52m 18s</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/50">
            <span className="text-slate-400">Avg Pace</span>
            <span className="font-bold text-emerald-400">5:06 /km</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Points Earned</span>
            <span className="font-bold text-amber-400">+154 pts</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'badges',
    title: '48 Unlockable Badges',
    subtitle: 'Earn rare, epic, and legendary achievements at every milestone',
    tag: 'Gamification',
    icon: <Award className="text-purple-400" size={16} />,
    color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
    accentColor: 'hsl(270 80% 65%)',
    renderContent: () => (
      <div className="space-y-2 text-left">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center text-purple-200 font-bold text-sm">
              🏆
            </div>
            <div>
              <div className="text-[11px] font-bold text-purple-200">Half Marathon</div>
              <div className="text-[9px] text-purple-300">Legendary</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center text-amber-200 font-bold text-sm">
              🔥
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-200">2-Week Streak</div>
              <div className="text-[9px] text-amber-300">Epic</div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-xs">
              🏅
            </div>
            <div>
              <div className="text-xs font-bold text-white">Century Club</div>
              <div className="text-[10px] text-slate-400">100 km Total Distance</div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Unlocked</span>
        </div>
      </div>
    ),
  },
  {
    id: 'challenges',
    title: 'NZ Route Challenges',
    subtitle: 'Virtually conquer Auckland trails, Rangitoto, and Te Araroa routes',
    tag: 'Trail Explorer',
    icon: <MapPin className="text-emerald-400" size={16} />,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    accentColor: 'hsl(160 71% 45%)',
    renderContent: () => (
      <div className="space-y-3 text-left">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <MapPin size={14} /> Rangitoto Summit
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Active</span>
          </div>
          <div className="text-[11px] text-slate-300">Auckland Volcanic Island Trail</div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Progress</span>
              <span className="text-emerald-300 font-bold">5.8 / 7.0 km (83%)</span>
            </div>
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-[83%]" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'leaderboard',
    title: 'Global Leaderboard',
    subtitle: 'Compete for the top with weekly and all-time rankings',
    tag: 'Leaderboard',
    icon: <Trophy className="text-yellow-400" size={16} />,
    color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
    accentColor: 'hsl(45 93% 47%)',
    renderContent: () => (
      <div className="space-y-2 text-left">
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-center leading-5 text-[11px]">1</span>
            <span className="font-bold text-white">Sheng (Test Runner)</span>
          </div>
          <span className="font-bold text-amber-300">3,420 pts</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 font-bold text-center leading-5 text-[11px]">2</span>
            <span className="font-medium text-slate-200">Alex Runner</span>
          </div>
          <span className="text-slate-300">2,850 pts</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 font-bold text-center leading-5 text-[11px]">3</span>
            <span className="font-medium text-slate-200">Emma Miles</span>
          </div>
          <span className="text-slate-300">2,610 pts</span>
        </div>
      </div>
    ),
  },
]

interface AppShowcaseProps {
  /** Show in compact mode for mobile (no floating animation, tighter layout) */
  compact?: boolean
}

export default function AppShowcase({ compact = false }: AppShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start or restart the auto-advance timer
  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      goTo('next')
    }, 4500)
  }

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goTo(dir: 'next' | 'prev', targetIndex?: number) {
    if (animating) return
    setAnimating(true)
    setDirection(dir)
    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (targetIndex !== undefined) return targetIndex
        if (dir === 'next') return (prev + 1) % SHOWCASE_SLIDES.length
        return (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length
      })
      setAnimating(false)
    }, 300)
  }

  function handleNext() {
    goTo('next')
    startTimer()
  }
  function handlePrev() {
    goTo('prev')
    startTimer()
  }
  function handleDot(idx: number) {
    if (idx === currentIndex) return
    goTo(idx > currentIndex ? 'next' : 'prev', idx)
    startTimer()
  }

  const currentSlide = SHOWCASE_SLIDES[currentIndex]

  // Slide transition CSS
  const slideStyle: React.CSSProperties = {
    opacity: animating ? 0 : 1,
    transform: animating
      ? direction === 'next'
        ? 'translateY(8px) scale(0.98)'
        : 'translateY(-8px) scale(0.98)'
      : 'translateY(0) scale(1)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  }

  return (
    <div className={`relative w-full max-w-xs mx-auto flex flex-col items-center ${compact ? '' : 'py-4'}`}>
      {/* Feature tag pill */}
      <div
        className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-md transition-all duration-500"
        style={{
          background: `${currentSlide.accentColor}18`,
          borderColor: `${currentSlide.accentColor}40`,
          color: currentSlide.accentColor,
        }}
      >
        {currentSlide.icon}
        <span>{currentSlide.tag}</span>
      </div>

      {/* Phone frame — floats gently when not compact */}
      <div
        className={`relative ${compact ? '' : 'animate-phone-float'}`}
        style={{
          filter: compact ? 'none' : 'drop-shadow(0 24px 40px rgba(0,0,0,0.45))',
        }}
      >
        {/* Glow behind phone */}
        {!compact && (
          <div
            className="absolute inset-0 rounded-[36px] blur-2xl opacity-25 pointer-events-none transition-colors duration-500"
            style={{ background: currentSlide.accentColor, transform: 'scale(0.85) translateY(8px)' }}
          />
        )}

        {/* Phone frame */}
        <div className="relative w-[260px] sm:w-[290px] rounded-[36px] bg-slate-900 border-[5px] border-slate-700/80 overflow-hidden p-4 space-y-3">
          {/* Dynamic island / notch */}
          <div className="w-20 h-[14px] bg-slate-800 rounded-full mx-auto mb-1 flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600" />
          </div>

          {/* Slide content with crossfade */}
          <div style={slideStyle}>
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${currentSlide.color} border`}>
              <div className="text-center mb-3">
                <h3 className="text-sm font-bold text-white leading-snug">{currentSlide.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{currentSlide.subtitle}</p>
              </div>
              {currentSlide.renderContent()}
            </div>
          </div>

          {/* Home bar */}
          <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-1" />
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between w-full max-w-[260px] mt-5">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2">
          {SHOWCASE_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => handleDot(idx)}
              style={idx === currentIndex ? { background: currentSlide.accentColor } : undefined}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? 'w-6' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
          aria-label="Next slide"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
