import { supabase } from '../lib/supabase'

type RealmStateRow = {
  user_id: string
  last_acknowledged_tier: number
}

/**
 * The last tier whose unlock ceremony has actually been shown to this
 * user. Self-healing — same pattern as characterService/skillService:
 * creates a default row (tier 1, i.e. "nothing unlocked yet") on first
 * read rather than a permanent null needing a manual SQL backfill.
 * Starting the healed row at 1 is deliberate, not just "the default":
 * if the player has actually already progressed past Tier 1 by the
 * time this fires, the caller's `actualTier > loadedTier` check still
 * correctly surfaces the ceremony for whatever they've already earned,
 * rather than silently skipping it.
 */
export async function getLastAcknowledgedTier(
  userId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from('realm_state')
    .select('user_id, last_acknowledged_tier')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (data) return (data as RealmStateRow).last_acknowledged_tier

  const { data: created, error: healError } = await supabase
    .from('realm_state')
    .upsert({ user_id: userId, last_acknowledged_tier: 1 })
    .select('user_id, last_acknowledged_tier')
    .maybeSingle()

  if (healError || !created) return null

  return (created as RealmStateRow).last_acknowledged_tier
}

/**
 * Marks a tier's unlock ceremony as shown, so it won't replay on a
 * future visit. Called once, right after the ceremony is actually
 * displayed — not at the moment the XP threshold is crossed, so a
 * player who never sees the animation (tab closed mid-flow) still gets
 * it queued up for their next visit.
 */
export async function acknowledgeTier(
  userId: string,
  tier: number,
): Promise<void> {
  const { error } = await supabase
    .from('realm_state')
    .update({
      last_acknowledged_tier: tier,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) throw error
}
