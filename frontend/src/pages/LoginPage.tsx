import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Mail, Lock, Eye, EyeOff, Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
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
      toast.success('Demo account password reset to Test1234!')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to reset demo password.'
      toast.error(msg)
    } finally {
      setResettingDemo(false)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg))] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column — Showcase Carousel (Desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center border-r border-slate-800/80 pr-8">
          <AppShowcase />
        </div>

        {/* Right Column — Login Card */}
        <div className="w-full max-w-md mx-auto animate-fade-in-up">
          {/* Brand header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-fire mb-3 shadow-lg">
              <Flame size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Welcome back</h1>
            <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
              Sign in to continue your streak
            </p>
          </div>

          {/* MSA Marker Collapsible Demo Account Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
              className="w-full p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300 flex items-center justify-between hover:bg-blue-500/15 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                <span>MSA Marker Demo Account</span>
              </span>
              {showDemoDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showDemoDropdown && (
              <div className="mt-2 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-3 animate-fade-in">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  A pre-seeded test account with 42 runs, badges, route challenges, and a 14-day streak.
                </p>
                <div className="text-[11px] font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div>Username: <strong className="text-blue-300">testuser</strong></div>
                  <div>Password: <strong className="text-blue-300">Test1234!</strong></div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('testuser')
                      setPassword('Test1234!')
                      setErrors({})
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold transition-colors text-center text-xs"
                  >
                    Auto-fill
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDemoPassword}
                    disabled={resettingDemo}
                    className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold transition-colors flex items-center gap-1.5 text-xs"
                    title="Restores the testuser password to Test1234!"
                  >
                    <RefreshCw size={12} className={resettingDemo ? 'animate-spin' : ''} />
                    <span>Quick Reset</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="card p-6 space-y-4 shadow-xl">
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
          <p className="text-center text-sm text-[hsl(var(--color-text-muted))] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[hsl(var(--color-brand))] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
