import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import authApi from '../api/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAccessToken, setUser, setLoading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await authApi.login({ email, password })
      setAccessToken(res.data.accessToken)
      setUser(res.data.user)
      setLoading(false)
      toast.success('Welcome back!')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please check your credentials.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))] px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-fire mb-4">
            <Flame size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Welcome back</h1>
          <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
            Sign in to continue your streak
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="label">Password</label>
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
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full btn-lg"
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
  )
}
