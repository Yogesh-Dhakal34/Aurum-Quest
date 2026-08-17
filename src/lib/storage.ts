/**
 * Minimal localStorage persistence utility.
 *
 * Scope (Phase 2.1): a small, reusable read/write layer for JSON-serializable
 * state. No backend, no IndexedDB, no cookies — localStorage only.
 *
 * Every read/write is wrapped in try/catch because localStorage can throw
 * (private browsing, quota exceeded, disabled storage) or contain corrupted/
 * hand-edited JSON. On any failure this utility falls back to the caller's
 * provided default rather than crashing the app.
 */

const STORAGE_PREFIX = 'aurum-quest'

function buildKey(key: string): string {
  return `${STORAGE_PREFIX}:${key}`
}

function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

/**
 * Load a value from localStorage.
 *
 * @param key       Unprefixed storage key (e.g. "player", "quests").
 * @param fallback  Value to return if nothing is stored, storage is
 *                  unavailable, the JSON is corrupted, or the value fails
 *                  the optional `isValid` shape check.
 * @param isValid   Optional type guard. If provided and the parsed value
 *                  doesn't pass it, `fallback` is returned instead — this is
 *                  what stops a corrupted/hand-edited localStorage entry
 *                  from crashing the app on load.
 */
export function loadFromStorage<T>(
  key: string,
  fallback: T,
  isValid?: (value: unknown) => value is T,
): T {
  if (!isStorageAvailable()) {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(buildKey(key))

    if (raw === null) {
      return fallback
    }

    const parsed: unknown = JSON.parse(raw)

    if (isValid && !isValid(parsed)) {
      return fallback
    }

    return parsed as T
  } catch {
    return fallback
  }
}

/**
 * Save a value to localStorage. Fails silently (app keeps working in-memory
 * for the current session) if storage is unavailable or the write throws.
 */
export function saveToStorage<T>(key: string, value: T): void {
  if (!isStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(buildKey(key), JSON.stringify(value))
  } catch {
    // Intentionally silent: quota exceeded / private mode / storage disabled
    // should degrade to in-memory state, not break the UI.
  }
}