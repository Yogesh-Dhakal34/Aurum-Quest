import { useEffect, useState } from 'react'
import AppShell from './layouts/AppShell'
import LegendPage from './pages/LegendPage'
import ProgressPage from './pages/ProgressPage'
import QuestsPage from './pages/QuestsPage'
import RealmPage from './pages/RealmPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import SummaryPage from './pages/SummaryPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import type { View } from './types/view'
import { AnimatePresence } from 'motion/react'
import OpeningExperience from './components/OpeningExperience'
import { AuthProvider } from './context/AuthContext'
import { SoundProvider } from './context/SoundContext'
import { useAuth } from './hooks/useAuth'
import { getOnboardingStatus } from './services/onboardingService'

// Phase 8 performance pass: route-based code-splitting (React.lazy per
// page) was tried here and deliberately reverted. On this project's
// exact toolchain (Vite 8's new Rolldown bundler), it measured as a
// net INCREASE in the main bundle — 199.56 KB eager vs 327.31 KB after
// splitting, confirmed via a direct A/B build on this same codebase,
// with no duplication in the split chunks (verified by grepping for
// page-specific strings in the main bundle). This matches a known,
// currently-open upstream issue (vitejs/vite#22007): Rolldown's
// tree-shaking is less aggressive once dynamic imports are introduced,
// so splitting can genuinely make things worse, not better, on this
// specific bundler version. Shipping it would work against "fast
// initial render," not for it — revisit once that upstream issue is
// resolved, not before. The app is already small (this single ~200 KB
// gzip-63 KB bundle) with no heavy binary assets (all icons/scenes are
// inline SVG), which already satisfies most of this phase's
// performance goals without needing splitting at this app's size.

function AuthenticatedApp() {
  const [currentView, setCurrentView] = useState<View>('quests')
  // Once per app session, not once ever and not on every reload -- the
  // Mobile Legends-style behavior explicitly asked for: shown once when
  // the app is opened, silent on any reload/navigation within that same
  // open session, and shown again fresh the next time someone actually
  // leaves and reopens the app. sessionStorage is what makes this exact
  // distinction possible: it survives a page refresh (unlike plain
  // React state) but clears the moment the tab/PWA window fully closes
  // (unlike localStorage, which would make this "once ever").
  const [showOpening, setShowOpening] = useState(
    () => sessionStorage.getItem('aurumquest-opening-shown') !== 'true',
  )

  function handleOpeningComplete() {
    sessionStorage.setItem('aurumquest-opening-shown', 'true')
    setShowOpening(false)
  }

  const renderPage = () => {
    switch (currentView) {
      case 'legend':
        return <LegendPage />

      case 'progress':
        return <ProgressPage />

      case 'realm':
        return <RealmPage />

      case 'settings':
        return <SettingsPage onNavigate={setCurrentView} />

      case 'help':
        return <HelpPage onNavigate={setCurrentView} />

      case 'privacy':
        return <PrivacyPage onNavigate={setCurrentView} />

      case 'terms':
        return <TermsPage onNavigate={() => setCurrentView('settings')} />

      case 'summary':
        return <SummaryPage onNavigate={setCurrentView} />

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
            onComplete={handleOpeningComplete}
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

  return (
    <SoundProvider>
      <AuthenticatedApp />
    </SoundProvider>
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