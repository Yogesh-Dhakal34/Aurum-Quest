import { useCallback, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import {
  playQuestClaimSound,
  playLevelUpSound,
  playAchievementSound,
  playRealmUnlockSound,
} from '../lib/sound'
import {
  SoundContext,
  type SoundSettings,
  type SoundEvent,
} from './sound-context'

const DEFAULT_SETTINGS: SoundSettings = {
  effectsEnabled: true,
  effectsVolume: 0.6,
}

function isValidSoundSettings(value: unknown): value is SoundSettings {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.effectsEnabled === 'boolean' &&
    typeof v.effectsVolume === 'number' &&
    v.effectsVolume >= 0 &&
    v.effectsVolume <= 1
  )
}

/**
 * Owns sound settings in localStorage (usePersistentState, Phase 2's
 * reusable persistence hook) rather than Supabase — this is a
 * device-local preference, not account data. Someone might want sound
 * on at home and off at work on the same account; syncing it across
 * devices would be the wrong behavior, not just an unnecessary one.
 *
 * "No surprise autoplay on first launch" (ROADMAP.md) is satisfied
 * structurally, not by a special first-run check: every play() call in
 * this app only ever happens from inside a completion/unlock handler,
 * which only runs in response to the player's own action. There's no
 * code path that plays a sound on page load.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = usePersistentState<SoundSettings>(
    'sound-settings',
    DEFAULT_SETTINGS,
    isValidSoundSettings,
  )

  const setEffectsEnabled = useCallback(
    (enabled: boolean) => {
      setSettings((current) => ({ ...current, effectsEnabled: enabled }))
    },
    [setSettings],
  )

  const setEffectsVolume = useCallback(
    (volume: number) => {
      setSettings((current) => ({ ...current, effectsVolume: volume }))
    },
    [setSettings],
  )

  const play = useCallback(
    (event: SoundEvent) => {
      if (!settings.effectsEnabled) return

      const volume = settings.effectsVolume

      switch (event) {
        case 'questClaim':
          playQuestClaimSound(volume)
          break
        case 'levelUp':
          playLevelUpSound(volume)
          break
        case 'achievement':
          playAchievementSound(volume)
          break
        case 'realmUnlock':
          playRealmUnlockSound(volume)
          break
      }
    },
    [settings.effectsEnabled, settings.effectsVolume],
  )

  return (
    <SoundContext.Provider value={{ settings, setEffectsEnabled, setEffectsVolume, play }}>
      {children}
    </SoundContext.Provider>
  )
}
