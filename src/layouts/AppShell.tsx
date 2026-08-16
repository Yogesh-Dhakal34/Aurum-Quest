type AppShellProps = {
  children: React.ReactNode
}

function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-bold">Aurum Quest</h1>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        <aside className="hidden w-56 border-r border-slate-800 p-4 md:block">
          <nav className="space-y-2">
            <p>Quests</p>
            <p>Legend</p>
            <p>Progress</p>
            <p>Realm</p>
            <p>Settings</p>
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