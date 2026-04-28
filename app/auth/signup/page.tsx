'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, User, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { getRedirectUrl } from '@/lib/auth-utils'

type Role = 'guest' | 'host'
type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'agree', string>>

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function SignUpInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, signInWithGoogle, user, loading } = useAuth()

  // ?role=host pre-selects the Host card and (server-side) locks country to Iceland.
  const initialRole: Role = searchParams?.get('role') === 'host' ? 'host' : 'guest'

  const [role, setRole] = useState<Role>(initialRole)
  // If the user landed here with ?role=host (e.g. from a "Become a host" CTA), open the
  // email form by default so the role picker is visible alongside their selection.
  const [showEmailForm, setShowEmailForm] = useState(initialRole === 'host')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [topError, setTopError] = useState('')

  // Redirect if already logged in.
  useEffect(() => {
    if (!loading && user) router.push(getRedirectUrl(user))
  }, [user, loading, router])

  const errors: FieldErrors = {}
  if (!name.trim() || name.trim().length < 2) errors.name = 'Enter your full name'
  if (!email || !isValidEmail(email)) errors.email = 'Enter a valid email'
  if (password.length < 8) errors.password = 'At least 8 characters'
  if (!agreeToTerms) errors.agree = 'Required to continue'

  const showError = (field: keyof FieldErrors) =>
    (touched[field] || touched.submitted) && errors[field]
  const formValid = !errors.name && !errors.email && !errors.password && !errors.agree

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched((t) => ({ ...t, submitted: true }))
    if (!formValid) return
    setSubmitting(true)
    setTopError('')
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        // Hosts must be Icelandic residents — backend enforces this too.
        ...(role === 'host' ? { country: 'Iceland' } : {}),
      })
      if (result.success) {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
      } else {
        setTopError(result.error || 'Registration failed. Please try again.')
      }
    } catch (err: any) {
      setTopError(err?.message || 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setTopError('')
    setSubmitting(true)
    try {
      const errorHandler = (event: Event) => {
        const customEvent = event as CustomEvent<{ error: string }>
        setTopError(customEvent.detail?.error || 'Failed to sign in with Google.')
        setSubmitting(false)
        window.removeEventListener('googleAuthError', errorHandler)
      }
      window.addEventListener('googleAuthError', errorHandler)
      await signInWithGoogle()
    } catch (err: any) {
      setTopError(err?.message || 'Failed to sign in with Google.')
      setSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left side — image */}
      <div className="hidden md:flex md:w-1/2 relative h-screen">
        <Image
          src="/assets/sign.jpeg"
          alt="European street dining scene"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Right side — form */}
      <div className="flex-1 bg-muted h-screen overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 md:p-8">
          <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-6 md:p-8 space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold">Join Dine at Home</h2>
              <p className="text-sm text-muted-foreground">Takes under a minute</p>
            </div>

            {topError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <span className="text-destructive text-sm font-medium">{topError}</span>
              </div>
            )}

            {/* Primary CTA — Google. Role for new Google users is decided afterwards on the
                role-selection screen, so we don't show the picker here. */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Toggle to email form */}
            {!showEmailForm ? (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-card text-muted-foreground">or</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="w-full text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  Sign up with email instead
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-card text-muted-foreground">or sign up with email</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role picker — only relevant for the email path (Google new users are
                      sent to /auth/role-selection after OAuth). */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">I'm signing up as</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition ${
                          role === 'guest'
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="guest"
                          checked={role === 'guest'}
                          onChange={() => setRole('guest')}
                          className="text-primary"
                        />
                        <Users className="w-5 h-5 text-primary shrink-0" />
                        <span className="font-medium text-sm">Guest</span>
                      </label>
                      <label
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition ${
                          role === 'host'
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="host"
                          checked={role === 'host'}
                          onChange={() => setRole('host')}
                          className="text-primary"
                        />
                        <User className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium text-sm">Host</span>
                          <span className="text-[11px] text-muted-foreground">Iceland only</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-name" className="block text-sm font-medium mb-1.5">
                      Full name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      placeholder="e.g. Jón Jónsson"
                      className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                    {showError('name') && (
                      <p className="text-xs text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                    {showError('email') && (
                      <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        placeholder="At least 8 characters"
                        className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md p-1"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {showError('password') && (
                      <p className="text-xs text-destructive mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      id="signup-terms"
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => {
                        setAgreeToTerms(e.target.checked)
                        setTouched((t) => ({ ...t, agree: true }))
                      }}
                      className="w-4 h-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary/50"
                    />
                    <label htmlFor="signup-terms" className="text-sm">
                      I agree to{' '}
                      <Link
                        href="/terms-of-use"
                        target="_blank"
                        className="text-primary font-medium hover:underline"
                      >
                        Terms & Conditions
                      </Link>
                    </label>
                  </div>
                  {showError('agree') && (
                    <p className="text-xs text-destructive">{errors.agree}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="w-full bg-primary text-white py-2.5 rounded-xl text-base font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition"
                  >
                    {submitting ? 'Creating account…' : 'Create account'}
                  </button>
                </form>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpInner />
    </Suspense>
  )
}
