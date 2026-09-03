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
| 6 | Realm Progression | ✅ |
| 7 | Progress Intelligence | ✅ |
| 8 | Audio, Atmosphere & PWA | ⬜ Next |

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

## Phase 6 — Realm Progression

**Goal:** make consistency visible — a personal world that grows in visible, discrete steps as lifetime XP accumulates, so a player can look at it for five seconds and understand roughly how far they've come.

### What shipped

| Sub-phase | What shipped |
|---|---|
| 6.1 Realm Map | `lib/realm.ts` — pure 7-tier data (Campfire → Sky Citadel) keyed off lifetime XP, `getCurrentTier`/`getNextTier`/`getRealmProgress`; real `RealmPage.tsx` with world backdrop, current building, and a correct progress-to-next-tier bar |
| 6.2 Unlock Animation | `realm_state` table (tracks last-acknowledged tier), `realmService.ts`, `RealmUnlockOverlay.tsx` — modeled directly on the existing `LevelUpOverlay`; shown immediately on tier crossing during quest completion, with a safety-net check on Realm page load in case the ceremony was missed (tab closed mid-animation, navigated away, etc.) |
| 6.4 Buildings With Meaning | Each of the 7 tiers ties to a named building with a short blurb connecting it to consistency/habit-building as a whole — deliberately not a literal per-stat mapping, since the roadmap's tier table names (Campfire, Chicken Coop, Herb Garden...) don't correspond to any specific stat/skill category |

Sequencing: if a single quest completion crosses both a level and a realm tier at once, the level-up overlay shows first — the realm ceremony waits until it's dismissed rather than stacking two full-screen moments simultaneously.

**Deliberately deferred — 6.3 (Construction Choices) and 6.5 (World State):** both explicitly Stretch per `ROADMAP.md`'s own MVP cut line, and both need a real design decision that isn't specified anywhere (6.3: what does picking "Blacksmith" over "Observatory" actually *change*, mechanically? 6.5: most of what it asks for — current tier, streak, achievements — already has a home elsewhere in the app, so building it into the realm scene too would mostly duplicate existing UI for comparatively low payoff). Not a scope cut made silently — flagged and confirmed before skipping.

### 🔴 Incident 1 — Broken XP progress bar (pre-existing, found while scoping this phase)

**Symptom:** `PlayerCard`'s XP bar percentage was wrong for any player past level 1 — not part of Phase 6, but found while confirming that `player_state.current_xp` was safe to use as Realm's lifetime-XP input.

**Cause:** `current_xp` genuinely stores lifetime cumulative XP (confirmed via `player.currentXp + earnedXp`, which only ever grows) — good news for Realm. But `xp_to_next_level` stores the *size of the current level's XP span* (e.g. ~237 XP), not a cumulative threshold. The bar computed `currentXp ÷ xpToNextLevel`, dividing an ever-growing cumulative number by a small per-level span.

**Fix:** `PlayerCard` now derives `xpInLevel`/`xpToNextLevel` fresh from `levelFromXp(player.currentXp)` at render time instead of trusting the stored, mismatched value — same "recompute, don't trust stored" approach already used for the title ladder.

### 🔴 Incident 2 — Same missing-row gap, a third time — fixed at the root

**Symptom:** after this phase shipped, a real tier crossing (Campfire → Chicken Coop) produced no unlock ceremony — the tier changed silently, only visible by checking the Realm page directly.

**Cause:** the account predated the `realm_state` migration, so `getLastAcknowledgedTier` returned `null`, and both the completion-time check and the Realm page's safety-net check were written to tolerantly skip on `null` — silently disabling the feature entirely for any pre-existing account. This was the *third* time this exact gap shape appeared (`character_stats` in 5.2, `character_skills` in 5.5, now `realm_state`), each requiring a one-off manual SQL backfill.

**Fix, this time at the root instead of patched per-table:** `getCharacterStats`, `getCharacterSkills`, and `getLastAcknowledgedTier` are now self-healing — if a row doesn't exist, each creates one with defaults on that same read, rather than returning a permanent `null`. `getLastAcknowledgedTier` specifically heals to tier `1`, not the player's actual current tier, so a player who'd already progressed further still gets the ceremony they're owed the next time the check runs, instead of it being silently marked as already-seen.

**Lesson:** the recurring shape here wasn't "forgot a backfill" three separate times — it was a missing general pattern (self-healing reads for any per-user row-on-signup table). Any future table of this shape should be built self-healing from the start, not patched reactively after the third occurrence.

**Result: PASS** · Release `v0.6.0`

<br>

---

## Phase 4.5 — Rank System *(built retroactively, ahead of Phase 7)*

**Goal:** a daily S/A/B/C/D/F rank, originally scoped as Phase 4 Stretch and skipped at the time. Built now because Phase 7's "highest rank frequency" personal record has no meaning without it.

### Formula

GAMEPLAY.md §11 explicitly requires the formula be defined and confirmed *before* implementation, not left implicit in code. Confirmed with the product owner across a few rounds of adjustment:

```
score = completionPercent (0-100)
      + (streakMaintained ? 15 : 0)
      + (comboAchieved ? 15 : 0)

S ≥ 115   A ≥ 90   B ≥ 65   C ≥ 40   D ≥ 15   F < 15
```

Completion is the dominant factor — no rank-farming by clicking fast, only by actually finishing quests. Streak/combo are meaningful but bounded bonuses, same "bonus never dominates" principle already enforced for combo XP. S is deliberately hard to reach (100% completion alone only reaches A — you need a bonus too); F requires genuinely low effort, not just an imperfect day, matching the app's supportive-not-punishing tone.

### What shipped

`lib/rank.ts` (pure formula + combo-day derivation, replaying the existing 2-hour combo window logic across a day's completions rather than reimplementing it), `services/rankService.ts`, `components/RankBadge.tsx` — shown live on the Quests page (the actual Phase 4 placement per `UI_GUIDELINE.md`, not Progress), recomputed after every completion so it never goes stale mid-session.

No new table: rank is fully derived from `quest_progress` + `quest_definitions` on every read, same "recompute, don't trust stored" discipline as titles and the XP bar fix above.

**Result: PASS**

<br>

---

## Phase 7 — Progress Intelligence

**Goal:** turn historical records into decisions the player can actually act on — daily history, a weekly report, and personal records.

### What shipped

| Sub-phase | What shipped |
|---|---|
| Daily History | `lib/progress.ts`'s `aggregateByDay`, `services/progressService.ts`'s `getDailyBreakdown` — XP, completion count/rate, per-category unit totals, and that day's rank, for any date |
| Weekly Report | `aggregateWeek` + `buildWeeklyReport` — total XP, average completion, best/weakest day, most-consistent/neglected category (by completion count, not XP — a category can be "neglected" even if its few completions were high-value), a composite score on the same 0-130 scale as daily rank, Wins/Weaknesses, and a computed Next-Week Focus |
| Personal Records | `computePersonalRecords` — most XP in a day, highest per-category unit total in a day, rank frequency counts. Longest streak is passed in from `player_state` rather than re-derived, to avoid a second source of truth for a value that already exists correctly |
| Optional Journal Note | `create_weekly_journal.sql` — the one genuinely new writable table this phase needed; everything else is derived, not stored |

Real `ProgressPage.tsx` replacing the placeholder: a Daily/Weekly toggle on one page (not three separate pages, per `UI_GUIDELINE.md`), plus Personal Records shown underneath regardless of which view is active, since it's an all-time view, not tied to a specific period.

### 🟡 Known gap — `daily_state` is dead code

**Symptom:** `ROADMAP.md` explicitly says this phase would be fed by "Phase 2's daily snapshots (2.6) and Phase 3's cloud history" — while scoping, found that `daily_state` has a full migration and RLS policy but is never read or written anywhere in the actual application code. Confirmed via a full-codebase search — zero references outside the migration file itself.

**Resolution:** did not resurrect it. `quest_progress` (which *is* real, actively written, and retains full history — confirmed via its `(user_id, quest_definition_id, date_key)` unique constraint, one row per quest per day, never overwritten) already carries everything this phase needs. Building on `daily_state` would have meant maintaining two sources of truth for the same information. Left as an open item — worth a decision on whether to drop the unused table in a later cleanup pass, not done unilaterally here since dropping schema is harder to reverse than adding it.

### 🟡 Known gap — "Next week's focus" is the lightweight version only

`ROADMAP.md` lists "Next week's focus" as part of the Core Weekly Report; `PHASE_ASSIGNMENTS.md` separately lists "next-week planning" under Stretch. Resolved as two different sizes of the same idea: the Core version shipped is a single computed suggestion (the week's most neglected category). A full interactive goal-setting/tracking flow — which would need real, currently-unspecified mechanics (freeform goal? selected from a list? tracked against next week how?) — stays deferred, same category of open design question as Realm's 6.3.

**Result: PASS** · Release `v0.7.0`

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

Audio/PWA · AI companion · Public beta

Also open: a per-quest skill mapping (Phase 5.5 currently maps skills at the category level, deliberately kept simple); Realm's 6.3/6.5 (construction choices, dynamic world state); a full next-week planning/goal-tracking flow beyond Phase 7's computed suggestion — all three need a product decision before they can be built, not just more code. Also worth revisiting: whether `daily_state` should be dropped now that Phase 7 confirmed it's genuinely unused.

Designed only when their requirements become concrete — tracked in the project's separate planning docs, not in this repo.