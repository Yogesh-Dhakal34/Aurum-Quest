import type { ReactNode } from 'react'
import type { View } from '../types/view'

type AppShellProps = {
  children: ReactNode
  currentView: View
  onNavigate: (view: View) => void
}

const navigationItems: { label: string; view: View }[] = [
  { label: 'Quests', view: 'quests' },
  { label: 'Legend', view: 'legend' },
  { label: 'Progress', view: 'progress' },
  { label: 'Realm', view: 'realm' },
  { label: 'Settings', view: 'settings' },
]

function AppShell({
  children,
  currentView,
  onNavigate,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-bold">Aurum Quest</h1>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        <aside className="hidden w-56 border-r border-slate-800 p-4 md:block">
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`block w-full rounded-lg px-3 py-2 text-left transition ${
                  currentView === item.view
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell