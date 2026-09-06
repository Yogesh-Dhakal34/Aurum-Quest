import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Wraps vite-plugin-pwa's React registration hook. registerType is
 * 'prompt' (vite.config.ts), so a new service worker installs in the
 * background but does NOT take over automatically — needRefresh only
 * flips true once a new version is ready, and nothing reloads the page
 * until the player explicitly confirms via updateApp(). This matters
 * because a silent auto-reload mid-session could interrupt someone
 * partway through completing a quest.
 */
export function usePwaUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Check for an update roughly every 30 minutes for anyone who
      // keeps the tab open a long time, rather than only on full page
      // load — matches how most PWA setups behave, without being
      // aggressive about it.
      if (!registration) return
      setInterval(
        () => {
          void registration.update()
        },
        30 * 60 * 1000,
      )
    },
  })

  function updateApp() {
    void updateServiceWorker(true)
  }

  function dismiss() {
    setNeedRefresh(false)
  }

  return { needRefresh, updateApp, dismiss }
}
