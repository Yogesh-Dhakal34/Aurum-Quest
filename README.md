<div align="center">

# ⚔️ AURUM QUEST

### ✦ Turn your real-life goals into quests. Earn XP. Build your legend.

A **gamified personal productivity application** — real-world actions become quests, quests earn XP, XP builds a persistent character and world.

[![Version](https://img.shields.io/badge/version-v0.5.0-8A2BE2?style=for-the-badge)](#-versioning)
[![Phase](https://img.shields.io/badge/phase-5%20complete-4B0082?style=for-the-badge)](#-development-roadmap)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=for-the-badge)](LICENSE)
[![Built with React](https://img.shields.io/badge/built%20with-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=white)](#-tech-stack)

</div>

<br>

---

## 🌟 Current Status

| | |
|---|---|
| **Version** | `v0.5.0` |
| **Phase** | 5 — Character System *(complete)* |
| **Next** | 6 — Realm Progression |

```
   OPEN → SIGN IN → TODAY'S QUESTS → COMPLETE QUEST →
   EARN XP, STATS, SKILLS → SYNCED TO SUPABASE → BUILD YOUR LEGEND
```

Aurum Quest is a **real multi-user app** — accounts, cloud-synced progress, row-level-secured data, a full XP/level/streak/achievement engine, and a persistent character with stats, skills, and titles that grow from what you actually do.

<br>

---

## ✨ What You Can Do

<table>
<tr>
<td width="25%" valign="top">

### 🔐 Your Account
- Sign up / sign in / sign out
- Session persists across visits
- Guided onboarding for new players
- Your data, and only yours (RLS)

</td>
<td width="25%" valign="top">

### ⚔️ Quests
- Daily quests by category
- Single & multi-session quests
- Combo multiplier, capped at 1.5x
- Duplicate-click safe — no double XP

</td>
<td width="25%" valign="top">

### 📈 Progress
- Level, XP, and streak — cloud-synced
- Achievements unlocked from real milestones
- Survives refresh, reopen, *and* device change

</td>
<td width="25%" valign="top">

### 🧙 Legend
- Avatar, current title, level
- 6 character stats, 8 skills
- Every gain traces to a real quest — nothing is grindable through empty clicks

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

Pages never query Supabase directly — they call a service (`playerService`, `questService`, `onboardingService`, `characterService`, `skillService`, `achievementService`), which keeps the backend swappable and page components small. Game-math logic (XP/level/combo/streak, stat mapping, skill mapping, title ladder) lives in pure, dependency-free `lib/` modules — no Supabase calls, no React — so the rules themselves are directly testable.

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
| **5 — Character System** | ✅ | `v0.5.0` |
| 6 — Realm Progression | 🔜 Next | `v0.6.0` |
| 7+ — Analytics, PWA, AI, Public Beta | ⬜ | — |

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

<br>

---

## 🔮 Future Direction

```
        QUESTS · PROGRESS · ACHIEVEMENTS · CHARACTER
                      │
               PERSONAL REALM
                      │
              IMMERSIVE WORLD
```

Realm progression, analytics, and an optional AI companion are planned and sequenced in the project's separate planning docs. A more granular per-quest skill mapping (beyond Phase 5.5's category-level version) is an open idea for revisiting after initial ship.

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