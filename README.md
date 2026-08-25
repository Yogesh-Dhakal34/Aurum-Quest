<div align="center">

# ⚔️ AURUM QUEST

### ✦ Turn your real-life goals into quests. Earn XP. Build your legend.

A **gamified personal productivity application** — real-world actions become quests, quests earn XP, XP builds a persistent character and world.

[![Version](https://img.shields.io/badge/version-v0.3.0-8A2BE2?style=for-the-badge)](#-versioning)
[![Phase](https://img.shields.io/badge/phase-3%20complete-4B0082?style=for-the-badge)](#-development-roadmap)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=for-the-badge)](LICENSE)
[![Built with React](https://img.shields.io/badge/built%20with-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=white)](#-tech-stack)

</div>

<br>

---

## 🌟 Current Status

| | |
|---|---|
| **Version** | `v0.3.0` |
| **Phase** | 3 — Backend & Data Architecture *(complete)* |
| **Next** | 4 — Gamification Engine |

```
   OPEN → SIGN IN → TODAY'S QUESTS → COMPLETE QUEST →
   EARN XP → SYNCED TO SUPABASE → TRACK PROGRESS
```

Aurum Quest is now a **real multi-user app** — accounts, cloud-synced progress, and row-level-secured data, not just a local prototype.

<br>

---

## ✨ What You Can Do

<table>
<tr>
<td width="33%" valign="top">

### 🔐 Your Account
- Sign up / sign in / sign out
- Session persists across visits
- Guided onboarding for new players
- Your data, and only yours (RLS)

</td>
<td width="33%" valign="top">

### ⚔️ Quests
- Daily quests by category
- Single & multi-session quests
- Combo multiplier on consecutive completions
- Duplicate-click safe — no double XP

</td>
<td width="33%" valign="top">

### 📈 Progress
- Level, XP, and streak — cloud-synced
- Daily completion tracking
- Survives refresh, reopen, *and* device change

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

Pages never query Supabase directly — they call a service (`playerService`, `questService`, `onboardingService`), which keeps the backend swappable and page components small.

```
src/
├── components/   UI
├── pages/        Page composition
├── hooks/        React state (useAuth, usePersistentState)
├── services/     Domain operations ← Supabase lives here
├── context/       Auth session
├── lib/          Infrastructure (date, storage, supabase client)
└── types/        Shared contracts
```

Full data model: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

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
| **3 — Backend & Data Architecture** | ✅ | `v0.3.0` |
| 4 — Gamification Engine | 🔜 Next | `v0.4.0` |
| 5 — Character System | ⬜ | `v0.5.0` |
| 6 — Realm Progression | ⬜ | `v0.6.0` |
| 7+ — Analytics, PWA, AI, Public Beta | ⬜ | — |

Full phase-by-phase detail: [`docs/ROADMAP.md`](docs/ROADMAP.md)

<details>
<summary><strong>What Phase 3 actually delivered</strong></summary>

<br>

- Supabase auth: sign up, sign in, sign out, session persistence
- 5-table PostgreSQL schema with Row Level Security on every table
- Service layer separating UI from database calls
- Real onboarding flow for new users
- 3 real bugs found and fixed during testing (missing GRANTs, a leftover unique constraint, a click-race condition) — see [`DEV_JOURNAL.md`](DEV_JOURNAL.md) for the full incident writeups

</details>

<br>

---

## 🔮 Future Direction

```
        QUESTS · PROGRESS · ACHIEVEMENTS
                      │
               PLAYER SYSTEM
                      │
               PERSONAL REALM
                      │
              IMMERSIVE WORLD
```

Achievements, character stats, realm progression, analytics, and an optional AI companion — see [`docs/ROADMAP.md`](docs/ROADMAP.md) for what's planned and why each is sequenced where it is.

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
| [`docs/PRD.md`](docs/PRD.md) | Product goals, audience, non-goals |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Full phase breakdown, effort sizing |
| [`docs/GAMEPLAY.md`](docs/GAMEPLAY.md) | XP/quest/realm rules |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Data model, folder structure |
| [`DEV_JOURNAL.md`](DEV_JOURNAL.md) | Decisions, incidents, test results |

<br>

---

<div align="center">

### ⚔️ Aurum Quest

A personal productivity RPG built with React, TypeScript, and Supabase.

**Developed by [Yogesh Dhakal](https://github.com/Yogesh-Dhakal34)**

✦ *Your goals are the quests. Your actions are the XP. Your progress builds the legend.* ✦

</div>