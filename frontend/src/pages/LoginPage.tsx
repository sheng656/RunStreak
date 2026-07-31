import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Mail, Lock, Eye, EyeOff, Sparkles, ChevronDown, RefreshCw, Copy, Check, Zap, X, UserPlus, LogIn } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import authApi from '../api/auth'
import { setStoredRefreshToken } from '../api/client'
import toast from 'react-hot-toast'
import AppShowcase from '../components/ui/AppShowcase'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAccessToken, setUser, setLoading } = useAuthStore()

  const [showAuthModal, setShowAuthModal] = useState(false)
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

  function handleStartDemo() {
    setEmail('testuser')
    setPassword('Test1234!')
    setErrors({})
    setShowAuthModal(true)
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-between p-4 sm:p-6 md:p-8">
      {/* ── Animated background ─────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[hsl(var(--color-bg))] -z-20" />
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

      {/* ── Top Header ──────────────────────────────────────────────────── */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-fire flex items-center justify-center shadow-md">
            <Flame size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">RunStreak</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="btn btn-ghost btn-sm flex items-center gap-1.5"
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
          <Link to="/register" className="btn btn-primary btn-sm flex items-center gap-1.5">
            <UserPlus size={15} />
            <span>Register</span>
          </Link>
        </div>
      </header>

      {/* ── Main Landing Content ─────────────────────────────────────────── */}
      <main className="w-full max-w-5xl my-auto py-4 space-y-8 text-center">
        {/* Hero Copy */}
        <div className="space-y-3 max-w-xl mx-auto animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text leading-tight">
            Run. Earn. Dominate.
          </h1>
          <p className="text-sm sm:text-base text-[hsl(var(--color-text-muted))] leading-relaxed max-w-md mx-auto">
            Gamify your running habit with streaks, badges, route challenges, and leaderboards.
          </p>

          {/* Call-to-action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="btn btn-fire btn-lg w-full sm:w-auto px-8 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-base font-bold"
            >
              <Zap size={20} fill="currentColor" />
              <span>Start Now</span>
            </button>
            <button
              type="button"
              onClick={handleStartDemo}
              className="btn btn-secondary btn-lg w-full sm:w-auto px-6 flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <Sparkles size={18} className="text-blue-400" />
              <span>MSA Marker Demo</span>
            </button>
          </div>
        </div>

        {/* Unclipped App Showcase Previews */}
        <div className="w-full max-w-md mx-auto pt-2 animate-fade-in">
          <AppShowcase />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-4 border-t border-[hsl(var(--color-border))/0.3] text-xs text-[hsl(var(--color-text-muted))] mt-auto">
        RunStreak &copy; 2026 · Microsoft Student Accelerator Demo
      </footer>

      {/* ── Glassmorphic Sign-In Modal / Popup ────────────────────────────── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md my-auto rounded-3xl border border-slate-700/80 p-6 sm:p-8 space-y-5 bg-slate-900/95 shadow-2xl relative animate-fade-in-up">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Brand Header inside Modal */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl gradient-fire mb-2.5 shadow-lg shadow-orange-500/20">
                <Flame size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold gradient-text">Welcome back</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign in to continue your streak
              </p>
            </div>

            {/* ── MSA Marker Demo Account Card inside Modal ──────────────── */}
            <div>
              <button
                type="button"
                onClick={() => setShowDemoDropdown(!showDemoDropdown)}
                className="w-full px-3.5 py-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between group"
                style={{
                  background: showDemoDropdown
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.12))'
                    : 'rgba(59,130,246,0.08)',
                  borderColor: showDemoDropdown ? 'rgba(99,102,241,0.4)' : 'rgba(59,130,246,0.2)',
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Sparkles size={13} className="text-blue-400" />
                  </span>
                  <span className="text-left">
                    <span className="text-xs font-bold text-blue-200 block leading-tight">MSA Marker — Demo Account</span>
                  </span>
                </span>
                <span className="text-blue-400 ml-2 shrink-0 transition-transform duration-200" style={{ transform: showDemoDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <ChevronDown size={15} />
                </span>
              </button>

              {showDemoDropdown && (
                <div
                  className="mt-2 rounded-xl border overflow-hidden animate-slide-down"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(23,37,84,0.9))',
                    borderColor: 'rgba(99,102,241,0.25)',
                  }}
                >
                  <div className="p-3 space-y-2">
                    {/* Username row */}
                    <div
                      className="flex items-center justify-between px-3 py-2 rounded-lg border"
                      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <div>
                        <div className="text-[9px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Username</div>
                        <div className="font-mono text-xs font-bold text-blue-300">testuser</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('testuser', 'user')}
                        className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Copy username"
                      >
                        {copied === 'user' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* Password row */}
                    <div
                      className="flex items-center justify-between px-3 py-2 rounded-lg border"
                      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <div>
                        <div className="text-[9px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Password</div>
                        <div className="font-mono text-xs font-bold text-blue-300">Test1234!</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('Test1234!', 'pass')}
                        className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Copy password"
                      >
                        {copied === 'pass' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-3 pb-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('testuser')
                        setPassword('Test1234!')
                        setErrors({})
                        toast.success('Credentials filled in!')
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all text-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(59,130,246,0.2))',
                        border: '1px solid rgba(99,102,241,0.3)',
                        color: '#a5b4fc',
                      }}
                    >
                      ⚡ Auto-fill
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDemoPassword}
                      disabled={resettingDemo}
                      className="py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                      style={{
                        background: 'rgba(245,158,11,0.15)',
                        border: '1px solid rgba(245,158,11,0.25)',
                        color: '#fcd34d',
                      }}
                      title="Restore demo account password to Test1234!"
                    >
                      <RefreshCw size={11} className={resettingDemo ? 'animate-spin' : ''} />
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Login Form inside Modal ─────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email or Username */}
              <div>
                <label htmlFor="login-email" className="label text-xs">Email or Username</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="testuser or test@runstreak.app"
                    className={`input pl-9 text-sm ${errors.email ? 'input-error' : ''}`}
                    autoComplete="username"
                  />
                </div>
                {errors.email && <p className="error-text text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="label text-xs mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-indigo-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`input pl-9 pr-10 text-sm ${errors.password ? 'input-error' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="error-text text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-fire w-full btn-lg mt-2 shadow-lg shadow-orange-500/20"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Warm, friendly cold-start & demo seeding prompt */}
              {submitting && (
                <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 space-y-1.5 text-left animate-fade-in">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <Sparkles size={14} className="text-amber-400 animate-pulse" />
                    <span>
                      {(email.trim().toLowerCase() === 'testuser' || email.trim().toLowerCase() === 'test@runstreak.app')
                        ? 'Preparing Demo Showcase...'
                        : 'Signing in & Syncing...'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {(email.trim().toLowerCase() === 'testuser' || email.trim().toLowerCase() === 'test@runstreak.app') ? (
                      <>
                        ⚡ <strong className="text-white">First login of the day?</strong> The server automatically seeds fresh activity, streaks, and badges to provide a complete showcase experience. This may take a few extra seconds on cold start!
                      </>
                    ) : (
                      <>
                        ⚡ Waking up the server & syncing your daily streak... Thanks for your patience!
                      </>
                    )}
                  </p>
                </div>
              )}
            </form>

            {/* Register link */}
            <p className="text-center text-xs text-slate-400 pt-1">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
