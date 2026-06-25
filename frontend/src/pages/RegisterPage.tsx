import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import authApi from '../api/auth'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAccessToken, setUser, setLoading } = useAuthStore()

  const [form, setForm] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.username.trim()) errs.username = 'Username is required'
    else if (form.username.length < 3) errs.username = 'Username must be at least 3 characters'
    else if (form.username.length > 50) errs.username = 'Username must be 50 characters or less'

    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'

    if (!form.displayName.trim()) errs.displayName = 'Display name is required'
    else if (form.displayName.length > 100) errs.displayName = 'Display name must be 100 characters or less'

    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'

    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName,
      })
      setAccessToken(res.data.accessToken)
      setUser(res.data.user)
      setLoading(false)
      toast.success('Account created! Welcome to RunStreak 🔥')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      if (data?.errors) {
        // Map backend validation errors to field errors
        const fieldErrors: Record<string, string> = {}
        for (const [key, msgs] of Object.entries(data.errors)) {
          fieldErrors[key.charAt(0).toLowerCase() + key.slice(1)] = msgs[0]
        }
        setErrors(fieldErrors)
      }
      toast.error(data?.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))] px-4 py-8">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-fire mb-4">
            <Flame size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Join RunStreak</h1>
          <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
            Start building your running streak today
          </p>
        </div>

        {/* Register form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="reg-username" className="label">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
              <input
                id="reg-username"
                type="text"
                value={form.username}
                onChange={(e) => updateField('username', e.target.value)}
                placeholder="runner42"
                className={`input pl-9 ${errors.username ? 'input-error' : ''}`}
                autoComplete="username"
              />
            </div>
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>

          {/* Display name */}
          <div>
            <label htmlFor="reg-display-name" className="label">Display Name</label>
            <input
              id="reg-display-name"
              type="text"
              value={form.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="Jane Runner"
              className={`input ${errors.displayName ? 'input-error' : ''}`}
            />
            {errors.displayName && <p className="error-text">{errors.displayName}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="At least 8 characters"
                className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                autoComplete="new-password"
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

          {/* Confirm password */}
          <div>
            <label htmlFor="reg-confirm" className="label">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="Repeat your password"
                className={`input pl-9 ${errors.confirmPassword ? 'input-error' : ''}`}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-fire w-full btn-lg"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-[hsl(var(--color-text-muted))] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[hsl(var(--color-brand))] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
