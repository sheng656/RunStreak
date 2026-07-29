import { useState, useEffect, useRef } from 'react'
import { Flame, Trophy, MapPin, Zap, Award, ChevronLeft, ChevronRight } from 'lucide-react'

interface ShowcaseSlide {
  id: string
  title: string
  subtitle: string
  tag: string
  icon: React.ReactNode
  accentColor: string
  /** Content rendered inside the dark (night) phone */
  renderDark: () => React.ReactNode
  /** Content rendered inside the light (day) phone */
  renderLight: () => React.ReactNode
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'dashboard',
    title: 'Track Streaks & Progress',
    subtitle: 'Habit-building with streaks, goals, and insights',
    tag: 'Dashboard',
    icon: <Flame className="text-orange-400" size={14} />,
    accentColor: 'hsl(25 95% 53%)',
    renderDark: () => (
      <div className="space-y-2.5 text-left">
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-base">
              14
            </div>
            <div>
              <div className="text-[11px] font-bold text-white">Current Streak</div>
              <div className="text-[10px] text-orange-300">14 days 🔥</div>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">On Fire</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
          <div className="flex justify-between text-[10px] font-medium text-slate-300">
            <span>Weekly Goal</span>
            <span className="text-emerald-400 font-bold">28.4 / 35 km</span>
          </div>
          <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full w-[81%]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="text-[9px] text-slate-400">Total Distance</div>
            <div className="text-xs font-bold text-white mt-0.5">248.5 km</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="text-[9px] text-slate-400">Total Points</div>
            <div className="text-xs font-bold text-amber-400 mt-0.5">3,420 pts</div>
          </div>
        </div>
      </div>
    ),
    renderLight: () => (
      <div className="space-y-2.5 text-left">
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-base">
              14
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-800">Current Streak</div>
              <div className="text-[10px] text-orange-600">14 days 🔥</div>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">On Fire</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 space-y-1.5">
          <div className="flex justify-between text-[10px] font-medium text-slate-600">
            <span>Weekly Goal</span>
            <span className="text-emerald-600 font-bold">28.4 / 35 km</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full w-[81%]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="p-2 rounded-lg bg-white border border-slate-200">
            <div className="text-[9px] text-slate-400">Total Distance</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">248.5 km</div>
          </div>
          <div className="p-2 rounded-lg bg-white border border-slate-200">
            <div className="text-[9px] text-slate-400">Total Points</div>
            <div className="text-xs font-bold text-amber-600 mt-0.5">3,420 pts</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'badges',
    title: '48 Unlockable Badges',
    subtitle: 'Earn rare, epic, and legendary achievements',
    tag: 'Gamification',
    icon: <Award className="text-purple-400" size={14} />,
    accentColor: 'hsl(270 80% 65%)',
    renderDark: () => (
      <div className="space-y-2 text-left">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/30 flex items-center justify-center text-base">🏆</div>
            <div>
              <div className="text-[10px] font-bold text-purple-200">Half Marathon</div>
              <div className="text-[9px] text-purple-300">Legendary</div>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/30 flex items-center justify-center text-base">🔥</div>
            <div>
              <div className="text-[10px] font-bold text-amber-200">2-Week Streak</div>
              <div className="text-[9px] text-amber-300">Epic</div>
            </div>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">🏅</div>
            <div>
              <div className="text-[10px] font-bold text-white">Century Club</div>
              <div className="text-[9px] text-slate-400">100 km Total</div>
            </div>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Unlocked</span>
        </div>
      </div>
    ),
    renderLight: () => (
      <div className="space-y-2 text-left">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-base">🏆</div>
            <div>
              <div className="text-[10px] font-bold text-purple-700">Half Marathon</div>
              <div className="text-[9px] text-purple-500">Legendary</div>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-base">🔥</div>
            <div>
              <div className="text-[10px] font-bold text-amber-700">2-Week Streak</div>
              <div className="text-[9px] text-amber-500">Epic</div>
            </div>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-sm">🏅</div>
            <div>
              <div className="text-[10px] font-bold text-slate-800">Century Club</div>
              <div className="text-[9px] text-slate-500">100 km Total</div>
            </div>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Unlocked</span>
        </div>
      </div>
    ),
  },
  {
    id: 'import',
    title: 'AI Screenshot Import',
    subtitle: 'Snap a Strava screenshot — Gemini AI fills the rest',
    tag: 'Smart Import',
    icon: <Zap className="text-cyan-400" size={14} />,
    accentColor: 'hsl(189 94% 43%)',
    renderDark: () => (
      <div className="space-y-2.5 text-left">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300">
            <Zap size={14} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-cyan-200">Gemini AI OCR</div>
            <div className="text-[9px] text-cyan-400">Detected: Strava Activity</div>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5 text-[10px]">
          {[['Distance', '10.25 km', 'text-white'], ['Duration', '52m 18s', 'text-white'], ['Avg Pace', '5:06 /km', 'text-emerald-400'], ['Points', '+154 pts', 'text-amber-400']].map(([k, v, c]) => (
            <div key={k} className="flex justify-between py-0.5 border-b border-slate-700/40 last:border-0">
              <span className="text-slate-400">{k}</span>
              <span className={`font-bold ${c}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    renderLight: () => (
      <div className="space-y-2.5 text-left">
        <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
            <Zap size={14} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-cyan-800">Gemini AI OCR</div>
            <div className="text-[9px] text-cyan-600">Detected: Strava Activity</div>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5 text-[10px]">
          {[['Distance', '10.25 km', 'text-slate-800'], ['Duration', '52m 18s', 'text-slate-800'], ['Avg Pace', '5:06 /km', 'text-emerald-600'], ['Points', '+154 pts', 'text-amber-600']].map(([k, v, c]) => (
            <div key={k} className="flex justify-between py-0.5 border-b border-slate-100 last:border-0">
              <span className="text-slate-400">{k}</span>
              <span className={`font-bold ${c}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'challenges',
    title: 'NZ Route Challenges',
    subtitle: 'Conquer Rangitoto, Milford Track & Te Araroa',
    tag: 'Trail Explorer',
    icon: <MapPin className="text-emerald-400" size={14} />,
    accentColor: 'hsl(160 71% 45%)',
    renderDark: () => (
      <div className="space-y-2.5 text-left">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1"><MapPin size={11} /> Rangitoto Summit</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Active</span>
          </div>
          <div className="text-[10px] text-slate-300">Auckland Volcanic Island Trail</div>
          <div>
            <div className="flex justify-between text-[9px] text-slate-400 mb-1">
              <span>Progress</span><span className="text-emerald-300 font-bold">5.8 / 7.0 km</span>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-[83%]" />
            </div>
          </div>
        </div>
      </div>
    ),
    renderLight: () => (
      <div className="space-y-2.5 text-left">
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1"><MapPin size={11} /> Rangitoto Summit</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Active</span>
          </div>
          <div className="text-[10px] text-slate-600">Auckland Volcanic Island Trail</div>
          <div>
            <div className="flex justify-between text-[9px] text-slate-400 mb-1">
              <span>Progress</span><span className="text-emerald-600 font-bold">5.8 / 7.0 km</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[83%]" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'leaderboard',
    title: 'Global Leaderboard',
    subtitle: 'Weekly & all-time rankings among runners',
    tag: 'Leaderboard',
    icon: <Trophy className="text-yellow-400" size={14} />,
    accentColor: 'hsl(45 93% 47%)',
    renderDark: () => (
      <div className="space-y-1.5 text-left">
        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-center leading-4 text-[9px]">1</span>
            <span className="font-bold text-white">Sheng</span>
          </div>
          <span className="font-bold text-amber-300">3,420 pts</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 font-bold text-center leading-4 text-[9px]">2</span>
            <span className="font-medium text-slate-200">Alex Runner</span>
          </div>
          <span className="text-slate-300">2,850 pts</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 font-bold text-center leading-4 text-[9px]">3</span>
            <span className="font-medium text-slate-200">Emma Miles</span>
          </div>
          <span className="text-slate-300">2,610 pts</span>
        </div>
      </div>
    ),
    renderLight: () => (
      <div className="space-y-1.5 text-left">
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-400 text-white font-bold text-center leading-4 text-[9px]">1</span>
            <span className="font-bold text-slate-800">Sheng</span>
          </div>
          <span className="font-bold text-amber-600">3,420 pts</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 font-bold text-center leading-4 text-[9px]">2</span>
            <span className="font-medium text-slate-700">Alex Runner</span>
          </div>
          <span className="text-slate-500">2,850 pts</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 font-bold text-center leading-4 text-[9px]">3</span>
            <span className="font-medium text-slate-700">Emma Miles</span>
          </div>
          <span className="text-slate-500">2,610 pts</span>
        </div>
      </div>
    ),
  },
]

interface PhoneProps {
  /** 'dark' = slate-900 body, 'light' = white body */
  mode: 'dark' | 'light'
  /** Slide content to render inside */
  children: React.ReactNode
  /** Whether to apply the floating animation */
  float?: boolean
  /** Colour for the glow layer */
  accentColor: string
  /** Staggered float delay so the two phones are offset */
  floatDelay?: string
}

function PhoneFrame({ mode, children, float = false, accentColor, floatDelay = '0s' }: PhoneProps) {
  const bg = mode === 'dark' ? 'bg-slate-900' : 'bg-white'
  const border = mode === 'dark' ? 'border-slate-700/80' : 'border-slate-200'
  const notch = mode === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
  const dot1 = mode === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
  const dot2 = mode === 'dark' ? 'bg-slate-600 border-slate-500' : 'bg-slate-200 border-slate-300'
  const bar = mode === 'dark' ? 'bg-slate-700' : 'bg-slate-200'

  return (
    <div
      className={`relative ${float ? 'animate-phone-float' : ''}`}
      style={{
        filter: `drop-shadow(0 20px 32px rgba(0,0,0,${mode === 'dark' ? 0.5 : 0.18}))`,
        animationDelay: floatDelay,
      }}
    >
      {/* Glow */}
      {float && (
        <div
          className="absolute inset-0 rounded-[32px] blur-2xl opacity-20 pointer-events-none"
          style={{ background: accentColor, transform: 'scale(0.8) translateY(10px)' }}
        />
      )}
      {/* Phone body */}
      <div
        className={`relative w-[185px] sm:w-[200px] rounded-[32px] ${bg} border-[4px] ${border} overflow-hidden p-3 space-y-2.5 transition-colors duration-500`}
      >
        {/* Dynamic island */}
        <div className={`w-16 h-[11px] ${notch} rounded-full mx-auto flex items-center justify-center gap-1`}>
          <div className={`w-1 h-1 rounded-full ${dot1}`} />
          <div className={`w-2 h-2 rounded-full ${dot2} border`} />
        </div>
        {/* Content */}
        <div className="min-h-[160px]">
          {children}
        </div>
        {/* Home bar */}
        <div className={`w-16 h-[3px] ${bar} rounded-full mx-auto`} />
      </div>
    </div>
  )
}

interface AppShowcaseProps {
  /** Compact mode — no float animation, tighter layout, used on mobile */
  compact?: boolean
}

export default function AppShowcase({ compact = false }: AppShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => advance('next'), 4500)
  }

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function advance(dir: 'next' | 'prev', target?: number) {
    if (animating) return
    setAnimating(true)
    setDirection(dir)
    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (target !== undefined) return target
        return dir === 'next'
          ? (prev + 1) % SHOWCASE_SLIDES.length
          : (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length
      })
      setAnimating(false)
    }, 280)
  }

  function handleNext() { advance('next'); startTimer() }
  function handlePrev() { advance('prev'); startTimer() }
  function handleDot(idx: number) {
    if (idx === currentIndex) return
    advance(idx > currentIndex ? 'next' : 'prev', idx)
    startTimer()
  }

  const slide = SHOWCASE_SLIDES[currentIndex]

  const contentStyle: React.CSSProperties = {
    opacity: animating ? 0 : 1,
    transform: animating
      ? direction === 'next' ? 'translateY(6px) scale(0.98)' : 'translateY(-6px) scale(0.98)'
      : 'translateY(0) scale(1)',
    transition: 'opacity 0.28s ease, transform 0.28s ease',
  }

  return (
    <div className={`relative w-full mx-auto flex flex-col items-center ${compact ? 'max-w-sm' : 'max-w-lg py-2'}`}>
      {/* Slide tag pill */}
      <div
        className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-md transition-all duration-500"
        style={{
          background: `${slide.accentColor}18`,
          borderColor: `${slide.accentColor}40`,
          color: slide.accentColor,
        }}
      >
        {slide.icon}
        <span>{slide.tag}</span>
      </div>

      {/*
        Two-phone layout.
        On desktop (full): side-by-side with labels.
        On compact (mobile): side-by-side but smaller, no labels.
        The outer div has a fixed min-height so the nav dots don't shift when
        slide content height varies.
      */}
      <div
        className="flex items-end justify-center gap-3 sm:gap-4 w-full"
        style={contentStyle}
      >
        {/* Dark phone */}
        <div className="flex flex-col items-center gap-1.5">
          {!compact && (
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Dark</span>
          )}
          <PhoneFrame
            mode="dark"
            float={!compact}
            accentColor={slide.accentColor}
            floatDelay="0s"
          >
            {slide.renderDark()}
          </PhoneFrame>
        </div>

        {/* Light phone */}
        <div className="flex flex-col items-center gap-1.5">
          {!compact && (
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Light</span>
          )}
          <PhoneFrame
            mode="light"
            float={!compact}
            accentColor={slide.accentColor}
            floatDelay="2s"
          >
            {slide.renderLight()}
          </PhoneFrame>
        </div>
      </div>

      {/* Nav controls */}
      <div className="flex items-center justify-between w-full max-w-xs mt-5">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2">
          {SHOWCASE_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleDot(idx)}
              style={idx === currentIndex ? { background: slide.accentColor } : undefined}
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
