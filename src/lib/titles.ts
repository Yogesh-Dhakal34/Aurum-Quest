/**
 * Phase 5.4 (Stretch) — Titles.
 *
 * A level-gated ladder using the exact five names from ROADMAP.md 5.4,
 * spaced against the real xpForLevel curve (lib/xp.ts) rather than
 * arbitrary round numbers. Deliberately level-gated, not tied to a
 * dominant stat: level is a single, unambiguous number, so "why is my
 * title X" and "what do I need for the next one" both stay trivially
 * explainable — no tie-break logic needed for a player whose stats are
 * split evenly across categories.
 *
 * Pure and side-effect free, same shape as lib/stats.ts and
 * lib/achievements.ts — no Supabase, no persistence. The title is
 * always recomputed fresh from the player's current level rather than
 * stored, so it can never drift out of sync the way the old static
 * profiles.title column could.
 */

export type TitleDefinition = {
  name: string
  minLevel: number
}

export const TITLE_LADDER: TitleDefinition[] = [
  { name: 'Novice Adventurer', minLevel: 1 },
  { name: 'Focused Scholar', minLevel: 5 },
  { name: 'Iron Discipline', minLevel: 10 },
  { name: 'Builder', minLevel: 15 },
  { name: 'Aurum Vanguard', minLevel: 20 },
]

/**
 * The highest title whose minLevel the player's current level meets.
 * TITLE_LADDER[0] always qualifies (minLevel: 1), so this never returns
 * undefined for any valid level.
 */
export function getCurrentTitle(level: number): TitleDefinition {
  let current = TITLE_LADDER[0]

  for (const title of TITLE_LADDER) {
    if (level >= title.minLevel) {
      current = title
    }
  }

  return current
}

/**
 * The next title on the ladder above the player's current one, or null
 * if they've already reached the top tier (Aurum Vanguard). Used to
 * render "next title's requirement" per UI_GUIDELINE.md's Phase 5
 * component inventory.
 */
export function getNextTitle(level: number): TitleDefinition | null {
  const current = getCurrentTitle(level)
  const currentIndex = TITLE_LADDER.findIndex(
    (title) => title.name === current.name,
  )

  return TITLE_LADDER[currentIndex + 1] ?? null
}
