import { supabase } from '../lib/supabase'

/**
 * Pulls every table a user's data actually lives in and assembles it
 * into one JSON object. Read-only, no service role needed -- every
 * table here already grants `select` to `authenticated` for a user's
 * own rows via existing RLS, so this runs entirely under the caller's
 * normal permissions.
 *
 * Deliberately NOT reusing the app's normal per-page service
 * functions (getTodaysQuests, getWeeklyProgress, etc.) -- those are
 * shaped for "what does the UI need right now" (today's quests, this
 * week's stats). An export needs the user's full history, which is a
 * different, simpler shape: just every row, unfiltered by date.
 */
export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  const [
    profile,
    playerState,
    characterStats,
    characterSkills,
    realmState,
    questProgress,
    achievementProgress,
    weeklyJournal,
    aiSuggestions,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('player_state').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('character_stats').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('character_skills').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('realm_state').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('quest_progress').select('*').eq('user_id', userId),
    supabase.from('achievement_progress').select('*').eq('user_id', userId),
    supabase.from('weekly_journal').select('*').eq('user_id', userId),
    supabase.from('ai_suggestions').select('*').eq('user_id', userId),
  ])

  for (const result of [
    profile,
    playerState,
    characterStats,
    characterSkills,
    realmState,
    questProgress,
    achievementProgress,
    weeklyJournal,
    aiSuggestions,
  ]) {
    if (result.error) throw result.error
  }

  return {
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    playerState: playerState.data,
    characterStats: characterStats.data,
    characterSkills: characterSkills.data,
    realmState: realmState.data,
    questProgress: questProgress.data,
    achievementProgress: achievementProgress.data,
    weeklyJournal: weeklyJournal.data,
    aiSuggestions: aiSuggestions.data,
  }
}

/** Triggers a browser download of the export as a formatted JSON file. */
export function downloadExport(data: Record<string, unknown>) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `aurum-quest-export-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Wipes progress back to a fresh-start state, keeping the account and
 * login. All the actual table-by-table logic lives in the
 * reset_my_progress() Postgres function so it runs as one atomic
 * transaction -- see create_reset_my_progress_function.sql for what
 * it actually touches.
 */
export async function resetMyProgress(): Promise<void> {
  const { error } = await supabase.rpc('reset_my_progress')
  if (error) throw error
}

/**
 * Permanently deletes the account and everything tied to it. Calls
 * the delete-account Edge Function since removing an auth user
 * requires the Admin API (service role only, no client-side key can
 * do this). Every user-data table cascades from auth.users, so this
 * one call removes everything.
 *
 * Caller is responsible for signing the user out immediately after
 * this resolves -- their session becomes invalid the moment the auth
 * user is gone, but Supabase won't do that for you automatically.
 */
export async function deleteMyAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  })
  if (error) throw error
}