import { useState } from 'react'
import AppShell from './layouts/AppShell'
import LegendPage from './pages/LegendPage'
import ProgressPage from './pages/ProgressPage'
import QuestsPage from './pages/QuestsPage'
import RealmPage from './pages/RealmPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'
import type { View } from './types/view'
import { AnimatePresence } from 'motion/react'
import OpeningExperience from './components/OpeningExperience'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'

function AuthenticatedApp() {
  const [currentView, setCurrentView] = useState<View>('quests')
  const [showOpening, setShowOpening] = useState(true)

  const renderPage = () => {
    switch (currentView) {
      case 'legend':
        return <LegendPage />

      case 'progress':
        return <ProgressPage />

      case 'realm':
        return <RealmPage />

      case 'settings':
        return <SettingsPage />

      case 'quests':
      default:
        return <QuestsPage />
    }
  }

  return (
    <>
      <AppShell
        currentView={currentView}
        onNavigate={setCurrentView}
      >
        {renderPage()}
      </AppShell>

      <AnimatePresence>
        {showOpening && (
          <OpeningExperience
            onComplete={() => setShowOpening(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function AuthGate() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return <AuthenticatedApp />
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

export default App