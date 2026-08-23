import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { completeOnboarding } from '../services/onboardingService'
import type { QuestCategory } from '../types/quest'

const FOCUS_CATEGORY_OPTIONS: QuestCategory[] = [
  'Study',
  'Health',
  'Work',
  'Personal',
]

// A reasonable default guess, not a hard requirement — the user can
// change it here before continuing. Falls back to UTC if the browser
// can't determine it, same defensive pattern as the rest of the app.
function guessTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [avatarSex, setAvatarSex] = useState<'male' | 'female' | null>(null)
  const [timezone] = useState(guessTimezone())
  const [focusCategories, setFocusCategories] = useState<QuestCategory[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleFocusCategory(category: QuestCategory) {
    setFocusCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!user) return

    if (!avatarSex) {
      setError('Choose an avatar to continue.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await completeOnboarding(user.id, {
        name: name.trim() || 'Adventurer',
        avatarSex,
        timezone,
        focusCategories,
      })
      onComplete()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong setting up your account.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <p className="text-sm text-cyan-400">Aurum Quest</p>
        <h1 className="mt-1 text-3xl font-bold">Welcome, Adventurer</h1>
        <p className="mt-2 text-slate-400">
          A few quick things before your journey begins.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-slate-400">
            What should we call you?
          </label>
          <input
            id="name"
            type="text"
            placeholder="Adventurer"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-400">Choose your avatar</p>
          <div className="flex gap-3">
            {(['male', 'female'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAvatarSex(option)}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm capitalize transition ${
                  avatarSex === option
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-400">
            What do you want to focus on?{' '}
            <span className="text-slate-500">(optional, pick any)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_CATEGORY_OPTIONS.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleFocusCategory(category)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  focusCategories.includes(category)
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Timezone detected as {timezone}. This is used for your daily
          quest reset.
        </p>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {isSubmitting ? 'Setting up...' : 'Begin Your Quest'}
        </button>
      </form>
    </section>
  )
}

export default OnboardingPage
