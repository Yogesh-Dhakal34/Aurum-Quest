import { useEffect, useState } from 'react'
import AppShell from './layouts/AppShell'
import LegendPage from './pages/LegendPage'
import ProgressPage from './pages/ProgressPage'
import QuestsPage from './pages/QuestsPage'
import RealmPage from './pages/RealmPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import type { View } from './types/view'
import { AnimatePresence } from 'motion/react'
import OpeningExperience from './components/OpeningExperience'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { getOnboardingStatus } from './services/onboardingService'

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

type OnboardingCheck = 'checking' | 'not-started' | 'completed' | 'error'

function OnboardingGate() {
  const { user } = useAuth()
  const [status, setStatus] = useState<OnboardingCheck>('checking')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    let cancelled = false
    const currentUser = user

    async function check() {
      try {
        const result = await getOnboardingStatus(currentUser.id)
        if (!cancelled) setStatus(result)
      } catch (error) {
        if (cancelled) return
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to check onboarding status.',
        )
        setStatus('error')
      }
    }

    check()

    return () => {
      cancelled = true
    }
  }, [user])

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {errorMessage ?? 'Something went wrong.'}
        </p>
      </div>
    )
  }

  if (status === 'not-started') {
    return <OnboardingPage onComplete={() => setStatus('completed')} />
  }

  return <AuthenticatedApp />
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

  return <OnboardingGate />
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

export default App