import type { View } from '../types/view'

type PrivacyPageProps = {
  onNavigate: (view: View) => void
}

function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <section>
      <button
        type="button"
        onClick={() => onNavigate('settings')}
        className="text-sm text-slate-500 hover:text-slate-300"
      >
        &larr; Back to Settings
      </button>

      <p className="mt-4 text-sm text-cyan-400">Aurum Quest</p>
      <h2 className="mt-1 text-3xl font-bold">Privacy</h2>
      <p className="mt-2 text-slate-400">
        A plain-language summary of what's collected and why. This is a personal/portfolio
        project, not a company with a legal team, so this is a straightforward account of the
        actual data handling rather than a formal legal document.
      </p>

      <div className="mt-6 max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">What's collected</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
            <li>Your email address, for sign-in</li>
            <li>Quest completions, XP, character stats/skills, streaks, ranks, and Realm progress</li>
            <li>An optional weekly journal note, if you choose to write one</li>
            <li>AI companion suggestions and whether you approved or dismissed them</li>
            <li>Sound and app-install preferences (kept on your device only, not synced)</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Where it's stored</h3>
          <p className="mt-2 text-sm text-slate-400">
            In a Supabase-hosted database. Row-level security is enforced on every table, meaning
            the database itself refuses any request for your data that isn't authenticated as you
            — this isn't just an app-level convention, it's enforced at the database layer.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">The AI companion, specifically</h3>
          <p className="mt-2 text-sm text-slate-400">
            When you generate a Daily Strategy or Weekly Reflection, your unfinished quest titles,
            categories, and completion counts for the relevant period are sent to Google's Gemini
            API to generate the suggestion. Your email and login credentials are never included in
            that request.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            <strong className="text-slate-300">Worth knowing:</strong> this app uses Gemini's free
            API tier. On Google's paid tiers, prompts aren't used to improve their products; on the
            free tier, Google's terms permit using submitted content to improve their products, and
            human reviewers may see it. If you'd rather not have a quest title reviewed under that
            policy, avoid including sensitive personal details in quest names — keep them
            task-focused (e.g. "Study session" rather than something more personal).
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Your data, your control</h3>
          <p className="mt-2 text-sm text-slate-400">
            Export or reset your data from Settings. Account deletion removes your data
            from the database; it doesn't retroactively un-send anything already sent to Gemini
            for a suggestion you'd already generated before deleting.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Questions</h3>
          <p className="mt-2 text-sm text-slate-400">
            <a
              href="mailto:dhakalyogesh854@gmail.com?subject=Aurum%20Quest%20privacy%20question"
              className="text-cyan-400 underline"
            >
              Email directly
            </a>{' '}
            with anything not covered here.
          </p>
        </div>
      </div>
    </section>
  )
}

export default PrivacyPage