<div align="center">

# ⚔️ AURUM QUEST

### ✦ Turn your real-life goals into quests. Earn XP. Build your legend.

A **gamified personal productivity application** — real-world actions become quests, quests earn XP, XP builds a persistent character and world.

[![Version](https://img.shields.io/badge/version-v0.9.0-8A2BE2?style=for-the-badge)](#-versioning)
[![Phase](https://img.shields.io/badge/phase-10%20in%20progress-4B0082?style=for-the-badge)](#-development-roadmap)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=for-the-badge)](LICENSE)
[![Built with React](https://img.shields.io/badge/built%20with-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=white)](#-tech-stack)

</div>

<br>

---

## 🌟 Current Status

| | |
|---|---|
| **Version** | `v0.9.0` |
| **Phase** | 10 — Public Beta *(in progress)* |
| **Next** | Quality pass, then production deployment |

```
   OPEN → SIGN IN → TODAY'S QUESTS → COMPLETE QUEST →
   EARN XP, STATS, SKILLS, RANK → REVIEW YOUR WEEK → BUILD YOUR LEGEND
```

Aurum Quest is a **real multi-user app** — accounts, cloud-synced progress, row-level-secured data, a full XP/level/streak/achievement/rank engine, a persistent character with stats/skills/titles, a realm that visibly grows with lifetime progress, weekly reporting that turns history into an actual next step, an AI companion that suggests a daily strategy and a weekly reflection (never touching your XP or quests without your approval), and it's installable, with sound, and works offline.

<br>

---

## ✨ What You Can Do

<table>
<tr>
<td width="16%" valign="top">

### 🔐 Your Account
- Sign up / sign in / sign out
- Session persists across visits
- Guided onboarding for new players
- Your data, and only yours (RLS)

</td>
<td width="16%" valign="top">

### ⚔️ Quests
- Daily quests by category
- Single & multi-session quests
- Combo multiplier, capped at 1.5x
- Daily rank (S–F), reflects real effort
- Duplicate-click safe — no double XP

</td>
<td width="16%" valign="top">

### 📈 Progress
- Daily & weekly views, one page
- Weekly report — score, wins, weaknesses, next focus
- Personal records & optional journal note

</td>
<td width="16%" valign="top">

### 🧙 Legend
- Avatar, current title, level
- 6 character stats, 8 skills
- Every gain traces to a real quest — nothing is grindable through empty clicks

</td>
<td width="16%" valign="top">

### 🏰 Realm
- 7-tier world, keyed off lifetime XP
- Unlock ceremony on reaching a new tier
- Progress-to-next-tier always visible

</td>
<td width="20%" valign="top">

### 🔊 Sound & Install
- Reward sounds — quest, level-up, achievement, realm unlock
- Global mute + volume, remembered per device
- Installable — real app icon, works offline

</td>
</tr>
</table>

<br>

---

## 🧩 Tech Stack

| | |
|---|---|
| ⚛️ **React + TypeScript** | UI, type-safe |
| ⚡ **Vite** | Build tooling |
| 🎨 **Tailwind CSS** | Styling |
| ✨ **Motion** | Animation |
| 🟢 **Supabase** | Auth + PostgreSQL + RLS |
| 🌿 **Git / GitHub** | Version control |

<br>

---

## 🏗️ Architecture

```
React UI  →  Domain Services  →  Supabase Client  →  PostgreSQL
```

Pages never query Supabase directly — they call a service (`playerService`, `questService`, `onboardingService`, `characterService`, `skillService`, `achievementService`, `realmService`, `rankService`, `progressService`), which keeps the backend swappable and page components small. Game-math logic (XP/level/combo/streak, stat mapping, skill mapping, title ladder, realm tiers, daily rank, progress aggregation) lives in pure, dependency-free `lib/` modules — no Supabase calls, no React — so the rules themselves are directly testable. Sound settings are the one deliberate exception to the Supabase-service pattern: `SoundContext`/`useSound` reads and writes `localStorage` directly, since it's a device preference, not account data.

```
src/
├── components/   UI
├── pages/        Page composition
├── hooks/        React state (useAuth, usePersistentState)
├── services/     Domain operations ← Supabase lives here
├── context/       Auth session
├── lib/          Infrastructure + pure game logic (date, storage, supabase client, xp, stats, skills, titles)
└── types/        Shared contracts
```

<br>

---

## 🚀 Running Locally

```bash
git clone https://github.com/Yogesh-Dhakal34/Aurum-Quest.git
cd Aurum-Quest
npm install
```

Add a `.env.local` with your Supabase project's URL + publishable key, then:

```bash
npm run dev      # local dev server
npm run build    # production build
npm run lint     # code quality check
```

<br>

---

## 🗺️ Development Roadmap

> Establish a reliable foundation before increasing complexity — not build the whole vision at once.

| Phase | Status | Release |
|---|:---:|---|
| 0 — Environment & Initialization | ✅ | — |
| 1 — Opening Experience + App Shell | ✅ | `v0.1.0` |
| 2 — Progression & Local Persistence | ✅ | `v0.2.0` |
| 3 — Backend & Data Architecture | ✅ | `v0.3.0` |
| 4 — Gamification Engine | ✅ | `v0.4.0` |
| 5 — Character System | ✅ | `v0.5.0` |
| **6 — Realm Progression** | ✅ | `v0.6.0` |
| **7 — Progress Intelligence** | ✅ | `v0.7.0` |
| **8 — Audio, Atmosphere & PWA** | ✅ | `v0.8.0` |
| **9 — AI Companion** | ✅ | `v0.9.0` |
| **10 — Public Beta** | 🚧 In Progress | `v1.0.0` (pending) |

*(Full phase-by-phase planning docs are maintained separately, outside this repo.)*

<details>
<summary><strong>What Phase 4 actually delivered</strong></summary>

<br>

- Centralized, pure XP/level/combo/streak math (`lib/xp.ts`)
- Level-up overlay with celebratory full-screen treatment
- Combo system redesigned to a 2-hour resetting window with a 1.5x cap, after the original 24-hour rolling window proved unbounded
- Real streak tracking — current + longest streak, GMT-anchored
- 6 starting achievements, unlocked from real milestones, with toast notifications
- See [`DEV_JOURNAL.md`](DEV_JOURNAL.md) for the full incident writeup

</details>

<details>
<summary><strong>What Phase 5 actually delivered</strong></summary>

<br>

- Avatar selection — predefined male/female SVG presets, consistent across devices (no emoji rendering variance)
- 6 character stats, persisted per user, gained only through matching quest completions
- Category → stat mapping, difficulty-scaled gains (Easy/Medium/Hard → +1/+2/+3)
- 5-tier, level-gated title ladder (Novice Adventurer → Aurum Vanguard)
- 8-skill system, category-mapped
- Real `LegendPage` — avatar, title, level, all stats and skills each with a plain-language explanation of what raises them
- 2 real bugs found and fixed (an `avatarSex` field collected at onboarding but never displayed; a DB-vs-Git migration drift affecting several earlier tables) — see [`DEV_JOURNAL.md`](DEV_JOURNAL.md)

</details>

<details>
<summary><strong>What Phase 6 actually delivered</strong></summary>

<br>

- 7-tier realm (Campfire → Sky Citadel), keyed off lifetime XP — real map, current building, world backdrop
- Unlock ceremony shown immediately on tier crossing, sequenced after a level-up overlay if both fire from the same completion, with a safety-net check on the Realm page in case it's ever missed
- Progress-to-next-tier bar, always visible without navigating elsewhere
- 6.3 (Construction Choices) and 6.5 (World State) deliberately deferred — both explicitly Stretch in the spec, and both need a game-mechanics decision that isn't specified yet
- A pre-existing XP-bar display bug (found while scoping this phase, unrelated to Realm itself) fixed in the same pass
- The root cause behind 3 separate "missing row" bugs across Phases 5–6 fixed once, generally — `character_stats`, `character_skills`, and `realm_state` all now self-heal a default row on first read instead of needing a manual SQL backfill — see [`DEV_JOURNAL.md`](DEV_JOURNAL.md)

</details>

<details>
<summary><strong>What Phase 7 actually delivered</strong></summary>

<br>

- Daily rank (S–F) — Phase 4.5, built retroactively since Phase 7's personal records needed it to exist. Formula confirmed with the product owner before implementation, per `GAMEPLAY.md`'s own instruction
- Daily view — XP, completions, completion rate, today's rank
- Weekly view — total XP, average completion, most-consistent/neglected category, day-by-day rank list
- Weekly Report — score, wins, weaknesses, a computed next-week focus, and an optional journal note you can save
- Personal records — longest streak, most XP in a day, rank frequency, shown as an all-time view
- Found `daily_state` (the table the roadmap said would feed this phase) is dead code — never read or written anywhere. Built on `quest_progress` instead, which is real and already retains full history — see [`DEV_JOURNAL.md`](DEV_JOURNAL.md)
- Monthly trends, charts, and a streak heatmap deliberately deferred — Stretch tier, and the spec itself says not to build monthly trends without a real month of usage data yet

</details>

<details>
<summary><strong>What Phase 8 actually delivered</strong></summary>

<br>

- 4 reward sounds — quest-claim/XP, level-up, achievement, realm-unlock — synthesized live via the Web Audio API, no external audio files
- Global sound mute + volume control in Settings, stored on-device rather than synced to your account (on at home, off at work — a real preference, not identity data)
- Real PWA install: proper manifest, service worker, app icons generated from the existing brand mark, and an offline shell that survives a reload with no connection
- Explicit-confirm update flow — never a silent forced reload while you're using the app
- A full dependency-security audit run after adding the PWA tooling — 454 packages checked, 0 vulnerabilities, and two npm packages found actively impersonating a legitimate PWA library elsewhere in the ecosystem (correctly avoided)
- Route-based code-splitting was tried as a performance improvement, measured to make things *worse* on this project's exact toolchain (a known, open upstream bundler issue), and reverted rather than shipped — see [`DEV_JOURNAL.md`](DEV_JOURNAL.md)
- A real toggle-switch rendering bug found and fixed during manual testing, verified with an actual rendered screenshot rather than reasoning about the CSS alone

</details>

<details>
<summary><strong>What Phase 9 actually delivered</strong></summary>

<br>

- Daily Strategy — on the Quests page, an AI-generated suggestion prioritizing 1-3 unfinished quests, generated from that day's real quest list, once per day
- Weekly Reflection — on the Progress page's weekly view, a 7-day summary plus one reflection question, once per 7 days
- Every suggestion requires explicit approve/dismiss — the AI can never award XP, mark work complete, rewrite history, or silently create quests, enforced structurally (no client insert path into the suggestions table at all, not just a UI convention)
- Reasoning shown on demand ("Why this suggestion?") rather than always-on, keeping the card compact
- Server-side only — the API key never reaches the browser; calls go through a Supabase Edge Function using Google's Gemini free tier (Anthropic's API has no ongoing free tier, only a one-time trial credit — see `DEV_JOURNAL.md`)
- 3 real incidents during live smoke testing, all found and fixed before shipping: two separate missing-`service_role`-grant permission errors, and a missing-CORS bug where a curl test passed but the actual browser call silently failed — see `DEV_JOURNAL.md` for the full writeup
- Stretch tier (approval-gated quest suggestions, optional goal breakdown) deliberately not built this pass — treated as a genuine follow-up, not a blocker

</details>

<details>
<summary><strong>What Phase 10 has delivered so far (in progress — not a phase close-out)</strong></summary>

<br>

Deployment is intentionally on hold until the app is further along, so this is a progress snapshot, not a finished phase:

- Help/FAQ and Privacy pages, both readable before signing up (not just after login), with an explicit, honest disclosure that Gemini's free tier — unlike Anthropic's — permits Google to use submitted content to improve their products
- Terms & Conditions plus a required, versioned consent checkbox on sign-up — versioned so a future policy rewrite can require fresh consent instead of quietly keeping an old "yes"
- Full data control in Settings: JSON export, a human-readable Summary page (with Print/Save-as-PDF), atomic progress reset, and permanent account deletion
- A new Profile page — avatar (now 4 styles, up from 2), birthday, first-joined date, level — kept separate from the existing narrative Legend page on purpose
- Three real UI bugs found through actual use and fixed: header/sidebar scrolling away with page content, an intro animation replaying on every reload with two buttons that did the same thing, and six pages left-anchored with dead space on one side instead of centered
- Revived the rarity system specified back in Phase 1 but never actually built (Common/Rare/Epic/Legendary, decoupled from difficulty) — now paused mid-expansion in favor of a bigger quest/reward system redesign under active research (see `DEV_JOURNAL.md`)

</details>

<br>

---

## 🔮 Future Direction

```
     QUESTS · PROGRESS · ACHIEVEMENTS · CHARACTER · REALM
                      │
              PROGRESS INTELLIGENCE ✅
                      │
           AUDIO · PWA · OFFLINE ✅
                      │
                AI COMPANION ✅
                      │
              PUBLIC BETA 🚧 IN PROGRESS
```

Deployment is deliberately on hold — the bone structure is done, and the priority now is the quality pass (bug hunt, responsive/mobile QA, accessibility review, loading/error/empty-state audit) before a public URL exists at all. Once that and production deployment land, remaining Phase 10 work is documentation for outside readers, the portfolio package (live demo, screenshots, dev story), and the beta test itself.

A bigger shift is also under active research: moving from today's shared, hand-authored quest catalog toward quests generated uniquely per user, scaffolded by a small fixed taxonomy of quest types — direction not yet settled, deliberately paused rather than built on a foundation about to change.

Open items needing a product decision beyond Phase 10: a more granular per-quest skill mapping (beyond Phase 5.5's category-level version), Realm's construction choices (6.3) and dynamic world state (6.5), a full next-week planning/goal-tracking flow beyond Phase 7's computed suggestion, and Phase 9's stretch tier (approval-gated quest suggestions, optional goal breakdown). A dedicated UI/design-token pass (implementing `UI_GUIDELINE.md`'s actual violet/gold system, currently unimplemented in favor of the ad-hoc palette used since Phase 1) is also on the radar, timing not yet decided. Also worth a look: `daily_state` was found dead/unused during Phase 7 and may be worth dropping in a cleanup pass, route-based code-splitting can be revisited once a known upstream Vite/Rolldown bundler issue is resolved, and `ARCHITECTURE.md`'s note that AI logic lives in `src/ai/` needs correcting to reflect its actual home in `supabase/functions/ai-companion/`.

<br>

---

## 🧠 Development Philosophy

```
DEFINE → ARCHITECT → BUILD → TEST → VERIFY → COMMIT → PUSH → EXPAND ↺
```

Small changes, clear responsibilities, testable functionality. The app grows by *domain* — components, hooks, services, libs, types — not by piling logic into whichever file is open.

<br>

---

## 📖 More Documentation

| Doc | Covers |
|---|---|
| [`DEV_JOURNAL.md`](DEV_JOURNAL.md) | Decisions, incidents, test results |

Product/roadmap/architecture planning docs (PRD, roadmap, gameplay rules, data model) are maintained separately from this repo.

<br>

---

<div align="center">

### ⚔️ Aurum Quest

A personal productivity RPG built with React, TypeScript, and Supabase.

**Developed by [Yogesh Dhakal](https://github.com/Yogesh-Dhakal34)**

✦ *Your goals are the quests. Your actions are the XP. Your progress builds the legend.* ✦

</div>