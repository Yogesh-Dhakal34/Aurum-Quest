import { useState } from 'react'
import AppShell from './layouts/AppShell'
import LegendPage from './pages/LegendPage'
import ProgressPage from './pages/ProgressPage'
import QuestsPage from './pages/QuestsPage'
import RealmPage from './pages/RealmPage'
import SettingsPage from './pages/SettingsPage'
import type { View } from './types/view'

function App() {
  const [currentView, setCurrentView] = useState<View>('quests')

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
    <AppShell
      currentView={currentView}
      onNavigate={setCurrentView}
    >
      {renderPage()}
    </AppShell>
  )
}

export default App