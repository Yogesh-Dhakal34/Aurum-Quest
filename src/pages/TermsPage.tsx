type TermsPageProps = {
  onNavigate: () => void
  backLabel?: string
}

function TermsPage({ onNavigate, backLabel = 'Back to Settings' }: TermsPageProps) {
  return (
    <section>
      <button
        type="button"
        onClick={onNavigate}
        className="text-sm text-slate-500 hover:text-slate-300"
      >
        &larr; {backLabel}
      </button>

      <p className="mt-4 text-sm text-cyan-400">Aurum Quest</p>
      <h2 className="mt-1 text-3xl font-bold">Terms &amp; Conditions</h2>
      <p className="mt-2 text-slate-400">
        A plain-language account of the actual terms, not a formal legal document — this is a
        personal/portfolio project, not a company with a legal team.
      </p>

      <div className="mt-6 max-w-2xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">This is a beta</h3>
          <p className="mt-2 text-sm text-slate-400">
            Aurum Quest is provided as-is, during an active beta. Features may change, break, or
            be removed without notice. Your progress data may occasionally need to be reset or
            migrated as the underlying schema changes — I'll try to avoid this, but during beta
            it's a real possibility, not a hypothetical.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">No warranty</h3>
          <p className="mt-2 text-sm text-slate-400">
            The app is offered without any warranty of accuracy, availability, or fitness for a
            particular purpose. Nothing here should be relied on for anything high-stakes — it's a
            productivity/gamification tool, not a substitute for professional planning, medical,
            or mental health advice.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Acceptable use</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
            <li>Don't attempt to abuse, scrape, or overload the app or its AI companion</li>
            <li>Don't attempt to bypass rate limits or access other users' data</li>
            <li>Don't use quest titles or the weekly journal to submit abusive or illegal content</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Account termination</h3>
          <p className="mt-2 text-sm text-slate-400">
            You can delete your own account any time from Settings — this is permanent and
            immediate. I also reserve the right to suspend or remove accounts that violate the
            acceptable-use terms above.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Changes to these terms</h3>
          <p className="mt-2 text-sm text-slate-400">
            If these terms or the Privacy page change in a way that matters, I'll ask for renewed
            consent rather than silently treat an old agreement as covering something new.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Questions</h3>
          <p className="mt-2 text-sm text-slate-400">
            <a
              href="mailto:dhakalyogesh854@gmail.com?subject=Aurum%20Quest%20terms%20question"
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

export default TermsPage