import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

/**
 * Shown after the user opens a password reset email link. Supabase has
 * already signed them in with a recovery session, so updateUser() can set
 * the new password. finishRecovery() then lets the app continue normally.
 */
function ResetPasswordPage() {
  const { finishRecovery } = useAuth()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setIsSubmitting(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    finishRecovery()
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <p className="text-sm text-cyan-400">Aurum Quest</p>
        <h1 className="mt-1 text-3xl font-bold">Choose a new password</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <div>
          <label htmlFor="new-password" className="mb-1 block text-sm text-slate-400">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-1 block text-sm text-slate-400">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save new password'}
        </button>
      </form>
    </section>
  )
}

export default ResetPasswordPage