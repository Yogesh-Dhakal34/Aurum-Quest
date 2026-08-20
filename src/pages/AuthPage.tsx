import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

type AuthMode = 'sign-in' | 'sign-up' | 'reset-password'

function AuthPage() {
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setInfoMessage(null)
    setIsSubmitting(true)

    if (mode === 'reset-password') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
      )

      setIsSubmitting(false)

      if (resetError) {
        setError(resetError.message)
        return
      }

      setInfoMessage('Check your email for a password reset link.')
      return
    }

    const result =
      mode === 'sign-up'
        ? await signUp(email, password)
        : await signIn(email, password)

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (mode === 'sign-up') {
      setInfoMessage(
        'Account created. Check your email to confirm before signing in, if confirmation is required.',
      )
    }
    // On successful sign-in, AuthContext's onAuthStateChange picks up the
    // new session automatically — no manual redirect needed here.
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <p className="text-sm text-cyan-400">Aurum Quest</p>
        <h1 className="mt-1 text-3xl font-bold">
          {mode === 'sign-in' && 'Welcome back'}
          {mode === 'sign-up' && 'Create your account'}
          {mode === 'reset-password' && 'Reset your password'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-slate-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
          />
        </div>

        {mode !== 'reset-password' && (
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm text-slate-400"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === 'sign-up' ? 'new-password' : 'current-password'
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {infoMessage && (
          <p className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">
            {infoMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Please wait...'
            : mode === 'sign-in'
              ? 'Sign In'
              : mode === 'sign-up'
                ? 'Sign Up'
                : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-2 text-sm text-slate-400">
        {mode === 'sign-in' && (
          <>
            <button
              type="button"
              onClick={() => {
                setMode('sign-up')
                setError(null)
                setInfoMessage(null)
              }}
              className="hover:text-cyan-400"
            >
              Need an account? Sign up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('reset-password')
                setError(null)
                setInfoMessage(null)
              }}
              className="hover:text-cyan-400"
            >
              Forgot your password?
            </button>
          </>
        )}

        {mode !== 'sign-in' && (
          <button
            type="button"
            onClick={() => {
              setMode('sign-in')
              setError(null)
              setInfoMessage(null)
            }}
            className="hover:text-cyan-400"
          >
            Back to sign in
          </button>
        )}
      </div>
    </section>
  )
}

export default AuthPage
