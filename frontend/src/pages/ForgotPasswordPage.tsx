import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import authApi from '../api/auth'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authApi.forgotPassword(email.trim())
      setSubmitted(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to request password reset. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-bg))] px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-fire mb-4">
            <Flame size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Forgot Password</h1>
          <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
            Enter your email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div className="card p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-lg font-semibold">Check Your Email</h2>
            <p className="text-sm text-[hsl(var(--color-text-muted))]">
              If an account exists for <strong className="text-[hsl(var(--color-text))]">{email}</strong>, you will receive a reset link shortly.
            </p>
            <div className="pt-2">
              <Link to="/login" className="btn btn-secondary w-full">
                Back to Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label htmlFor="reset-email" className="label">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  placeholder="your.email@example.com"
                  className={`input pl-9 ${error ? 'input-error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {error && <p className="error-text mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--color-brand))] hover:underline">
                <ArrowLeft size={16} /> Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
