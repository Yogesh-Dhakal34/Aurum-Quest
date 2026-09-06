import { usePwaUpdate } from '../hooks/usePwaUpdate'

/**
 * Shown only when a new version has finished installing in the
 * background (needRefresh). Explicit and dismissible, never a silent
 * auto-reload — see usePwaUpdate.ts's comment on why 'prompt' mode was
 * chosen over 'autoUpdate'.
 */
function UpdateAvailableBanner() {
  const { needRefresh, updateApp, dismiss } = usePwaUpdate()

  if (!needRefresh) return null

  return (
    <div className="flex items-center justify-between gap-3 border-b border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm">
      <span className="text-cyan-200">A new version of Aurum Quest is ready.</span>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={updateApp}
          className="rounded-lg bg-cyan-400/20 px-3 py-1 font-medium text-cyan-300 transition hover:bg-cyan-400/30"
        >
          Reload
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg px-2 py-1 text-slate-400 transition hover:text-slate-200"
          aria-label="Dismiss update notice"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default UpdateAvailableBanner
