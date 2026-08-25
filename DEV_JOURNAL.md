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
| 4 | Gamification Engine | ⬜ Next |

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

**Result: PASS** · Release `v0.2.0`

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

Achievements · Realm progression · Character stats · Progress analytics · Audio/PWA · AI companion · Public beta

Designed only when their requirements become concrete — see `ROADMAP.md`.
