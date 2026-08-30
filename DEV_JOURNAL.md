<div align="center">

# 📖 Aurum Quest — Development Journal

*A chronological record of decisions, incidents, and milestones.*

</div>

<br>

---

## 📌 Milestone Overview

| Phase | Focus | Status |
|---|---|:---:|
| 0 | Environment & Initialization | ✅ |
| 1 | Opening Experience + App Shell + First Dashboard | ✅ |
| 2 | Progression & Local Persistence | ✅ |
| 3 | Backend & Data Architecture | ✅ |
| 4 | Gamification Engine | ✅ |
| 5 | Character System | ✅ |
| 6 | Realm Progression | ⬜ Next |

<br>

---

## Phase 0 — Environment & Initialization

Set up React + TypeScript + Vite, verified `npm run dev`, initialized Git, pushed the first commit to GitHub.

**Result: PASS**

<br>

---

## Phase 1 — Opening Experience + App Shell + First Dashboard

Built the branded entry experience, responsive app shell, navigation (Quests / Legend / Progress / Realm / Settings), player identity card, static quest data with categories/difficulty/XP, quest completion with animated XP feedback, and daily progress tracking.

Tested on both desktop and mobile viewports — no layout issues.

**Result: PASS** · Release `v0.1.0`

<br>

---

## Phase 2 — Progression & Local Persistence

Moved the app from in-memory state to a real local persistence layer.

| Sub-phase | What shipped |
|---|---|
| 2.1 | `usePersistentState` + `storage.ts` — reusable localStorage layer with validation/fallback for corrupted data |
| 2.2 | `date.ts` — GMT-based daily reset, independent of local timezone |
| 2.3 | Quest combo system (`comboCount`, `lastComboAt`), tied to real completion events so reloads can't inflate it |
| 2.4 | Progress-based quests (`progress`/`target`), multi-session quest support |
| 2.5 | XP awarded on completion, combo multiplier applied, level/XP tracked in player state |
| 2.6 | Full integration test: open → load → complete → persist → reload → state survives |

**Result: PASS** · Release `v0.2.0` · Commit `5bb18f3`

<br>

---

## Phase 3 — Backend & Data Architecture

**Goal:** move from single-browser local state to a real, multi-user, Supabase-backed application — without collapsing everything into one file. Target layering: `React UI → Domain Services → Supabase Client → PostgreSQL`.

### What shipped

| Sub-phase | What shipped |
|---|---|
| 3.1 Foundation | `lib/supabase.ts`, env config, verified connection |
| 3.2 Database | 5 tables (`profiles`, `player_state`, `quest_definitions`, `quest_progress`, `daily_state`), RLS enabled on all |
| 3.3 Service Layer | `playerService.ts`, `questService.ts` — pages call services, never query Supabase directly |
| 3.4 Onboarding | New sign-ups get a real onboarding flow (name, avatar, timezone, focus areas) instead of a manually-inserted row |
| 3.5 Authentication | Sign up, sign in, sign out, session persistence — `AuthContext` + `useAuth` |
| 3.5 Data Safety | Fixed a real double-click race condition (below) |
| 3.6 Security | RLS policies scoped per-user, proven correct via the incident below |

### 🔴 Incident 1 — 403 on every table (missing GRANTs)

**Symptom:** every Supabase request returned `403`, across all four tables, immediately after sign-in.

**Cause:** Supabase changed its default behavior for new projects (May 2026) — tables no longer auto-receive `GRANT`s for `anon`/`authenticated`. Our migrations created tables and RLS policies correctly, but RLS never got a chance to evaluate — the request was rejected a layer earlier, at the Postgres grant level.

**Diagnosis:** ruled out URL/key mismatch first, then queried `information_schema.role_table_grants` directly instead of guessing further — showed `authenticated` missing `SELECT`/`INSERT`/`UPDATE` on all 4 tables.

**Fix:** explicit `GRANT` statements added for each table.

**Lesson:** every future table needs an explicit `GRANT` alongside its RLS policy — RLS alone isn't sufficient on a project created after May 2026.

### 🔴 Incident 2 — Duplicate display names blocked onboarding

**Symptom:** a second test account using the same name as an existing one ("Adventurer") failed onboarding with a generic, unhelpful error.

**Cause:** the original migration created the column as `username text not null unique`. When it was later renamed to `name`, Postgres kept the `UNIQUE` constraint — renaming a column doesn't drop its constraints. A display name was silently enforced as globally unique, which was never intended.

**Fix:** dropped the leftover constraint. Also added `toReadableError()` — maps Postgres error codes (`23505` unique violation, `23514` check violation) to plain-language messages instead of raw/generic errors, so future conflicts fail helpfully.

### 🔴 Incident 3 — Duplicate XP from rapid clicks

**Symptom:** moving quest completion to a network call reopened a race Phase 2 had already closed — two fast clicks could both read the same starting progress before either write landed.

**Verified with a script** before fixing: two concurrent calls produced 1 increment instead of 2, confirming the race was real, not theoretical.

**Fix:** a `pendingQuestIds` guard in `QuestsPage.tsx`, checked synchronously before any `await`, so a second click is rejected client-side before a second network call is ever made. Verified the fix with the same reproduction script — race closed, normal sequential clicking unaffected.

### Phase 3 Success Criteria — both proven live, not just coded

```
Sign in → Profile loads → Quests load → Complete quest →
XP updates → Reload → data still exists           ✅ Verified

User A cannot read/write User B's data (RLS)       ✅ Verified
```

**Result: PASS**

<br>

---

## Phase 4 — Gamification Engine

**Goal:** turn quest completion into a real progression loop — deterministic XP/level math, meaningful streaks, a combo system that can't run away from itself, and achievements that recognize real milestones.

### What shipped

| Sub-phase | What shipped |
|---|---|
| 4.1 XP Rules Engine | `lib/xp.ts` — centralizes combo/XP/level math in one pure, testable module instead of scattering it across components |
| 4.2 Level-Up | `LevelUpOverlay.tsx` — full-screen celebratory modal, gold/amber tokens per `UI_GUIDELINE.md` |
| 4.2 Combo Redesign | See Incident 1 below |
| 4.3 Streaks | `calculateStreakUpdate` (`lib/xp.ts`) + `getGmtYesterdayKey` (`lib/date.ts`); `player_state` gained `longest_streak` / `last_streak_date` |
| 4.7 Achievements | Two tables (`achievement_definitions`, `achievement_progress`), 6 seeded achievements, `achievementService.ts`, `AchievementToast.tsx`, `questService.ts` extended with `getLifetimeCompletionCount` |

### 🔴 Incident 1 — Combo multiplier had no ceiling

**Symptom:** the original combo design used a 24-hour rolling window — under ordinary daily use, the multiplier climbed without bound the longer a streak of completions continued.

**Cause:** a rolling 24-hour window doesn't reset per-step, so a day of steady quest completions kept stacking combo credit indefinitely.

**Fix:** redesigned to a 2-hour **per-step resetting** window with a hard 1.5x multiplier cap — matches `GAMEPLAY.md`'s explicit requirement that combo bonuses never dominate normal XP.

### 🟡 Investigated, not a bug — streak test discrepancy

A streak value briefly looked wrong during manual testing after directly editing a row in the Supabase table editor. Investigated thoroughly before assuming a code defect: traced it to stale browser tab state left over from the manual edit, not an actual bug in `calculateStreakUpdate`. Documented here specifically so it isn't re-investigated as if it were new.

### 🟡 Known gap — achievements migration not committed

The `achievement_definitions` / `achievement_progress` tables exist and work in the live Supabase project, but the migration file that created them was never committed to this repo — same root cause as Incident 1 in Phase 5 below. Not re-fixed retroactively; noted here so it isn't mistaken for a Phase 5 problem.

**Result: PASS** · Release `v0.4.0`

<br>

---

## Phase 5 — Character System

**Goal:** answer "who am I, what am I good at, what am I improving" — avatar, persistent character stats tied to real quest completion (not grindable clicks), titles that unlock from level milestones, and a skill list.

### What shipped

| Sub-phase | What shipped |
|---|---|
| 5.1 Avatar | Predefined male/female SVG presets (`AvatarDisplay.tsx`) — deliberately not emoji, which renders inconsistently across devices; wired into `PlayerCard` and `LegendPage` |
| 5.2 Character Stats | `character_stats` table (6 stats), `types/character.ts`, `characterService.ts` |
| 5.3 Stat Mapping | `lib/stats.ts` — pure function mapping each of the app's real 4 quest categories to 2 of 6 stats, gain scaled by difficulty (Easy/Medium/Hard → +1/+2/+3) |
| 5.4 Titles | `lib/titles.ts` — 5-tier, level-gated title ladder, replacing the static unused `profiles.title` column for display purposes |
| 5.5 Skills | `character_skills` table (8 skills), `lib/skills.ts` — category-level mapping (not per-quest; kept simple deliberately, revisitable later) |

Real `LegendPage.tsx` built to replace the Phase-3-era placeholder: avatar, name/title/level, all 6 stats and all 8 skills each with a plain-language "raised by which quest categories" explanation, and a title panel showing the next unlock's level requirement.

### 🔴 Incident 1 — Migration drift: DB ahead of Git

**Symptom:** while scoping 5.2, a search across `supabase/migrations/*.sql` turned up no trace of `avatar_sex`, `focus_categories`, `onboarding_completed_at` (all from Phase 3.4), or `longest_streak` / `last_streak_date` (Phase 4.3) — despite all of them being live and working in the actual Supabase project.

**Cause:** these changes were applied directly to Supabase (dashboard SQL editor or CLI push) without the originating `.sql` file ever being committed and pushed to this repo. Same root cause as the achievements gap noted in Phase 4.

**Impact:** a fresh clone of this repo cannot reproduce the actual live schema — a real risk for disaster recovery or a second developer joining.

**Fix applied going forward, not retroactively:** both new Phase 5 tables (`create_character_stats.sql`, `create_character_skills.sql`) were written, committed, and pushed as real migration files before being run against Supabase, rather than the other way around.

**Lesson:** run migrations from a committed file, not the dashboard directly — commit-then-apply, not apply-then-maybe-commit.

### 🔴 Incident 2 — `avatarSex` collected, never used

**Symptom:** onboarding has asked for and stored `avatar_sex` since Phase 3.4, but nothing ever displayed it — `PlayerCard` showed a hardcoded 🧙 emoji regardless of what the user picked, and the `Player` TypeScript type didn't even have an `avatarSex` field.

**Cause:** `playerService.ts`'s `select()` never requested the `avatar_sex` column in the first place — the gap was one layer below the UI, not in `PlayerCard` itself.

**Fix:** added `avatarSex` to `types/player.ts`, added the column to `playerService.ts`'s query, updated the fallback data in `data/player.ts`, then built `AvatarDisplay.tsx` to actually use it.

### 🟡 Known gap — Work category had zero quests

Discovered while validating the stat mapping: `quest_definitions` had quests for Study, Health, and Personal, but none for Work — meaning the Work-mapped stats (Discipline, Creativity) and skills (Problem Solving, Design) could never actually increase for any real user, independent of any code bug. Fixed via a seed script adding Work-category quests, run once against the live database (not a schema migration).

**Result: PASS** · Release `v0.5.0`

<br>

---

## 🧠 Development Philosophy

```
DEFINE → ARCHITECT → BUILD → TEST → VERIFY → COMMIT → PUSH → EXPAND ↺
```

Small changes. Clear responsibilities. Testable functionality. The app grows by *domain*, not by piling logic into whichever file is open.

<br>

---

## 🔧 Reference Commands

```bash
npm install && npm run dev      # local dev
npm run build && npm run lint   # before every commit
git status && git diff --check  # sanity check before staging
git add . && git commit -m "..." && git push
```

<br>

---

## 🔮 Future Phases (not yet started)

Realm progression · Progress analytics · Audio/PWA · AI companion · Public beta

Also open: a per-quest skill mapping (Phase 5.5 currently maps skills at the category level, deliberately kept simple — revisit after initial ship if more granularity is wanted).

Designed only when their requirements become concrete — tracked in the project's separate planning docs, not in this repo.