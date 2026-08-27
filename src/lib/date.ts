export function getGmtDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Phase 4.3 — the GMT date_key for the day before the given date.
 * Needed to determine whether a streak continues (last completion was
 * yesterday) or breaks (last completion was any day before that).
 */
export function getGmtYesterdayKey(date = new Date()): string {
  const yesterday = new Date(date)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  return getGmtDateKey(yesterday)
}