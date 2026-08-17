import { useEffect, useRef, useState } from 'react'
import { loadFromStorage, saveToStorage } from '../lib/storage'

/**
 * Drop-in replacement for `useState` that persists its value to
 * localStorage under the given key.
 *
 * - On first call, attempts to load a previously saved value. Falls back to
 *   `initialValue` if nothing is saved yet, storage is unavailable, or the
 *   saved value is corrupted/invalid.
 * - On every subsequent state change, persists the new value.
 *
 * Kept generic and UI-agnostic on purpose so persistence logic isn't
 * duplicated across components — any future piece of state (settings,
 * daily snapshot, etc. in later phases) can reuse this same hook.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  isValid?: (value: unknown) => value is T,
) {
  const [state, setState] = useState<T>(() =>
    loadFromStorage(key, initialValue, isValid),
  )

  // Skip persisting on the very first render — we just loaded this value
  // (or it's the untouched initial value), so there's nothing new to save.
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    saveToStorage(key, state)
  }, [key, state])

  return [state, setState] as const
}