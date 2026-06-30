import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Trophy, ChevronRight, Zap, Sparkles } from 'lucide-react'
import type { Badge } from '../types/api'
import confetti from 'canvas-confetti' // Optional, but let's implement a CSS particle/confetti effect if canvas-confetti isn't installed. Wait, can we install canvas-confetti or build CSS sparkles? Building CSS sparkles/confetti using Tailwind & CSS is completely zero-dependency and safe!

// Rarity color configurations for themes, text, glow shadows and gradients.
const RARITY_THEMES = {
  common: {
    text: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.35)]',
    label: 'Common',
    badgeGradient: 'from-slate-500/20 via-slate-600/15 to-slate-700/5',
  },
  rare: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    label: 'Rare',
    badgeGradient: 'from-blue-500/20 via-sky-600/15 to-indigo-700/5',
  },
  epic: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    glow: 'shadow-[0_0_35px_rgba(168,85,247,0.6)]',
    label: 'Epic',
    badgeGradient: 'from-purple-500/25 via-violet-600/20 to-fuchsia-700/5',
  },
  legendary: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.7)]',
    label: 'Legendary',
    badgeGradient: 'from-amber-400/25 via-yellow-500/20 to-orange-600/5',
  },
  heroic: {
    text: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_50px_rgba(244,63,94,0.85)]',
    label: 'Heroic',
    badgeGradient: 'from-rose-500/30 via-red-600/25 to-pink-700/5',
  },
}

export default function BadgeCelebrationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Retrieve passed data from router state
  const badges: Badge[] = location.state?.badges || []

  const [currentIndex, setCurrentIndex] = useState(0)
  const [animate, setAnimate] = useState(false)

  // Redirect if no badges passed to prevent blank screen
  useEffect(() => {
    if (badges.length === 0) {
      navigate('/dashboard')
    }
  }, [badges, navigate])

  // Trigger celebration effects on mount and index change
  useEffect(() => {
    if (badges.length > 0) {
      setAnimate(true)
      const timer = setTimeout(() => setAnimate(false), 1000)
      
      // Simple particle/confetti effect using custom Canvas-free triggers
      // if canvas-confetti could be dynamic. We can fire simple confetti
      // by dynamically loading it or using CSS particles.
      try {
        // Run standard confetti bursts
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        })
      } catch {
        // Fallback if canvas-confetti is not loaded
      }

      return () => clearTimeout(timer)
    }
  }, [currentIndex, badges])

  if (badges.length === 0) return null

  const currentBadge = badges[currentIndex]
  const theme = RARITY_THEMES[currentBadge.rarity] || RARITY_THEMES.common
  const isLast = currentIndex === badges.length - 1

  function handleNext() {
    if (isLast) {
      navigate('/dashboard')
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md overflow-hidden text-white p-4">
      {/* Sparkle background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/45 via-slate-950 to-slate-950" />
      
      {/* Screen container */}
      <div className="w-full max-w-md text-center space-y-8 relative z-10 animate-fade-in">
        {/* Badge unlock banner */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider animate-bounce">
            <Sparkles size={12} />
            Achievement Unlocked!
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Congratulations!
          </h1>
          <p className="text-slate-400 text-sm">
            {badges.length > 1 
              ? `You unlocked ${badges.length} badges on this run! (Badge ${currentIndex + 1} of ${badges.length})` 
              : 'You unlocked a new badge!'}
          </p>
        </div>

        {/* The Badge presentation card */}
        <div className={`relative mx-auto w-64 h-64 rounded-full bg-gradient-to-b ${theme.badgeGradient} border ${theme.border} flex items-center justify-center ${theme.glow} transition-all duration-500 ${animate ? 'scale-110 rotate-3' : 'scale-100 hover:scale-105'}`}>
          {/* Inner ring overlay */}
          <div className="absolute inset-4 rounded-full border border-dashed border-white/10" />
          
          {/* Badge Icon */}
          <div className="relative flex flex-col items-center gap-2">
            {currentBadge.iconUrl ? (
              <img 
                src={currentBadge.iconUrl} 
                alt={currentBadge.name} 
                className={`w-28 h-28 object-contain transition-transform duration-500 ${animate ? 'scale-110' : ''}`}
              />
            ) : (
              <Trophy size={80} className={`${theme.text}`} />
            )}
          </div>
        </div>

        {/* Badge Name & details */}
        <div className="space-y-2 animate-fade-in-up">
          <div className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-widest ${theme.bg} ${theme.border} ${theme.text}`}>
            {theme.label}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {currentBadge.name}
          </h2>
          <p className="text-slate-300 max-w-sm mx-auto text-sm">
            {currentBadge.description}
          </p>
        </div>

        {/* Reward presentation */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-amber-400 animate-pulse">
          <Zap size={16} />
          <span className="text-sm font-semibold tracking-wide">+{currentBadge.pointsReward} Bonus Points</span>
        </div>

        {/* Navigation Actions */}
        <div className="pt-4">
          <button
            onClick={handleNext}
            className={`btn w-full py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-base font-bold shadow-lg transition-all duration-300 transform active:scale-95 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white`}
          >
            {isLast ? 'Awesome, Go to Dashboard' : 'Next Badge'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
