import { useState } from 'react'
import type { View } from '../types/view'

type FaqItem = {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is Aurum Quest?',
    answer:
      "A gamified productivity app. Real things you do — study, exercise, chores, work — become quests. Completing them earns XP, which levels up your character, grows your Realm, and raises your character stats and skills. Nothing is grindable through empty clicks: every gain traces back to a real quest you actually completed.",
  },
  {
    question: 'How does XP and leveling work?',
    answer:
      'Each quest has a difficulty (Easy/Medium/Hard) that sets its XP reward. XP accumulates toward your level — higher levels unlock new titles on your Legend page. A short combo multiplier (up to 1.5x) rewards completing several quests in quick succession, resetting after 2 hours of inactivity so it never grows unbounded.',
  },
  {
    question: 'What is my daily rank (S through F)?',
    answer:
      "A same-day score based on how much of your day's quest list you actually completed, shown on the Quests page. It resets each day — yesterday's rank doesn't carry over, so every day is a fresh chance at an S.",
  },
  {
    question: "What's the Realm?",
    answer:
      'A visual representation of your lifetime progress — 7 tiers from a small Campfire up to a Sky Citadel, unlocked by total XP earned. Check the Realm page any time to see your current tier and how much further to the next one.',
  },
  {
    question: 'What can the AI companion actually do?',
    answer:
      "It generates a Daily Strategy suggestion (which unfinished quests to prioritize) and a Weekly Reflection (a summary of your week plus one reflection question). That's it. It cannot award XP, mark anything complete, rewrite your history, or create quests on its own — every suggestion needs your explicit approval or dismissal, and even approving one only acknowledges it, it never touches your quest or XP data directly.",
  },
  {
    question: 'Why does my Daily Strategy or Weekly Reflection say I already have one?',
    answer:
      "Daily Strategy generates once per day; Weekly Reflection once every 7 days. This is intentional, not a bug — it keeps the feature sustainable on a free API tier. Dismissing an existing suggestion doesn't unlock a new one early; check back tomorrow (or next week) instead.",
  },
  {
    question: 'Does my progress sync across devices?',
    answer:
      "Yes — your account data (quests, XP, character, streaks) is stored in the cloud and tied to your login, not your device. Sound and install preferences are the only things kept local to each device, since those are genuinely per-device choices rather than account data.",
  },
  {
    question: 'Does the app work offline?',
    answer:
      "The installed app opens and shows your last-loaded data without a connection, but completing quests, syncing progress, and generating AI suggestions all require internet access. Anything you do offline won't be saved until you're back online.",
  },
  {
    question: "I'm having trouble signing in — what should I check?",
    answer:
      'Double check the email and password are correct and that you\'re using the same sign-in method you originally signed up with. If you\'re confident your credentials are right and it still fails, use the feedback option below to report it — include what you tried and any error message shown.',
  },
]

type HelpPageProps = {
  onNavigate: (view: View) => void
}

function HelpPage({ onNavigate }: HelpPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => onNavigate('settings')}
        className="text-sm text-slate-500 hover:text-slate-300"
      >
        &larr; Back to Settings
      </button>

      <p className="mt-4 text-sm text-cyan-400">Aurum Quest</p>
      <h2 className="mt-1 text-3xl font-bold">Help &amp; FAQ</h2>
      <p className="mt-2 text-slate-400">
        Common questions about how Aurum Quest works.
      </p>

      <div className="mt-6 max-w-2xl space-y-2">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={item.question}
              className="rounded-xl border border-slate-800 bg-slate-900/60"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-white">{item.question}</span>
                <span className="ml-3 shrink-0 text-slate-500">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-sm text-slate-400">{item.answer}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 max-w-2xl rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Still stuck?</p>
        <p className="mt-2 text-sm text-slate-400">
          Something not covered here, or found a bug?{' '}
          <a
            href="mailto:dhakalyogesh854@gmail.com?subject=Aurum%20Quest%20feedback"
            className="text-cyan-400 underline"
          >
            Send feedback
          </a>
          .
        </p>
      </div>
    </section>
  )
}

export default HelpPage