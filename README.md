<div align="center">

# ⚔️ AURUM QUEST

### ✦ Turn your real-life goals into quests. Earn XP. Build your legend.

Aurum Quest is a **gamified personal productivity application** built around quests, XP, progression, and personal growth.

The project is being developed progressively — starting with a functional quest loop and evolving toward **persistent user data, structured progression systems, authentication, and eventually a more immersive personal world.**

[![Version](https://img.shields.io/badge/version-v0.2.0-8A2BE2?style=for-the-badge)](#-versioning)
[![Phase](https://img.shields.io/badge/phase-2%20complete-4B0082?style=for-the-badge)](#-development-roadmap)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=for-the-badge)](#)
[![Built with React](https://img.shields.io/badge/built%20with-React%20%2B%20TypeScript-61DAFB?style=for-the-badge\&logo=react\&logoColor=white)](#-tech-stack)

</div>

<br>

---

## 🌟 Current Status

|                |                                           |
| -------------- | ----------------------------------------- |
| **Version**    | `v0.2.0`                                  |
| **Phase**      | Phase 2 — Progression & Local Persistence |
| **Next Phase** | Phase 3 — Backend & Data Architecture     |

Aurum Quest has progressed from a static quest interface into a locally persistent application.

The current quest loop is:

```text
                    ⚔️  AURUM QUEST

                         OPEN
                           │
                           ▼
                  🧙  PLAYER STATE
                           │
                           ▼
                    📜  TODAY'S QUESTS
                           │
                           ▼
                    ⚔️  COMPLETE QUEST
                           │
                           ▼
                       ✦  EARN XP
                           │
                           ▼
                    🔥  QUEST COMBO
                           │
                           ▼
                   📈  TRACK PROGRESS
                           │
                           ▼
                    💾  SAVE LOCALLY
```

Phase 2 established the local application state and progression foundation.

Phase 3 will begin moving the application toward a structured backend architecture using **Supabase**.

<br>

---

## ✨ What You Can Do

<table>
<tr>
<td width="33%" valign="top">

### 🧙 Build Your Legend

* View player identity
* See current level
* Track XP progression
* Maintain a streak
* Display player title
* Persist player progression locally

</td>
<td width="33%" valign="top">

### ⚔️ Complete Quests

* View today's quests
* Organize quests by category
* See quest difficulty
* View XP rewards
* Complete single-session quests
* Complete multi-session quests
* Receive animated XP feedback
* Track quest progress

</td>
<td width="33%" valign="top">

### 📈 Track Progress

* View today's XP
* Track completed quests
* Track total daily quests
* Monitor completion percentage
* Track quest progress
* Apply combo-based XP rewards
* Reset daily state using GMT date boundaries

</td>
</tr>
</table>

<br>

---

## 💾 Persistence

Aurum Quest currently uses browser `localStorage` for persistence.

The application has a reusable persistence layer:

```text
React State
     │
     ▼
usePersistentState
     │
     ▼
storage.ts
     │
     ▼
localStorage
```

Current persisted application state includes:

* Player state
* Quest state
* Daily date state

The application also validates persisted data before using it.

This is intentionally a transitional architecture.

Local persistence allowed the progression system to be developed and tested before introducing a backend.

### Phase 3 Transition

The next architecture will introduce Supabase:

```text
React UI
   │
   ▼
Application Services
   │
   ▼
Supabase Client
   │
   ▼
PostgreSQL Database
```

The existing local persistence layer will not simply be replaced everywhere at once.

Instead, functionality will be migrated incrementally by domain.

<br>

---

## 🧩 Tech Stack

| Technology             | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| ⚛️ **React**           | User interface                                          |
| 🔷 **TypeScript**      | Type-safe development                                   |
| ⚡ **Vite**             | Development and production build                        |
| 🎨 **Tailwind CSS**    | Styling and responsive layouts                          |
| ✨ **Motion for React** | UI animations                                           |
| 🌿 **Git**             | Version control                                         |
| 🐙 **GitHub**          | Repository and project history                          |
| 🟢 **Supabase**        | Backend, PostgreSQL database, and future authentication |

<br>

---

## 🏗️ Current Project Structure

```text
aurum-quest/
│
├── 📁 public/
│
├── 📁 src/
│   │
│   ├── 📁 components/
│   │   ├── OpeningExperience.tsx
│   │   ├── PlayerCard.tsx
│   │   └── QuestCard.tsx
│   │
│   ├── 📁 data/
│   │   ├── player.ts
│   │   └── quests.ts
│   │
│   ├── 📁 hooks/
│   │   └── usePersistentState.ts
│   │
│   ├── 📁 layouts/
│   │   └── AppShell.tsx
│   │
│   ├── 📁 lib/
│   │   ├── date.ts
│   │   └── storage.ts
│   │
│   ├── 📁 pages/
│   │   ├── LegendPage.tsx
│   │   ├── ProgressPage.tsx
│   │   ├── QuestsPage.tsx
│   │   ├── RealmPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── 📁 types/
│   │   ├── player.ts
│   │   ├── quest.ts
│   │   └── view.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── 📄 DEV_JOURNAL.md
├── 📄 README.md
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 vite.config.ts
```

### Planned Phase 3 Structure

As functionality is moved toward the backend, domain-specific services will be introduced.

```text
src/
│
├── components/
│
├── hooks/
│
├── lib/
│   ├── date.ts
│   ├── storage.ts
│   └── supabase.ts
│
├── services/
│   ├── playerService.ts
│   ├── questService.ts
│   └── ...
│
├── types/
│
├── pages/
└── ...
```

The application will grow by **functionality/domain**, rather than concentrating unrelated logic inside a single page component.

<br>

---

## 🧠 Architecture Direction

Aurum Quest is intentionally moving toward separation of responsibilities.

### UI Components

Responsible for:

* Display
* Interaction
* Animation
* Visual state

### Pages

Responsible for:

* Page composition
* Coordinating UI
* Connecting hooks/services to components

### Hooks

Responsible for:

* Reusable React state behavior
* Application-side state integration

### Services

Responsible for:

* Player operations
* Quest operations
* Progress operations
* Database communication

### Libraries

Responsible for:

* Storage utilities
* Date utilities
* Supabase client
* Other infrastructure concerns

### Types

Responsible for:

* Shared data contracts
* Type-safe domain models

This separation will become increasingly important as Aurum Quest gains multiple users and persistent backend data.

<br>

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Yogesh-Dhakal34/Aurum-Quest.git
```

### 2. Enter the project

```bash
cd Aurum-Quest
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Create a production build

```bash
npm run build
```

### 6. Check the working tree

```bash
git status
```

<br>

---

## 🧪 Phase 2 Validation

Phase 2 was tested incrementally as functionality was introduced.

### Persistence

* [x] Player state persists after reload
* [x] Quest state persists after reload
* [x] Daily state persists after reload
* [x] Stored data can be inspected through browser storage
* [x] Corrupted/invalid stored state has fallback handling

### Daily System

* [x] GMT-based date key implemented
* [x] Daily quest reset implemented
* [x] Daily state can be tested by changing the stored date
* [x] Daily reset behavior verified

### Quest Progression

* [x] Single-session quests
* [x] Multi-session quests
* [x] Quest progress increments correctly
* [x] Quest cannot exceed its target
* [x] Quest completion state is preserved
* [x] Multiple sessions tested successfully

### XP & Combo

* [x] XP awarded on quest completion
* [x] Combo system implemented
* [x] Combo multiplier tested
* [x] XP feedback animation tested
* [x] Player XP updates correctly
* [x] Daily XP and progression display tested

### Production Validation

```bash
npm run build
```

* [x] TypeScript compilation
* [x] Vite production build
* [x] Production bundle generated

### Git Validation

* [x] Changes committed
* [x] Working tree verified clean
* [x] Phase 2 commit created
* [ ] Latest Phase 2 commit pushed

<br>

---

## 🗺️ Development Roadmap

Aurum Quest is being developed incrementally.

> The goal is not to build the entire vision at once, but to establish a reliable foundation before increasing complexity.

### ✅ Phase 0 — Environment & Initialization

**Status:** Complete

* [x] React + TypeScript + Vite project
* [x] Development environment
* [x] Initial project structure
* [x] Dependency setup
* [x] Git initialization
* [x] GitHub repository
* [x] Initial documentation

### ✅ Phase 1 — Opening Experience + App Shell + First Dashboard

**Status:** Complete
**Release:** `v0.1.0`

Delivered:

* [x] Branded opening experience
* [x] Application navigation
* [x] Responsive application shell
* [x] Player identity card
* [x] Level and XP display
* [x] Streak display
* [x] Today's quest list
* [x] Quest categories
* [x] Quest difficulty
* [x] Quest XP rewards
* [x] Quest completion
* [x] Animated XP feedback
* [x] Daily progress tracking
* [x] Desktop and mobile testing

### ✅ Phase 2 — Progression & Local Persistence

**Status:** Complete
**Release:** `v0.2.0`

Delivered:

* [x] Reusable local persistence layer
* [x] Persistent player state
* [x] Persistent quest state
* [x] GMT-based daily reset
* [x] Daily date state
* [x] Quest combo system
* [x] Combo-based XP multiplier
* [x] Progress-based quests
* [x] Multi-session quests
* [x] Quest target validation
* [x] Persistent XP progression
* [x] Improved daily progress tracking
* [x] Runtime validation of persisted state
* [x] Phase 2 production build validation

### 🔜 Phase 3 — Backend & Data Architecture

**Status:** Starting

Phase 3 begins the transition from a single-browser application to a backend-backed application.

#### Phase 3.0 — Architecture Foundation

* [ ] Update project documentation
* [ ] Define backend architecture
* [ ] Separate domain responsibilities
* [ ] Introduce service layer
* [ ] Define database domain models
* [ ] Establish Supabase project
* [ ] Establish environment configuration

#### Phase 3.1 — Supabase Foundation

* [ ] Install Supabase client
* [ ] Create Supabase client module
* [ ] Configure environment variables
* [ ] Verify frontend-to-Supabase connection
* [ ] Establish safe database access pattern

#### Phase 3.2 — Database Schema

* [ ] Design initial PostgreSQL schema
* [ ] Create profile/player table
* [ ] Create quest definition structure
* [ ] Create user quest/progress structure
* [ ] Define relationships
* [ ] Add database constraints
* [ ] Add Row Level Security policies

#### Phase 3.3 — Data Services

* [ ] Create player service
* [ ] Create quest service
* [ ] Create progress service where required
* [ ] Move database operations out of page components
* [ ] Establish typed service interfaces

#### Phase 3.4 — Data Migration

* [ ] Read player data from Supabase
* [ ] Read quest data from Supabase
* [ ] Persist quest progress remotely
* [ ] Persist player progression remotely
* [ ] Verify refresh persistence
* [ ] Verify data integrity

#### Phase 3.5 — Authentication Foundation

Authentication will be introduced after the database foundation is proven.

* [ ] Supabase Auth integration
* [ ] Registration
* [ ] Login
* [ ] Logout
* [ ] Authenticated user identity
* [ ] User-owned data
* [ ] Protected application data

<br>

---

## 🔮 Future Direction

As Aurum Quest develops, the system may expand toward:

```text
                    ⚔️  AURUM QUEST
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          📜 QUESTS     📈 PROGRESS    🏆 ACHIEVEMENTS
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    🧙 PLAYER SYSTEM
                           │
                           ▼
                     🌎 PERSONAL REALM
                           │
                           ▼
                  ✨ IMMERSIVE WORLD
```

Longer-term development may explore:

* Authentication and accounts
* Achievements
* Advanced streak systems
* Advanced statistics
* Realm/world systems
* User personalization
* More advanced quest structures
* Quest history
* Progress analytics
* Social or community systems
* More immersive productivity mechanics

The roadmap remains flexible and will evolve based on testing and architectural needs.

<br>

---

## 🧠 Development Philosophy

Aurum Quest is intentionally being built incrementally.

The project follows:

```text
       BUILD
         │
         ▼
       TEST
         │
         ▼
      VERIFY
         │
         ▼
      COMMIT
         │
         ▼
       PUSH
         │
         ▼
      EXPAND
         │
         └───────────────↺
```

For larger features, the preferred development pattern is:

```text
DEFINE
  ↓
ARCHITECT
  ↓
IMPLEMENT SMALL PIECE
  ↓
TEST
  ↓
VERIFY
  ↓
COMMIT
  ↓
EXPAND
```

Aurum Quest should avoid concentrating unrelated responsibilities inside individual files.

As the application grows, functionality should be divided into appropriate:

**components · hooks · services · libraries · types · pages**

This keeps the system understandable, testable, maintainable, and easier to scale.

<br>

---

## 📌 Versioning

### `v0.1.0`

Phase 1 baseline:

**Opening Experience + App Shell + First Dashboard**

### `v0.2.0`

Phase 2 baseline:

**Progression + Local Persistence**

### Phase 3

Current development:

**Backend + Data Architecture**

The project will continue developing from the `main` branch.

<br>

---

## 📖 Development Journal

Important development decisions, implementation notes, testing results, and milestones are recorded in **[`DEV_JOURNAL.md`](DEV_JOURNAL.md)**.

The development journal provides a chronological record of how Aurum Quest is being built.

<br>

---

## 👤 Project

<div align="center">

### ⚔️ Aurum Quest

A personal productivity RPG built with React and TypeScript.

**Developed by [Yogesh Dhakal](https://github.com/Yogesh-Dhakal34)**

<br>

✦ *Your goals are the quests.*
✦ *Your actions are the XP.*
✦ *Your progress builds the legend.*

<br>

**⚔️ Aurum Quest — Phase 3**

</div>
