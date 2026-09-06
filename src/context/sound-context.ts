import { createContext } from 'react'

export type SoundEvent = 'questClaim' | 'levelUp' | 'achievement' | 'realmUnlock'

export type SoundSettings = {
  effectsEnabled: boolean
  effectsVolume: number
}

export type SoundContextValue = {
  settings: SoundSettings
  setEffectsEnabled: (enabled: boolean) => void
  setEffectsVolume: (volume: number) => void
  play: (event: SoundEvent) => void
}

export const SoundContext = createContext<SoundContextValue | undefined>(
  undefined,
)
