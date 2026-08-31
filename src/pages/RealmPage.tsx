import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getPlayer } from '../services/playerService'
import { getLastAcknowledgedTier, acknowledgeTier } from '../services/realmService'
import { REALM_TIERS, getCurrentTier, getRealmProgress } from '../lib/realm'
import RealmUnlockOverlay from '../components/RealmUnlockOverlay'
import type { Player } from '../types/player'

/**
 * Simple, consistent stroke-icon per building — same minimalist visual
 * language as AvatarDisplay (currentColor stroke, single shape), not
 * stock photography, per PHASE_ASSIGNMENTS.md's Phase 6 quality gate
 * ("Do not use stock photos as final realm art. Use a coherent art
 * direction.").
 */
function BuildingIcon({ building, size = 64 }: { building: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    Campfire: (
      <path d="M12 3 C9 8 8 11 8 14 a4 4 0 0 0 8 0 c0-2-1-3-2-4 c0.5 2-1 3-2 3 c-1 0-1.5-1-1-2 c1-1 1.5-3 1-8z" />
    ),
    'Chicken Coop': (
      <>
        <path d="M4 20 L4 12 L12 6 L20 12 L20 20 Z" />
        <path d="M8 20 L8 14 L16 14 L16 20" />
      </>
    ),
    'Herb Garden': (
      <>
        <path d="M12 21 L12 10" />
        <path d="M12 13 C9 13 7 11 7 8 C10 8 12 10 12 13Z" />
        <path d="M12 11 C15 11 17 9 17 6 C14 6 12 8 12 11Z" />
      </>
    ),
    Greenhouse: (
      <>
        <path d="M4 20 L4 10 L12 4 L20 10 L20 20 Z" />
        <path d="M4 20 L20 20" />
        <path d="M12 4 L12 20 M4 12 L20 12" />
      </>
    ),
    Watchtower: (
      <>
        <path d="M9 21 L9 8 L15 8 L15 21" />
        <path d="M7 8 L12 3 L17 8" />
        <path d="M11 21 L11 15 L13 15 L13 21" />
      </>
    ),
    'Crystal Forge': (
      <>
        <path d="M12 3 L17 10 L12 21 L7 10 Z" />
        <path d="M7 10 L17 10" />
        <path d="M12 3 L9 10 M12 3 L15 10" />
      </>
    ),
    'Sky Citadel': (
      <>
        <path d="M5 21 L5 11 L9 7 L9 21" />
        <path d="M15 21 L15 5 L12 2 L9 5 L9 21" />
        <path d="M19 21 L19 13 L15 9" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[building] ?? <circle cx="12" cy="12" r="6" />}
    </svg>
  )
}

/**
 * World backdrop — a simple layered scene (sky gradient, distant hills,
 * ground), deliberately abstract rather than literal, so it stays
 * coherent across all 7 tiers instead of needing 7 distinct
 * illustrations of "the world."
 */
function WorldBackdrop() {
  return (
    <svg viewBox="0 0 400 160" className="h-40 w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="realm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="400" height="160" fill="url(#realm-sky)" />
      <path d="M0 120 Q100 90 200 115 T400 105 V160 H0 Z" fill="#1e293b" opacity="0.8" />
      <path d="M0 140 Q120 115 240 135 T400 130 V160 H0 Z" fill="#0f172a" />
      <circle cx="330" cy="35" r="18" fill="#22d3ee" opacity="0.15" />
    </svg>
  )
}

function RealmPage() {
  const { user } = useAuth()
  const [player, setPlayer] = useState<Player | null>(null)
  const [ceremonyTierNumber, setCeremonyTierNumber] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const currentUser = user
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [loadedPlayer, loadedTier] = await Promise.all([
          getPlayer(currentUser.id),
          getLastAcknowledgedTier(currentUser.id),
        ])

        if (cancelled) return

        setPlayer(loadedPlayer)

        // Safety net (see realmService.acknowledgeTier's comment): if
        // the player crossed a tier threshold but never saw the
        // ceremony (e.g. it fired on the Quests page and they
        // navigated away, or closed the tab mid-animation), queue it
        // here on Realm page load instead of silently losing it.
        if (loadedPlayer && loadedTier !== null) {
          const actualTier = getCurrentTier(loadedPlayer.currentXp).tier
          if (actualTier > loadedTier) {
            setCeremonyTierNumber(actualTier)
          }
        }
      } catch (error) {
        if (cancelled) return
        setLoadError(
          error instanceof Error ? error.message : 'Failed to load your Realm.',
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user])

  async function handleDismissCeremony() {
    if (!user || ceremonyTierNumber === null) return

    const tierToAcknowledge = ceremonyTierNumber
    setCeremonyTierNumber(null)

    try {
      await acknowledgeTier(user.id, tierToAcknowledge)
    } catch {
      // Non-fatal: worst case, the ceremony is offered again on next
      // visit — annoying, not broken. Never block the UI on this.
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl">
        <p className="text-slate-400">Loading your Realm...</p>
      </section>
    )
  }

  if (loadError || !player) {
    return (
      <section className="mx-auto max-w-4xl">
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {loadError ?? 'No player profile found.'}
        </p>
      </section>
    )
  }

  const progress = getRealmProgress(player.currentXp)
  const ceremonyTier = REALM_TIERS.find((t) => t.tier === ceremonyTierNumber) ?? null

  return (
    <section className="mx-auto max-w-4xl">
      {ceremonyTier && (
        <RealmUnlockOverlay tier={ceremonyTier} onDismiss={handleDismissCeremony} />
      )}

      <p className="text-sm text-cyan-400">Aurum Quest</p>
      <h2 className="mt-1 text-3xl font-bold">Realm</h2>
      <p className="mt-2 text-slate-400">
        Your evolving personal realm — built from what you actually do.
      </p>

      {/* Realm map: world backdrop + current tier's building */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <WorldBackdrop />
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-cyan-400">
            <BuildingIcon building={progress.currentTier.building} size={36} />
          </div>
          <div>
            <p className="text-sm text-cyan-400">Tier {progress.currentTier.tier}</p>
            <h3 className="text-xl font-bold">{progress.currentTier.building}</h3>
            <p className="mt-1 text-sm text-slate-400">{progress.currentTier.blurb}</p>
          </div>
        </div>
      </div>

      {/* Progress-to-next-tier, visible without digging (UI_GUIDELINE.md Phase 6) */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        {progress.nextTier ? (
          <>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-slate-300">
                Next: <span className="font-medium text-slate-100">{progress.nextTier.building}</span>
              </span>
              <span className="text-slate-400">
                {progress.xpIntoTier.toLocaleString()} / {progress.xpNeededForNextTier.toLocaleString()} XP
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">
            You've reached the top of the realm — Sky Citadel.
          </p>
        )}
      </div>

      {/* Full tier list, so the player understands overall progress at a glance */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-200">Tiers</h3>
        <div className="mt-3 space-y-2">
          {REALM_TIERS.map((t) => {
            const isUnlocked = t.xpRequired <= player.currentXp
            const isCurrent = t.tier === progress.currentTier.tier

            return (
              <div
                key={t.tier}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  isCurrent
                    ? 'border-cyan-400/40 bg-cyan-400/5'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isUnlocked ? 'bg-slate-800 text-cyan-400' : 'bg-slate-800/50 text-slate-600'
                  }`}
                >
                  <BuildingIcon building={t.building} size={22} />
                </div>
                <div className="flex-1">
                  <p className={isUnlocked ? 'font-medium text-slate-100' : 'font-medium text-slate-600'}>
                    {t.building}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.xpRequired.toLocaleString()} XP
                  </p>
                </div>
                {!isUnlocked && <span className="text-xs text-slate-600">Locked</span>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default RealmPage
