# Aurum Quest — Development Journal

This journal records major implementation decisions, architecture changes, testing results, and development milestones for Aurum Quest.

---

# Phase 0 — Environment & Initialization

## Completed

* Created the React + TypeScript + Vite project.
* Installed project dependencies.
* Configured the project for local development.
* Verified the application runs with `npm run dev`.
* Initialized Git.
* Created the `main` branch.
* Created the initial commit.
* Connected the local repository to GitHub.
* Pushed the initial project to GitHub.
* Verified a clean Git working tree.

---

# Phase 1 — Opening Experience + App Shell + First Dashboard

## Completed

* Added branded opening experience.
* Added responsive desktop and mobile application shell.
* Added navigation for:

  * Quests
  * Legend
  * Progress
  * Realm
  * Settings
* Added player identity card.
* Added player level.
* Added XP progression display.
* Added streak display.
* Added player title.
* Added static quest data.
* Added quest categories.
* Added quest difficulty.
* Added quest XP rewards.
* Added quest grouping by category.
* Added quest completion.
* Added visible quest state changes.
* Added animated XP feedback.
* Added today's XP calculation.
* Added daily progress calculation.
* Added completion percentage.
* Added responsive desktop/mobile layouts.

## Phase 1 QA

### Desktop

* Opening experience tested.
* Sidebar navigation tested.
* Quest grouping tested.
* Quest completion tested.
* XP feedback tested.
* Daily XP tested.
* Daily progress percentage tested.
* No obvious layout issues observed.

### Mobile

* Mobile navigation tested.
* Quest grouping tested.
* Quest completion tested.
* XP feedback tested.
* Daily XP and progress tested.
* No horizontal layout issues observed.
* Tested at mobile viewport sizes.

### Result

**PASS**

---

# Phase 2 — Progression & Local Persistence

## Phase 2 Objective

Phase 2 moved Aurum Quest from a mostly temporary interface into a locally persistent application.

The objective was to establish reliable local state before introducing a backend.

---

## Phase 2.1 — Local Persistence Layer

### Implemented

Created:

```text
src/hooks/usePersistentState.ts
src/lib/storage.ts
```

The persistence architecture became:

```text
React Component
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

### Persistent State

The application now persists:

* Player state
* Quest state
* Daily date state

### Reliability

The storage layer includes:

* JSON serialization
* JSON parsing
* storage availability checks
* error handling
* optional runtime validation
* fallback to initial values when stored data is invalid

This prevents corrupted localStorage data from crashing the application.

### Result

**PASS**

---

# Phase 2.2 — Daily Date System

## Implemented

Created:

```text
src/lib/date.ts
```

The application uses a GMT-based date key.

```text
getGmtDateKey()
```

This provides a consistent daily boundary independent of the user's local timezone.

### Daily Reset

When the stored daily date differs from the current GMT date:

* Quest progress is reset.
* Daily combo state is reset.
* The stored date is updated.

### Testing

The daily date was manually modified through browser developer tools to simulate a date change.

Example:

```javascript
localStorage.getItem('aurum-quest:dailyDate')
```

The date could be changed manually and the application correctly responded to the new date.

### Result

**PASS**

---

# Phase 2.3 — Quest Combo System

## Implemented

A quest combo system was introduced to reward consecutive quest completion.

The system tracks:

```text
comboCount
lastComboAt
```

The combo multiplier increases with consecutive completions.

The system was also tested against the daily reset behavior.

### Important Design Decision

The combo system is tied to actual quest completion events rather than simply counting completed quests on the screen.

This prevents page reloads from artificially increasing the combo.

### Result

**PASS**

---

# Phase 2.4 — Progress-Based Quests

## Implemented

Quest structure was expanded from a simple completed/not-completed model to:

```text
progress
target
```

Example:

```text
Progress: 2 / 3
```

A quest can therefore require multiple sessions/actions before completion.

### Quest Validation

The system prevents progress from exceeding the quest target.

The quest becomes completed when:

```text
progress >= target
```

### Quest Card

`src/components/QuestCard.tsx` was updated to:

* Display current progress.
* Display target.
* Display progress percentage.
* Disable completion when the target is reached.
* Continue displaying the correct XP reward.

### Testing

Multi-session quest behavior was tested through three sessions.

### Result

**PASS**

---

# Phase 2.5 — XP & Progression

## Implemented

XP is now awarded when a quest reaches its target.

The player state tracks:

```text
currentXp
xpToNextLevel
level
```

Combo multipliers can affect the XP awarded by a completed quest.

Animated XP feedback was also retained.

### Daily Progress

The dashboard displays:

* Today's XP
* Completed quests
* Total quests
* Completion percentage
* Progress bar

### Result

**PASS**

---

# Phase 2.6 — Phase 2 Integration Testing

The completed Phase 2 system was tested as a combined workflow.

```text
Open application
      ↓
Load persisted state
      ↓
View today's quests
      ↓
Complete quest
      ↓
Update progress
      ↓
Award XP
      ↓
Update combo
      ↓
Persist state
      ↓
Reload application
      ↓
State remains
```

Additional tests included:

* Completing quests across multiple sessions.
* Reloading the browser.
* Inspecting localStorage.
* Testing daily reset behavior.
* Testing combo behavior.
* Testing progress-based quests.
* Testing production builds.

### Production Build

```bash
npm run build
```

Result:

**PASS**

### Git Status

Phase 2 functionality was committed successfully.

Latest recorded commit:

```text
5bb18f3 feat: add progress-based quests
```

The branch was subsequently pushed as part of the Phase 2 workflow.

---

# Phase 2 Final Result

**PASS**

Aurum Quest is now a functional locally persistent productivity RPG prototype.

The application is no longer dependent entirely on static in-memory state.

---

# Phase 3 — Backend & Data Architecture

## Status

**STARTING**

Phase 3 marks the transition from a single-browser local application toward a multi-user backend-backed application.

Supabase has been prepared as the backend platform.

The current Supabase project is healthy and ready for development.

---

# Phase 3 Architecture Goal

The main objective is **not** to immediately move every piece of code into Supabase.

The objective is to establish a clean architecture first.

The target architecture is:

```text
┌─────────────────────────────┐
│        React Frontend       │
│                             │
│ Pages / Components / Hooks  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Domain Services        │
│                             │
│ Player / Quest / Progress   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Supabase Client       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        PostgreSQL DB        │
└─────────────────────────────┘
```

---

# Phase 3 Architectural Principle

Aurum Quest should avoid placing unrelated functionality inside a single page component.

For example, `QuestsPage.tsx` should not eventually contain:

* UI rendering
* XP calculations
* combo algorithms
* database queries
* authentication
* storage logic
* date utilities
* quest persistence
* player persistence

Instead, functionality should be divided by responsibility.

Target direction:

```text
components/
    UI

pages/
    Page composition

hooks/
    React state behavior

services/
    Domain operations

lib/
    Infrastructure utilities

types/
    Domain contracts

data/
    Development seed/static data
```

---

# Phase 3.0 — Architecture Foundation

## Planned

* [ ] Update README
* [ ] Update development journal
* [ ] Define backend architecture
* [ ] Identify domain boundaries
* [ ] Introduce service layer
* [ ] Define database models
* [ ] Decide which data belongs in PostgreSQL
* [ ] Decide which state remains client-side

---

# Phase 3.1 — Supabase Foundation

## Planned

* [ ] Install Supabase JavaScript client
* [ ] Add environment configuration
* [ ] Create `src/lib/supabase.ts`
* [ ] Connect frontend to Supabase
* [ ] Verify connection
* [ ] Establish database access conventions

---

# Phase 3.2 — Database Design

## Initial Domains

The first database design will focus on a small number of domains.

```text
User
 │
 ▼
Profile
 │
 ├── Player progression
 │
 └── Future settings

Quest
 │
 ▼
User Quest / Quest Progress
```

The schema will deliberately remain small initially.

Additional systems such as achievements, statistics, realm data, social features, and advanced analytics will not be added until their requirements are understood.

---

# Phase 3.3 — Service Layer

Planned services:

```text
src/services/

playerService.ts
questService.ts
progressService.ts
```

Services will provide a boundary between the React UI and the backend.

For example:

```text
QuestsPage
    │
    ▼
questService.completeQuest()
    │
    ▼
Supabase
```

Rather than:

```text
QuestsPage
    │
    └── Direct database query
```

This will keep page components smaller and make the backend easier to replace or modify later.

---

# Phase 3.4 — Database Persistence

After the database foundation is verified:

* [ ] Persist player profile
* [ ] Persist player progression
* [ ] Persist quest definitions
* [ ] Persist user quest progress
* [ ] Persist completion state
* [ ] Verify reload persistence
* [ ] Verify data integrity

---

# Phase 3.5 — Authentication Foundation

Authentication will be introduced after the database model is proven.

Planned:

```text
Register
   ↓
Login
   ↓
Authenticated User
   ↓
Profile
   ↓
User-owned Data
```

Planned functionality:

* [ ] Registration
* [ ] Login
* [ ] Logout
* [ ] Session persistence
* [ ] User identity
* [ ] User-owned player data
* [ ] User-owned quest data
* [ ] Protected database access

---

# Phase 3.6 — Security

Database security will be introduced alongside authenticated data.

Planned:

* [ ] Row Level Security
* [ ] User ownership policies
* [ ] Prevent unauthorized reads
* [ ] Prevent unauthorized writes
* [ ] Verify policies through testing

Security will be treated as part of the database architecture rather than as a final add-on.

---

# Phase 3 Success Criteria

Phase 3 will not be considered complete simply because Supabase is connected.

The phase should eventually demonstrate:

```text
User
 ↓
Authenticated Session
 ↓
Profile Loaded
 ↓
Today's Quests Loaded
 ↓
Quest Completed
 ↓
Progress Updated
 ↓
XP Updated
 ↓
Data Saved
 ↓
Browser Reload
 ↓
Data Still Exists
```

And:

```text
User A
  ↓
Can access User A's data

User B
  ↓
Can access User B's data

User A
  X
Cannot access User B's private data
```

Only after these fundamentals work should more advanced systems be added.

---

# Future Phases

Potential future areas include:

* Achievements
* Advanced statistics
* Quest history
* Streak history
* Advanced progression
* Realm/world system
* Personalization
* Notifications
* Social features
* Analytics
* More immersive RPG mechanics

These systems will be designed only when their requirements become concrete.

---

# Development Philosophy

Aurum Quest follows an incremental development model.

```text
       DEFINE
         │
         ▼
      ARCHITECT
         │
         ▼
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

The project prioritizes:

**Small changes · Clear responsibilities · Testable functionality · Reliable state · Incremental architecture**

The application should grow by functionality rather than by continuously adding unrelated logic to existing files.

---

# Important Commands

```bash
npm install
npm run dev
npm run build
npm run lint

git status
git diff --check
git add .
git commit -m "message"
git push
```

---

# Current Milestone

```text
Phase 0  ████████████████████  COMPLETE
Phase 1  ████████████████████  COMPLETE
Phase 2  ████████████████████  COMPLETE
Phase 3  ░░░░░░░░░░░░░░░░░░░░  STARTING
```

**Current focus:**

> Establish a clean backend architecture and begin the migration from local browser persistence toward Supabase-backed application data.
