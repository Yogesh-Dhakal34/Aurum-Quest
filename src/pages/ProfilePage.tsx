import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getPlayer } from '../services/playerService'
import { updateAvatar, updateBirthday } from '../services/profileService'
import AvatarDisplay from '../components/AvatarDisplay'
import type { Player } from '../types/player'
import type { View } from '../types/view'

type ProfilePageProps = {
  onNavigate: (view: View) => void
}

const AVATAR_OPTIONS: Array<{ sex: 'male' | 'female'; variant: number }> = [
  { sex: 'male', variant: 1 },
  { sex: 'male', variant: 2 },
  { sex: 'female', variant: 1 },
  { sex: 'female', variant: 2 },
]

function formatJoinedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * The literal account-info page: photo, avatar picker, birthday,
 * join date, level readout. Deliberately separate from LegendPage,
 * which already shows avatar/title/level but in a narrative "who
 * you're becoming" framing -- this page is closer to what Settings
 * pages on most apps call "Profile" or "Account."
 *
 * "Avatar Style" rather than "Gender" is a deliberate wording choice:
 * onboarding itself calls this step "Choose your avatar" and labels
 * the options purely as an art-style pick, never as a personal-
 * identity question -- carrying that same framing here avoids
 * quietly turning a cosmetic choice into something it was never
 * meant to be.
 */
function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user } = useAuth()

  const [player, setPlayer] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const [birthdayInput, setBirthdayInput] = useState('')
  const [isSavingBirthday, setIsSavingBirthday] = useState(false)
  const [birthdayError, setBirthdayError] = useState<string | null>(null)
  const [birthdaySaved, setBirthdaySaved] = useState(false)

  useEffect(() => {
    if (!user) return
    const currentUser = user
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const loadedPlayer = await getPlayer(currentUser.id)
        if (cancelled) return

        setPlayer(loadedPlayer)
        setBirthdayInput(loadedPlayer?.birthday ?? '')
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load your profile.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user])

  async function handleSelectAvatar(sex: 'male' | 'female', variant: number) {
    if (!user || !player) return
    if (player.avatarSex === sex && player.avatarVariant === variant) return

    setIsSavingAvatar(true)
    setAvatarError(null)

    try {
      await updateAvatar(user.id, sex, variant)
      setPlayer({ ...player, avatarSex: sex, avatarVariant: variant })
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Failed to update avatar.')
    } finally {
      setIsSavingAvatar(false)
    }
  }

  async function handleSaveBirthday() {
    if (!user) return
    setIsSavingBirthday(true)
    setBirthdayError(null)
    setBirthdaySaved(false)

    try {
      await updateBirthday(user.id, birthdayInput || null)
      setPlayer((current) => (current ? { ...current, birthday: birthdayInput || null } : current))
      setBirthdaySaved(true)
    } catch (error) {
      setBirthdayError(error instanceof Error ? error.message : 'Failed to save birthday.')
    } finally {
      setIsSavingBirthday(false)
    }
  }

  if (isLoading) {
    return <p className="text-slate-400">Loading your profile...</p>
  }

  if (loadError || !player) {
    return <p className="text-red-400">{loadError ?? 'No profile found.'}</p>
  }

  return (
    <section className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => onNavigate('settings')}
        className="text-sm text-slate-500 hover:text-slate-300"
      >
        &larr; Back to Settings
      </button>

      <p className="mt-4 text-sm text-cyan-400">Aurum Quest</p>
      <h2 className="mt-1 text-3xl font-bold">Profile</h2>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <AvatarDisplay avatarSex={player.avatarSex} avatarVariant={player.avatarVariant} size="lg" />
        <div>
          <h3 className="text-2xl font-bold">{player.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{player.title}</p>
        </div>
      </div>

      <div className="mt-6 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Level</p>
          <p className="mt-1 text-xl font-bold text-white">{player.level}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Avatar Style</p>
          <p className="mt-1 text-xl font-bold text-white capitalize">{player.avatarSex}</p>
        </div>
        {user && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">First Joined</p>
            <p className="mt-1 text-sm font-medium text-white">
              {user.created_at ? formatJoinedDate(user.created_at) : 'Unknown'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 max-w-2xl rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Choose your avatar</p>
        <div className="mt-3 flex gap-3">
          {AVATAR_OPTIONS.map((option) => {
            const isSelected =
              player.avatarSex === option.sex && player.avatarVariant === option.variant
            return (
              <button
                key={`${option.sex}-${option.variant}`}
                type="button"
                disabled={isSavingAvatar}
                onClick={() => void handleSelectAvatar(option.sex, option.variant)}
                className={`rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : ''
                }`}
                aria-label={`Select ${option.sex} avatar style ${option.variant}`}
              >
                <AvatarDisplay avatarSex={option.sex} avatarVariant={option.variant} />
              </button>
            )
          })}
        </div>
        {avatarError && <p className="mt-2 text-sm text-red-400">{avatarError}</p>}
      </div>

      <div className="mt-6 max-w-2xl rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Birthday</p>
        <p className="mt-2 text-sm text-slate-400">Optional — not shown to anyone else.</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="date"
            value={birthdayInput}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(event) => {
              setBirthdayInput(event.target.value)
              setBirthdaySaved(false)
            }}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200"
          />
          <button
            type="button"
            disabled={isSavingBirthday}
            onClick={() => void handleSaveBirthday()}
            className="rounded-lg bg-cyan-400/10 px-4 py-1.5 text-sm font-medium text-cyan-400 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingBirthday ? 'Saving...' : 'Save'}
          </button>
        </div>
        {birthdaySaved && <p className="mt-2 text-sm text-cyan-400">Saved.</p>}
        {birthdayError && <p className="mt-2 text-sm text-red-400">{birthdayError}</p>}
      </div>
    </section>
  )
}

export default ProfilePage