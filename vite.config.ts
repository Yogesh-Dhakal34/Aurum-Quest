import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Phase 8: PWA — installable app + a responsive offline shell.
    // registerType 'prompt' (not 'autoUpdate'): a background update
    // silently replacing the app mid-session can surface as confusing
    // stale-state bugs; the app instead surfaces an explicit "update
    // available" prompt (see hooks/usePwaUpdate.ts) so the player
    // controls when a reload happens, never losing in-progress state
    // to a surprise swap.
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Aurum Quest',
        short_name: 'Aurum Quest',
        description:
          'Turn your real-life goals into quests. Earn XP. Build your legend.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the built app shell (JS/CSS/HTML) so the app can
        // open offline at all — "responsive offline shell" per
        // ROADMAP.md, not full offline data sync (quest completion
        // still needs a real connection to Supabase; this only
        // guarantees the shell itself loads and shows a clear
        // offline state instead of a blank white screen).
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Never cache Supabase API calls — offline should show a
        // clear "you're offline" state (see useOnlineStatus.ts), not
        // silently serve stale cached data as if it were live.
        navigateFallbackDenylist: [/^\/api/, /supabase\.co/],
      },
      devOptions: {
        // Service worker disabled in dev — avoids the classic
        // "cached dev build won't update" confusion while iterating.
        enabled: false,
      },
    }),
  ],
})