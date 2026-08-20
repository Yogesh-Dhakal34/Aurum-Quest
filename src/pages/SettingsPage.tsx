import { useAuth } from '../hooks/useAuth'

function SettingsPage() {
  const { user, signOut } = useAuth()

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
    </section>
  )
}

export default SettingsPage