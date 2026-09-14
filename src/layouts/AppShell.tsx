import type { ReactNode } from 'react'
import type { View } from '../types/view'
import OnlineIndicator from '../components/OnlineIndicator'
import UpdateAvailableBanner from '../components/UpdateAvailableBanner'

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
    <div className="flex h-dvh flex-col bg-slate-950 text-white">
      {/* Fixed top region: never scrolls, regardless of content
          length or which device this renders on. h-dvh (not h-screen
          or min-h-screen) on the outer container is what makes this
          reliable on mobile -- 100vh doesn't account for the browser
          chrome (address bar) resizing as you scroll, which used to
          cause jumpy/clipped layouts; dvh does. */}
      <div className="shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <UpdateAvailableBanner />
        <header className="border-b border-slate-800">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-xl font-bold">Aurum Quest</h1>
            <OnlineIndicator />
          </div>

          <nav className="flex gap-1 overflow-x-auto border-t border-slate-800 px-4 py-2 md:hidden">
            {navigationItems.map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm transition ${
                  currentView === item.view
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>
      </div>

      {/* Everything below the fixed header shares the remaining
          height. overflow-hidden here is what stops this row itself
          from scrolling -- only its two children (aside, main) get
          their own independent scroll regions below. */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-slate-800 p-4 md:block">
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

        <main
          className="flex-1 overflow-y-auto overflow-x-hidden p-6"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell