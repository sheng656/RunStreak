import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Mail, Lock, Eye, EyeOff, Sparkles, ChevronDown, ChevronUp, RefreshCw, Copy, Check } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import authApi from '../api/auth'
import { setStoredRefreshToken } from '../api/client'
import toast from 'react-hot-toast'
import AppShowcase from '../components/ui/AppShowcase'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAccessToken, setUser, setLoading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showDemoDropdown, setShowDemoDropdown] = useState(false)
  const [resettingDemo, setResettingDemo] = useState(false)
  const [copied, setCopied] = useState<'user' | 'pass' | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = 'Email or Username is required'
    if (!password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await authApi.login({ email: email.trim(), password })
      setStoredRefreshToken(res.data.refreshToken)
      setAccessToken(res.data.accessToken)
      setUser(res.data.user)
      setLoading(false)
      toast.success('Welcome back!')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid email/username or password.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetDemoPassword() {
    setResettingDemo(true)
    try {
      await authApi.resetDemo()
      setEmail('testuser')
      setPassword('Test1234!')
      setErrors({})
      toast.success('Demo account reset — credentials auto-filled!')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to reset demo password.'
      toast.error(msg)
    } finally {
      setResettingDemo(false)
    }
  }

  function copyToClipboard(value: string, field: 'user' | 'pass') {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(field)
      setTimeout(() => setCopied(null), 1800)
    })
  }

  return (
    /* Full-screen container with animated gradient background */
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4 md:p-8">
      {/* ── Animated background ─────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[hsl(var(--color-bg))] -z-20" />
      {/* Gradient orbs */}
      <div
        className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl -z-10 animate-orb-drift"
        style={{ background: 'radial-gradient(circle, hsl(250 84% 64%), transparent 70%)' }}
      />
      <div
        className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl -z-10 animate-orb-drift-slow"
        style={{ background: 'radial-gradient(circle, hsl(25 95% 53%), transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-5 blur-3xl -z-10"
        style={{ background: 'radial-gradient(ellipse, hsl(189 94% 43%), transparent 70%)' }}
      />

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-5xl">

        {/*
          Layout:
          - Mobile:  Showcase (compact) stacked above the form
          - Desktop: Two-column grid: Showcase left | Form right
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">

          {/* ── Left Column — App Showcase ──────────────────────────────── */}
          {/* Mobile: shown above form; desktop: left column */}
          <div className="flex flex-col items-center justify-center md:border-r md:border-slate-700/40 md:pr-8">
            {/* Hero copy — shown only on desktop */}
            <div className="hidden md:block text-center mb-6">
              <h2 className="text-2xl font-bold gradient-text leading-tight">
                Run. Earn. Dominate.
              </h2>
              <p className="text-sm text-[hsl(var(--color-text-muted))] mt-2 max-w-xs mx-auto leading-relaxed">
                Gamify your running habit with streaks, badges, and leaderboards.
              </p>
            </div>

            {/* Showcase — compact on mobile, full on desktop */}
            <div className="md:hidden w-full max-w-xs mx-auto mb-2">
              <AppShowcase compact />
            </div>
            <div className="hidden md:block w-full">
              <AppShowcase />
            </div>
          </div>

          {/* ── Right Column — Login Card ────────────────────────────────── */}
          <div className="w-full max-w-md mx-auto animate-fade-in-up">
            {/* Brand header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-fire mb-3 shadow-lg shadow-orange-500/20">
                <Flame size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">Welcome back</h1>
              <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
                Sign in to continue your streak
              </p>
            </div>

            {/* ── MSA Marker Demo Account Card ─────────────────────────── */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => setShowDemoDropdown(!showDemoDropdown)}
                className="w-full px-4 py-3 rounded-2xl border transition-all duration-200 flex items-center justify-between group"
                style={{
                  background: showDemoDropdown
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.12))'
                    : 'rgba(59,130,246,0.08)',
                  borderColor: showDemoDropdown ? 'rgba(99,102,241,0.4)' : 'rgba(59,130,246,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} className="text-blue-400" />
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-bold text-blue-200 leading-tight">MSA Marker — Demo Account</div>
                    <div className="text-[10px] text-blue-400/70 mt-0.5">Pre-seeded with runs, badges & a 14-day streak</div>
                  </div>
                </span>
                <span className="text-blue-400 ml-2 flex-shrink-0 transition-transform duration-200" style={{ transform: showDemoDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  {showDemoDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {showDemoDropdown && (
                <div
                  className="mt-2 rounded-2xl border overflow-hidden animate-slide-down"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(23,37,84,0.85))',
                    borderColor: 'rgba(99,102,241,0.25)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  {/* Credentials */}
                  <div className="p-4 space-y-2">
                    {/* Username row */}
                    <div
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
                      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Username</div>
                        <div className="font-mono text-sm font-bold text-blue-300">testuser</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('testuser', 'user')}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Copy username"
                      >
                        {copied === 'user' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>

                    {/* Password row */}
                    <div
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
                      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Password</div>
                        <div className="font-mono text-sm font-bold text-blue-300">Test1234!</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('Test1234!', 'pass')}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Copy password"
                      >
                        {copied === 'pass' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="px-4 pb-4 flex items-center gap-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('testuser')
                        setPassword('Test1234!')
                        setErrors({})
                        toast.success('Credentials filled in!')
                      }}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(59,130,246,0.2))',
                        border: '1px solid rgba(99,102,241,0.3)',
                        color: '#a5b4fc',
                      }}
                    >
                      ⚡ Auto-fill &amp; Sign In
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDemoPassword}
                      disabled={resettingDemo}
                      className="py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                      style={{
                        background: 'rgba(245,158,11,0.15)',
                        border: '1px solid rgba(245,158,11,0.25)',
                        color: '#fcd34d',
                      }}
                      title="Restore demo account password to Test1234!"
                    >
                      <RefreshCw size={12} className={resettingDemo ? 'animate-spin' : ''} />
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Login form ──────────────────────────────────────────────── */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border p-6 space-y-4 shadow-xl"
              style={{
                background: 'hsl(var(--color-surface) / 0.85)',
                borderColor: 'hsl(var(--color-border))',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Email or Username */}
              <div>
                <label htmlFor="login-email" className="label">Email or Username</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                  <input
                    id="login-email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@runstreak.app or testuser"
                    className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                    autoComplete="username"
                  />
                </div>
                {errors.email && <p className="error-text mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="label mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-[hsl(var(--color-brand))] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="error-text mt-1">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full btn-lg mt-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-sm text-[hsl(var(--color-text-muted))] mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-[hsl(var(--color-brand))] hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
