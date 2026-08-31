/**
 * Phase 6.1/6.4 — Realm tiers.
 *
 * Thresholds and building names taken directly from ROADMAP.md's Realm
 * progression table. Explicitly flagged there as "prototype values, not
 * sacred values" — revisit if real usage shows the pacing is off,
 * without needing to change anything else in this file's shape.
 *
 * Keyed off lifetime cumulative XP (player.currentXp), same value that
 * feeds levelFromXp in xp.ts — confirmed by tracing how currentXp
 * accumulates in QuestsPage (`player.currentXp + earnedXp`, never
 * reset), so no new XP tracking is needed for the realm to work.
 *
 * "Meaningful" (6.4) is interpreted here as: each building's blurb
 * connects to the consistency/habit-building theme the realm as a
 * whole represents, not a literal one-to-one tie to a single stat or
 * skill — the tier names ROADMAP.md gives (Campfire, Chicken Coop,
 * etc.) don't map cleanly onto specific stat categories the way the
 * doc's illustrative Library/Training-Ground examples do, and
 * inventing that mapping isn't supported by anything in the spec.
 */

export type RealmTier = {
  tier: number
  building: string
  xpRequired: number
  blurb: string
}

export const REALM_TIERS: RealmTier[] = [
  {
    tier: 1,
    building: 'Campfire',
    xpRequired: 0,
    blurb: 'Every legend starts with a single spark. This is where yours began.',
  },
  {
    tier: 2,
    building: 'Chicken Coop',
    xpRequired: 500,
    blurb: 'Small, daily upkeep — tended every day, not just when it\'s convenient.',
  },
  {
    tier: 3,
    building: 'Herb Garden',
    xpRequired: 12_000,
    blurb: 'Nothing here grew overnight. Steady cultivation, one session at a time.',
  },
  {
    tier: 4,
    building: 'Greenhouse',
    xpRequired: 65_000,
    blurb: 'Consistency compounds — what was fragile is now self-sustaining.',
  },
  {
    tier: 5,
    building: 'Watchtower',
    xpRequired: 280_000,
    blurb: 'Far enough along now to see how much ground has actually been covered.',
  },
  {
    tier: 6,
    building: 'Crystal Forge',
    xpRequired: 1_200_000,
    blurb: 'Raw effort, refined over a long stretch of time, into something durable.',
  },
  {
    tier: 7,
    building: 'Sky Citadel',
    xpRequired: 5_000_000,
    blurb: 'The realm at its peak — a record of everything it took to get here.',
  },
]

/**
 * The highest tier whose xpRequired the player's lifetime XP meets.
 * REALM_TIERS[0] always qualifies (xpRequired: 0), so this never
 * returns undefined for any valid totalXp.
 */
export function getCurrentTier(totalXp: number): RealmTier {
  let current = REALM_TIERS[0]

  for (const tier of REALM_TIERS) {
    if (totalXp >= tier.xpRequired) {
      current = tier
    }
  }

  return current
}

/**
 * The next tier above the player's current one, or null if they've
 * already reached the top tier (Sky Citadel).
 */
export function getNextTier(totalXp: number): RealmTier | null {
  const current = getCurrentTier(totalXp)
  const currentIndex = REALM_TIERS.findIndex((t) => t.tier === current.tier)

  return REALM_TIERS[currentIndex + 1] ?? null
}

export type RealmProgress = {
  currentTier: RealmTier
  nextTier: RealmTier | null
  xpIntoTier: number
  xpNeededForNextTier: number
  percentage: number
}

/**
 * Full progress-to-next-tier breakdown for the "Progress-to-next-tier"
 * UI component (UI_GUIDELINE.md Phase 6): XP toward next unlock,
 * visible without digging. Same derive-fresh-from-source pattern as
 * levelFromXp in xp.ts — never trust a stored snapshot when the real
 * value (lifetime XP) is already available.
 */
export function getRealmProgress(totalXp: number): RealmProgress {
  const currentTier = getCurrentTier(totalXp)
  const nextTier = getNextTier(totalXp)

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      xpIntoTier: 0,
      xpNeededForNextTier: 0,
      percentage: 100,
    }
  }

  const xpIntoTier = totalXp - currentTier.xpRequired
  const xpNeededForNextTier = nextTier.xpRequired - currentTier.xpRequired
  const percentage = Math.min(100, (xpIntoTier / xpNeededForNextTier) * 100)

  return { currentTier, nextTier, xpIntoTier, xpNeededForNextTier, percentage }
}
