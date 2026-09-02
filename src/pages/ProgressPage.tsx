import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getPlayer } from '../services/playerService'
import {
  getDailyBreakdown,
  getWeeklyProgress,
  getPersonalRecords,
  getWeeklyJournalNote,
  saveWeeklyJournalNote,
} from '../services/progressService'
import { getGmtDateKey } from '../lib/date'
import RankBadge from '../components/RankBadge'
import type { DailyBreakdown, WeeklyStats, WeeklyReport, PersonalRecords } from '../lib/progress'
import type { DailyRank } from '../lib/rank'

type ViewMode = 'daily' | 'weekly'

const RANK_ORDER: DailyRank[] = ['S', 'A', 'B', 'C', 'D', 'F']

function ProgressPage() {
  const { user } = useAuth()
  const [view, setView] = useState<ViewMode>('daily')

  const [today, setToday] = useState<DailyBreakdown | null>(null)
  const [weekStartKey, setWeekStartKey] = useState<string | null>(null)
  const [weekDays, setWeekDays] = useState<DailyBreakdown[]>([])
  const [weekStats, setWeekStats] = useState<WeeklyStats | null>(null)
  const [weekReport, setWeekReport] = useState<WeeklyReport | null>(null)
  const [records, setRecords] = useState<PersonalRecords | null>(null)

  const [journalNote, setJournalNote] = useState('')
  const [journalDraft, setJournalDraft] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const currentUser = user
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const player = await getPlayer(currentUser.id)
        if (!player) {
          if (!cancelled) {
            setLoadError('No player profile found.')
          }
          return
        }

        const [todayBreakdown, weekly, personalRecords] = await Promise.all([
          getDailyBreakdown(currentUser.id, getGmtDateKey()),
          getWeeklyProgress(currentUser.id),
          getPersonalRecords(currentUser.id, player.longestStreak),
        ])

        if (cancelled) return

        setToday(todayBreakdown)
        setWeekStartKey(weekly.weekStartKey)
        setWeekDays(weekly.days)
        setWeekStats(weekly.stats)
        setWeekReport(weekly.report)
        setRecords(personalRecords)

        const note = await getWeeklyJournalNote(currentUser.id, weekly.weekStartKey)
        if (cancelled) return
        setJournalNote(note)
        setJournalDraft(note)
      } catch (error) {
        if (cancelled) return
        setLoadError(
          error instanceof Error ? error.message : 'Failed to load your progress.',
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user])

  async function handleSaveNote() {
    if (!user || !weekStartKey) return

    setIsSavingNote(true)
    try {
      await saveWeeklyJournalNote(user.id, weekStartKey, journalDraft)
      setJournalNote(journalDraft)
    } catch {
      // Non-fatal — the draft stays in the textarea either way, so
      // nothing the player typed is lost even if the save fails.
    } finally {
      setIsSavingNote(false)
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl">
        <p className="text-slate-400">Loading your progress...</p>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="mx-auto max-w-4xl">
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {loadError}
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl">
      <p className="text-sm text-cyan-400">Aurum Quest</p>
      <h2 className="mt-1 text-3xl font-bold">Progress</h2>
      <p className="mt-2 text-slate-400">
        Your history, turned into something you can actually act on.
      </p>

      {/* Switchable view, not separate pages, per UI_GUIDELINE.md */}
      <div className="mt-6 inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
        {(['daily', 'weekly'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setView(mode)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              view === mode
                ? 'bg-cyan-400/10 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {view === 'daily' && (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          {!today || today.questsCompleted === 0 ? (
            <p className="text-sm text-slate-400">
              No completions recorded for today yet.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">XP Earned</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-400">{today.xpEarned}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Completed</p>
                  <p className="mt-1 text-2xl font-bold">{today.questsCompleted}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Completion</p>
                  <p className="mt-1 text-2xl font-bold">{Math.round(today.completionRate)}%</p>
                </div>
              </div>
              <div className="mt-5 border-t border-slate-800 pt-4">
                <RankBadge rank={today.rank.rank} reason={today.rank.reason} />
              </div>
            </>
          )}
        </div>
      )}

      {view === 'weekly' && weekStats && weekReport && (
        <div className="mt-6 space-y-6">
          {/* Weekly stats */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Total XP (7 days)</p>
                <p className="mt-1 text-2xl font-bold text-cyan-400">{weekStats.totalXp}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Avg. Completion</p>
                <p className="mt-1 text-2xl font-bold">
                  {Math.round(weekStats.averageDailyCompletion)}%
                </p>
              </div>
            </div>
            {weekStats.topCategory && (
              <p className="mt-4 text-sm text-slate-400">
                Most consistent: <span className="text-slate-200">{weekStats.topCategory}</span>
                {weekStats.neglectedCategory && (
                  <> · Neglected: <span className="text-slate-200">{weekStats.neglectedCategory}</span></>
                )}
              </p>
            )}
          </div>

          {/* Day-by-day mini list */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-sm font-semibold text-slate-200">Last 7 Days</h3>
            <div className="mt-3 space-y-2">
              {weekDays.map((day) => (
                <div key={day.dateKey} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{day.dateKey}</span>
                  <span className="text-slate-300">{Math.round(day.completionRate)}%</span>
                  <span className="font-medium text-cyan-400">{day.rank.rank}</span>
                </div>
              ))}
              {weekDays.length === 0 && (
                <p className="text-sm text-slate-500">No activity recorded this week yet.</p>
              )}
            </div>
          </div>

          {/* Weekly report: Score / Wins / Weaknesses / Next-week focus */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Weekly Report</h3>
              <span className="text-lg font-bold text-cyan-400">
                {Math.round(weekReport.score)} / 130
              </span>
            </div>

            {weekReport.wins.length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Wins</p>
                <ul className="mt-1 space-y-1 text-sm text-slate-300">
                  {weekReport.wins.map((win) => (
                    <li key={win}>· {win}</li>
                  ))}
                </ul>
              </div>
            )}

            {weekReport.weaknesses.length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Weaknesses</p>
                <ul className="mt-1 space-y-1 text-sm text-slate-300">
                  {weekReport.weaknesses.map((weakness) => (
                    <li key={weakness}>· {weakness}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-sm text-cyan-300">
              {weekReport.nextWeekFocus}
            </p>

            {/* Optional journal note — the one genuinely persisted piece of this phase */}
            <div className="mt-5 border-t border-slate-800 pt-4">
              <label htmlFor="journal-note" className="text-xs uppercase tracking-wide text-slate-500">
                Journal note (optional)
              </label>
              <textarea
                id="journal-note"
                value={journalDraft}
                onChange={(e) => setJournalDraft(e.target.value)}
                placeholder="Any reflections on this week..."
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-400/40 focus:outline-none"
              />
              <button
                onClick={handleSaveNote}
                disabled={isSavingNote || journalDraft === journalNote}
                className="mt-2 rounded-lg bg-cyan-400/10 px-4 py-1.5 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSavingNote ? 'Saving...' : 'Save note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal records — shown regardless of daily/weekly toggle, it's an all-time view */}
      {records && (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-sm font-semibold text-slate-200">Personal Records</h3>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Longest Streak</p>
              <p className="mt-1 text-xl font-bold text-cyan-400">{records.longestStreak} days</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Most XP in a Day</p>
              <p className="mt-1 text-xl font-bold">{records.mostXpInDay}</p>
              {records.mostXpInDayDate && (
                <p className="text-xs text-slate-500">{records.mostXpInDayDate}</p>
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Rank Frequency</p>
            <div className="mt-2 flex gap-3">
              {RANK_ORDER.map((rank) => (
                <div key={rank} className="text-center">
                  <p className="text-lg font-bold text-cyan-400">{records.rankFrequency[rank]}</p>
                  <p className="text-xs text-slate-500">{rank}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProgressPage
