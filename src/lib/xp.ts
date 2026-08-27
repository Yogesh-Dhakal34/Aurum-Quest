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

/**
 * Phase 4 combo fix — replaces the original rolling 24-hour window.
 *
 * The original design (kept in COMBO_WINDOW_MS above until this fix,
 * now superseded) checked whether the LAST combo happened within 24
 * hours of now. That meant completing all 3 daily quests back-to-back
 * — completely ordinary use — could chain the combo across an entire
 * day or even multiple days, producing an unbounded multiplier with no
 * relationship to GAMEPLAY.md's actual spec ("Study → Workout →
 * Journal, completed in order, in one day," with combo bonuses that
 * "must never dominate normal XP").
 *
 * Fixed design: the window is 2 hours, and it resets on EVERY
 * completion, not just the first. Complete a quest, and the next one
 * must happen within 2 hours to continue the combo — this rewards a
 * genuine session of consecutive activity rather than "did anything
 * yesterday," and naturally discourages combo-farming across a whole day.
 */
const COMBO_STEP_WINDOW_MS = 2 * 60 * 60 * 1000

/**
 * The multiplier's growth is capped at MAX_COMBO_MULTIPLIER so combo
 * bonuses stay a bonus, never the dominant source of XP, per
 * GAMEPLAY.md §10. At the original +10%-per-step rate, this cap is
 * reached at combo step 6 (1 + 5*0.1 = 1.5) — chosen so today's
 * already-earned 6x combo lines up exactly with the new ceiling,
 * rather than retroactively invalidating XP already awarded.
 */
const MAX_COMBO_MULTIPLIER = 1.5

/**
 * Determines the combo count that should apply to a NEW quest
 * completion happening right now, given the player's current combo
 * state. If the PREVIOUS completion happened within the 2-hour step
 * window, the combo continues (+1). Otherwise it resets to 1 (this
 * completion starts a fresh combo/session).
 */
export function calculateComboState(
  comboCount: number,
  lastComboAt: string | null,
  now: Date = new Date(),
): number {
  const withinStepWindow =
    lastComboAt !== null &&
    now.getTime() - new Date(lastComboAt).getTime() <= COMBO_STEP_WINDOW_MS

  const currentCombo = withinStepWindow ? comboCount : 0

  return currentCombo + 1
}

/**
 * Calculates the final XP awarded for a quest completion, applying the
 * combo multiplier — capped at MAX_COMBO_MULTIPLIER (see above) so the
 * bonus stays a bonus, never the dominant source of a completion's XP,
 * per GAMEPLAY.md §10.
 *
 * `nextCombo` should be the value returned by calculateComboState for
 * this same completion — the two functions are meant to be called
 * together, not independently, since the reward depends on the combo
 * state that completion produces.
 */
export function calculateXpReward(baseXpReward: number, nextCombo: number): number {
  const uncappedMultiplier = 1 + (nextCombo - 1) * 0.1
  const comboMultiplier = Math.min(uncappedMultiplier, MAX_COMBO_MULTIPLIER)
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