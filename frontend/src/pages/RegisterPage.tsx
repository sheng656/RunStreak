import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, User, Mail, Lock, Eye, EyeOff, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import authApi from '../api/auth'
import { setStoredRefreshToken } from '../api/client'
import toast from 'react-hot-toast'
import AppShowcase from '../components/ui/AppShowcase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAccessToken, setUser, setLoading } = useAuthStore()

  // Step 1 = Form details, Step 2 = Verification code confirmation
  const [step, setStep] = useState<1 | 2>(1)

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

  // Step 2 state
  const [verificationCode, setVerificationCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)

  // Countdown timer for Resend Code button
  useEffect(() => {
    if (step !== 2 || resendCooldown <= 0) return

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [step, resendCooldown])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validateStep1(): boolean {
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

  async function handleInitiateRegister(e: FormEvent) {
    e.preventDefault()
    if (!validateStep1()) return

    setSubmitting(true)
    try {
      await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName,
      })
      toast.success('Verification code sent to your email!')
      setStep(2)
      setResendCooldown(60)
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      if (data?.errors) {
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

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault()
    const codeClean = verificationCode.trim()
    if (!codeClean) {
      setCodeError('Verification code is required')
      return
    }
    if (codeClean.length !== 6 || !/^\d{6}$/.test(codeClean)) {
      setCodeError('Please enter a valid 6-digit code')
      return
    }

    setCodeError('')
    setVerifying(true)
    try {
      const res = await authApi.verifyRegistration({
        email: form.email,
        code: codeClean,
      })
      setStoredRefreshToken(res.data.refreshToken)
      setAccessToken(res.data.accessToken)
      setUser(res.data.user)
      setLoading(false)
      toast.success('Account verified & created! Welcome to RunStreak 🔥')
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data
      setCodeError(data?.message || 'Invalid verification code.')
      toast.error(data?.message || 'Verification failed. Please check your code.')
    } finally {
      setVerifying(false)
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return

    try {
      await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName,
      })
      setResendCooldown(60)
      toast.success('A new verification code has been sent!')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data
      toast.error(data?.message || 'Failed to resend verification code.')
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg))] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column — Showcase Carousel (Desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center border-r border-slate-800/80 pr-8">
          <AppShowcase />
        </div>

        {/* Right Column — Register Form / Verification */}
        <div className="w-full max-w-md mx-auto animate-fade-in-up">
          {/* Brand header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-fire mb-3 shadow-lg">
              <Flame size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">
              {step === 1 ? 'Join RunStreak' : 'Verify Your Email'}
            </h1>
            <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
              {step === 1
                ? 'Start building your running streak today'
                : `We sent a 6-digit code to ${form.email}`}
            </p>
          </div>

          {step === 1 ? (
            /* Step 1 Form */
            <form onSubmit={handleInitiateRegister} className="card p-6 space-y-4 shadow-xl">
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
                {errors.username && <p className="error-text mt-1">{errors.username}</p>}
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
                {errors.displayName && <p className="error-text mt-1">{errors.displayName}</p>}
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
                {errors.email && <p className="error-text mt-1">{errors.email}</p>}
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
                {errors.password && <p className="error-text mt-1">{errors.password}</p>}
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
                {errors.confirmPassword && <p className="error-text mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-fire w-full btn-lg mt-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Continue & Send Code'
                )}
              </button>
            </form>
          ) : (
            /* Step 2 Verification Code Form */
            <div className="card p-6 space-y-5 shadow-xl">
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label htmlFor="reg-code" className="label">6-Digit Verification Code</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                    <input
                      id="reg-code"
                      type="text"
                      maxLength={6}
                      pattern="[0-9]*"
                      value={verificationCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        setVerificationCode(val)
                        if (codeError) setCodeError('')
                      }}
                      placeholder="123456"
                      className={`input pl-9 text-center tracking-[0.25em] font-mono text-lg ${codeError ? 'input-error' : ''}`}
                      autoFocus
                    />
                  </div>
                  {codeError && <p className="error-text mt-1">{codeError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={verifying || verificationCode.length !== 6}
                  className="btn btn-fire w-full btn-lg"
                >
                  {verifying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Verify Code & Finish'
                  )}
                </button>
              </form>

              {/* Resend button with cooldown */}
              <div className="pt-2 border-t border-[hsl(var(--color-border))] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                >
                  <ArrowLeft size={14} /> Back / Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  className={`inline-flex items-center gap-1 font-medium ${
                    resendCooldown > 0
                      ? 'text-[hsl(var(--color-text-muted))] cursor-not-allowed opacity-60'
                      : 'text-[hsl(var(--color-brand))] hover:underline'
                  }`}
                >
                  <RefreshCw size={12} className={resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform'} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          {/* Login link */}
          <p className="text-center text-sm text-[hsl(var(--color-text-muted))] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[hsl(var(--color-brand))] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
