import { useEffect, useState } from 'react'

/**
 * Tracks browser online/offline state for a "clear online/offline
 * state" indicator (ROADMAP.md's PWA requirements). navigator.onLine
 * is a coarse signal (true just means "has a network interface," not
 * "Supabase is actually reachable"), but it's the right granularity
 * for this: distinguishing "you have no network at all" from "there
 * was a specific request error" is what the UI needs to communicate,
 * not a full connectivity health check.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }
    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
