import { supabase } from '../lib/supabase'

/**
 * Updates both avatarSex and avatarVariant together, since the Profile
 * page's picker presents 4 complete avatar thumbnails to choose from,
 * not two separate style-then-variant steps. Applied immediately on
 * click, matching how every other Settings toggle in this app already
 * behaves (sound, install) rather than requiring a separate Save step
 * for a single-click choice.
 */
export async function updateAvatar(
  userId: string,
  avatarSex: 'male' | 'female',
  avatarVariant: number,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_sex: avatarSex, avatar_variant: avatarVariant })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Birthday is free-text-adjacent (a date input) rather than a single
 * click, so it gets an explicit Save button on the Profile page rather
 * than saving on every keystroke/change like the avatar picker does.
 */
export async function updateBirthday(userId: string, birthday: string | null): Promise<void> {
  const { error } = await supabase.from('profiles').update({ birthday }).eq('id', userId)

  if (error) throw error
}