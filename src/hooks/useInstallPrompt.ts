import { useEffect, useState } from 'react'

/**
 * Chrome/Edge fire `beforeinstallprompt` and let a site defer/trigger
 * it manually; Safari/Firefox don't support it at all (no error, the
 * event just never fires) — isInstallable naturally stays false there,
 * and the browser's own native "Add to Home Screen" flow is what those
 * users get instead, which is correct, not a gap to work around.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      // Prevent the browser's own default mini-infobar so the app can
      // offer this on its own terms instead (Settings page button, not
      // an unpredictable browser-chosen moment) — this is what makes
      // it "dismissible, not naggy" rather than an unrequested popup.
      event.preventDefault()
      setDeferredEvent(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setDeferredEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function promptInstall() {
    if (!deferredEvent) return

    await deferredEvent.prompt()
    await deferredEvent.userChoice
    // Whether accepted or dismissed, the captured event can only be
    // used once — clear it either way so the button doesn't offer a
    // stale, already-used prompt.
    setDeferredEvent(null)
  }

  return {
    isInstallable: deferredEvent !== null,
    isInstalled,
    promptInstall,
  }
}
