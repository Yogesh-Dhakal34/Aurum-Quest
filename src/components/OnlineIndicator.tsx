import { useOnlineStatus } from '../hooks/useOnlineStatus'

/**
 * Clear online/offline state, per ROADMAP.md's PWA requirements.
 * Deliberately small and passive — a status dot, not an alert — since
 * being offline in this app is expected/normal (closing the laptop
 * lid, a subway commute), not an error state to make a fuss over.
 */
function OnlineIndicator() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <span className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Offline
    </span>
  )
}

export default OnlineIndicator
