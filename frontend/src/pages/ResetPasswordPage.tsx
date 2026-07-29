import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Flame, Lock, Eye, EyeOff } from 'lucide-react'
import authApi from '../api/auth'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!password) errs.password = 'New password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) {
      toast.error('Invalid or missing reset token.')
      return
    }
    if (!validate()) return

    setSubmitting(true)
    try {
      await authApi.resetPassword(token, password)
      toast.success('Password reset successfully! Please sign in with your new password.')
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to reset password. Link may have expired.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))] px-4">
        <div className="card p-6 max-w-sm w-full text-center space-y-4">
          <h2 className="text-xl font-bold text-red-400">Invalid Link</h2>
          <p className="text-sm text-[hsl(var(--color-text-muted))]">
            This password reset link is invalid or incomplete.
          </p>
          <Link to="/forgot-password" className="btn btn-primary w-full">
            Request New Reset Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))] px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-fire mb-4">
            <Flame size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Set New Password</h1>
          <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
            Choose a strong new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {/* New Password */}
          <div>
            <label htmlFor="new-password" className="label">
              New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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
            {errors.password && <p className="error-text mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm-password" className="label">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`input pl-9 ${errors.confirmPassword ? 'input-error' : ''}`}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && <p className="error-text mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full btn-lg"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
