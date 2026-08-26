/**
 * Phase 4.1 — XP Rules Engine
 *
 * Centralizes XP/combo/level math that previously lived inline inside
 * QuestsPage.tsx's handleCompleteQuest. Per ROADMAP.md: "XP must never
 * be calculated independently in multiple components." Every function
 * here is pure — no React, no Supabase, no side effects — so it can be
 * tested in complete isolation and reused anywhere XP/level numbers are
 * needed (QuestsPage today; achievement checks, analytics, etc. later).
 */

const COMBO_WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * Determines the combo count that should apply to a NEW quest
 * completion happening right now, given the player's current combo
 * state. If the last combo happened within the 24-hour window, the
 * combo continues (+1). Otherwise it resets to 1 (this completion
 * starts a fresh combo).
 *
 * Pulled from QuestsPage.tsx verbatim — behavior is unchanged, only its
 * location has moved.
 */
export function calculateComboState(
  comboCount: number,
  lastComboAt: string | null,
  now: Date = new Date(),
): number {
  const withinWindow =
    lastComboAt !== null &&
    now.getTime() - new Date(lastComboAt).getTime() <= COMBO_WINDOW_MS

  const currentCombo = withinWindow ? comboCount : 0

  return currentCombo + 1
}

/**
 * Calculates the final XP awarded for a quest completion, applying the
 * combo multiplier. Multiplier formula unchanged from the original
 * inline version: +10% per combo step beyond the first.
 *
 * `nextCombo` should be the value returned by calculateComboState for
 * this same completion — the two functions are meant to be called
 * together, not independently, since the reward depends on the combo
 * state that completion produces.
 */
export function calculateXpReward(baseXpReward: number, nextCombo: number): number {
  const comboMultiplier = 1 + (nextCombo - 1) * 0.1
  return Math.round(baseXpReward * comboMultiplier)
}

/**
 * Total XP required to REACH a given level, per GAMEPLAY.md §8:
 * xpForLevel(n) = 100 * n^1.5, rounded.
 *
 * Explicitly documented in GAMEPLAY.md as a tuning parameter, not a
 * fixed commitment — this is the one function to revisit if real usage
 * shows the pacing feels wrong, without needing to touch anything else
 * in this file or its callers.
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.round(100 * Math.pow(level, 1.5))
}

export type LevelProgress = {
  level: number
  xpInLevel: number
  xpToNextLevel: number
}

/**
 * Derives current level and in-level progress from lifetime XP.
 *
 * This is the direct replacement for the previously-static
 * xp_to_next_level: 500 value — that number was never actually derived
 * from anything, just a fixed placeholder set at account creation.
 * From Phase 4 onward, level and xp-to-next-level are always computed
 * fresh from lifetime XP, not stored as an independently-editable value
 * that could drift out of sync.
 */
export function levelFromXp(totalXp: number): LevelProgress {
  let level = 1

  // Walk upward while the player has enough XP to have reached the next
  // level's threshold. A player's totalXp only ever grows by small
  // quest rewards, so this loop runs a handful of times at most in
  // practice — not a performance concern at this scale.
  while (totalXp >= xpForLevel(level + 1)) {
    level += 1
  }

  const xpAtLevelStart = xpForLevel(level)
  const xpAtNextLevel = xpForLevel(level + 1)

  return {
    level,
    xpInLevel: totalXp - xpAtLevelStart,
    xpToNextLevel: xpAtNextLevel - xpAtLevelStart,
  }
}