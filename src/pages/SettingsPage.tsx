import { useAuth } from '../hooks/useAuth'
import { useSound } from '../hooks/useSound'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

function SettingsPage() {
  const { user, signOut } = useAuth()
  const { settings, setEffectsEnabled, setEffectsVolume } = useSound()
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt()

  return (
    <section>
      <p className="text-sm text-cyan-400">Aurum Quest</p>

      <h2 className="mt-1 text-3xl font-bold">
        Settings
      </h2>

      <p className="mt-2 text-slate-400">
        Application settings will appear here.
      </p>

      <div className="mt-6 max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Signed in as
        </p>
        <p className="mt-1 text-white">{user?.email}</p>

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-red-500/50 hover:text-red-400"
        >
          Sign Out
        </button>
      </div>

      {/* Phase 8: sound settings. Only effects controls exist here —
          ambient music is Stretch/not built yet, so there's nothing to
          give a separate music toggle to. This section grows to
          include one once ambient audio ships, rather than adding a
          toggle now for a feature that doesn't exist. */}
      <div className="mt-4 max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Sound</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-300">Sound effects</span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.effectsEnabled}
            onClick={() => setEffectsEnabled(!settings.effectsEnabled)}
            className={`relative h-6 w-11 shrink-0 rounded-full p-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
              settings.effectsEnabled ? 'bg-cyan-400' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                settings.effectsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="effects-volume" className="text-sm text-slate-300">
              Volume
            </label>
            <span className="text-xs text-slate-500">
              {Math.round(settings.effectsVolume * 100)}%
            </span>
          </div>
          <input
            id="effects-volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.effectsVolume}
            disabled={!settings.effectsEnabled}
            onChange={(e) => setEffectsVolume(Number(e.target.value))}
            className="mt-2 w-full accent-cyan-400 disabled:opacity-40"
          />
        </div>
      </div>

      {/* Phase 8: PWA install. Only shown when there's an actual action
          to offer — Chrome/Edge fire beforeinstallprompt and this
          becomes a real button; Safari/Firefox never fire it, so
          nothing renders here and their own native "Add to Home
          Screen" flow is what those users get instead. Never a popup
          or banner elsewhere in the app — this is the one deliberate,
          dismissible-by-simply-not-clicking-it place it lives. */}
      {(isInstallable || isInstalled) && (
        <div className="mt-4 max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">App</p>

          {isInstalled ? (
            <p className="mt-2 text-sm text-slate-400">
              Aurum Quest is installed on this device.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-400">
                Install Aurum Quest for quicker access and a full-screen experience.
              </p>
              <button
                type="button"
                onClick={() => void promptInstall()}
                className="mt-3 rounded-lg bg-cyan-400/10 px-4 py-1.5 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-400/20"
              >
                Install App
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default SettingsPage