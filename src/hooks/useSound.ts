import { useContext } from 'react'
import { SoundContext, type SoundContextValue } from '../context/sound-context'

export function useSound(): SoundContextValue {
  const context = useContext(SoundContext)

  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider')
  }

  return context
}
