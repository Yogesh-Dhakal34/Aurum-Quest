<div align="center">

# ⚔️ AURUM QUEST

### ✦ Turn your real-life goals into quests. Earn XP. Build your legend.

Aurum Quest is a **gamified personal productivity application** built around
quests, XP, progression, and personal growth.

The project is being developed progressively — starting with a simple
working quest loop and expanding toward **persistence, richer progression
systems, and eventually a more immersive personal world.**

[![Version](https://img.shields.io/badge/version-v0.1.0-8A2BE2?style=for-the-badge)](#-versioning)
[![Phase](https://img.shields.io/badge/phase-1%20complete-4B0082?style=for-the-badge)](#-development-roadmap)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=for-the-badge)](LICENSE)
[![Built with React](https://img.shields.io/badge/built%20with-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=white)](#-tech-stack)

</div>

<br>

---

## 🌟 Current Status

| | |
|---|---|
| **Version** | `v0.1.0` |
| **Phase** | Phase 1 — Opening Experience + App Shell + First Dashboard |

Aurum Quest currently provides a functional local quest loop:

```text
                    ⚔️  AURUM QUEST

                         OPEN
                           │
                           ▼
                  🧙  PLAYER IDENTITY
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
                   📈  TRACK PROGRESS
```

> Phase 1 focuses on proving this core loop before introducing persistence
> and more advanced progression systems.

<br>

---

## ✨ What You Can Do

<table>
<tr>
<td width="33%" valign="top">

### 🧙 Build Your Legend

- View your player identity
- See your current level
- Track XP progression
- Maintain a daily streak
- Display your player title

</td>
<td width="33%" valign="top">

### ⚔️ Complete Quests

- View today's quests
- Organize quests by category
- See quest difficulty
- View XP rewards
- Complete available quests
- Receive animated XP feedback

</td>
<td width="33%" valign="top">

### 📈 Track Your Progress

- View today's earned XP
- Track completed quests
- See total daily quests
- Monitor completion percentage
- Watch progress update in real time

</td>
</tr>
</table>

<br>

---

## 🖥️ Responsive Experience

Aurum Quest adapts to different screen sizes.

<table>
<tr>
<td width="60%" valign="top">

**Desktop**

```text
┌─────────────────────────────────────────────────────────┐
│ ⚔️ Aurum Quest                                           │
├────────────────┬────────────────────────────────────────┤
│                │                                         │
│  📜 Quests     │       ⚔️ Today's Quests                │
│                │                                         │
│  🧙 Legend     │       🧙 Player                        │
│                │                                         │
│  📈 Progress   │       📜 Quest List                     │
│                │                                         │
│  🌎 Realm      │       ✦  XP & Progress                 │
│                │                                         │
│  ⚙️ Settings   │                                         │
│                │                                         │
└────────────────┴────────────────────────────────────────┘
```

</td>
<td width="40%" valign="top">

**Mobile**

```text
┌──────────────────────────┐
│ ⚔️ Aurum Quest            │
├──────────────────────────┤
│ 📜 Quests  🧙 Legend  📈  │
├──────────────────────────┤
│                          │
│     Today's Quests       │
│                          │
│     🧙 Player Card       │
│                          │
│     ⚔️ Quest Cards        │
│                          │
│     📈 Daily Progress    │
│                          │
└──────────────────────────┘
```

</td>
</tr>
</table>

<br>

---

## 🧩 Tech Stack

| Technology | Purpose |
|---|---|
| ⚛️ **React** | User interface |
| 🔷 **TypeScript** | Type-safe development |
| ⚡ **Vite** | Development and production build |
| 🎨 **Tailwind CSS** | Styling and responsive layouts |
| ✨ **Motion for React** | UI animations |
| 🌿 **Git** | Version control |
| 🐙 **GitHub** | Repository and project history |

<br>

---

## 🏗️ Project Structure

```text
aurum-quest/
│
├── 📁 public/
│
├── 📁 src/
│   │
│   ├── 📁 components/
│   │   ├── PlayerCard.tsx
│   │   └── QuestCard.tsx
│   │
│   ├── 📁 data/
│   │   ├── player.ts
│   │   └── quests.ts
│   │
│   ├── 📁 layouts/
│   │   └── AppShell.tsx
│   │
│   ├── 📁 pages/
│   │   └── QuestsPage.tsx
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

<br>

---

## 🚀 Running Locally

**1. Clone the repository**

```bash
git clone https://github.com/Yogesh-Dhakal34/Aurum-Quest.git
```

**2. Enter the project**

```bash
cd Aurum-Quest
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

> Vite will provide the local development URL in the terminal.

**5. Create a production build**

```bash
npm run build
```

<br>

---

## 🧪 Phase 1 Validation

Phase 1 has been tested across both desktop and mobile layouts.

<table>
<tr>
<td width="50%" valign="top">

**🖥️ Desktop**

- [x] Opening experience
- [x] Sidebar navigation
- [x] Quest grouping
- [x] Quest completion
- [x] XP feedback
- [x] Daily XP tracking
- [x] Daily progress percentage
- [x] Responsive layout

</td>
<td width="50%" valign="top">

**📱 Mobile**

- [x] Mobile navigation
- [x] Quest grouping
- [x] Quest completion
- [x] XP feedback
- [x] Daily XP tracking
- [x] Daily progress
- [x] Responsive layout
- [x] No horizontal layout issues observed

</td>
</tr>
</table>

### 🔨 Production Build

```bash
npm run build
```

- [x] TypeScript compilation
- [x] Vite production build
- [x] Production bundle generated

<br>

---

## 🗺️ Development Roadmap

Aurum Quest is being built phase by phase.

> The goal is not to build the entire vision at once, but to establish a
> reliable foundation before increasing complexity.

### ✅ Phase 0 — Environment & Initialization

**Status:** Complete

- [x] React + TypeScript + Vite project
- [x] Development environment
- [x] Initial project structure
- [x] Dependency setup
- [x] Git initialization
- [x] GitHub repository
- [x] Initial documentation

### ✅ Phase 1 — Opening Experience + App Shell + First Dashboard

**Status:** Complete · **Release:** `v0.1.0`

**Delivered**

- [x] ⚔️ Branded opening experience
- [x] 🧭 Application navigation
- [x] 🖥️ Responsive application shell
- [x] 🧙 Player identity card
- [x] 📊 Level and XP display
- [x] 🔥 Streak display
- [x] 📜 Today's quest list
- [x] 🏷️ Quest categories
- [x] ⚔️ Quest difficulty
- [x] ✦ Quest XP rewards
- [x] ✅ Quest completion
- [x] ✨ Animated XP feedback
- [x] 📈 Daily progress tracking
- [x] 📱 Desktop and mobile testing

### 🔜 Phase 2 — Progression & Persistence

**Status:** Planned

The next phase will begin moving Aurum Quest beyond a temporary local
experience.

Potential areas include:

- 💾 Persistent player state
- 📈 More complete progression logic
- ✦ Expanded XP systems
- 🏆 More detailed progress views
- ⚔️ Expanded quest interactions
- 🗃️ More structured application data

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

- 🏆 Achievements
- 🔥 Streak systems
- 📊 Advanced statistics
- 🌎 Realm/world systems
- 💾 Persistent data
- 🎯 More advanced quest structures
- 🧩 Personalization
- ✨ A more immersive productivity experience

> The roadmap is intentionally flexible and will evolve as the application
> is tested and developed.

<br>

---

## 🧠 Development Philosophy

Aurum Quest is intentionally being built incrementally.

Rather than attempting to create the entire vision immediately, each phase
aims to establish a small, functional foundation that can be tested before
additional complexity is introduced.

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

This approach keeps the project:

🧩 Understandable · 🧪 Testable · 🛠️ Maintainable · 📈 Incrementally scalable

<br>

---

## 📌 Versioning

**Current Release: `v0.1.0` — Phase 1**

The `v0.1.0` tag represents the completed Phase 1 baseline. Development
continues from the `main` branch.

<br>

---

## 📖 Development Journal

Important development decisions, implementation notes, testing results,
and milestones are recorded in **[`DEV_JOURNAL.md`](DEV_JOURNAL.md)**.

The development journal provides a chronological record of how Aurum Quest
is being built.

<br>

---

## 👤 Project

<div align="center">

### ⚔️ Aurum Quest

A personal productivity RPG built with React and TypeScript.

**Developed by [Yogesh Dhakal](https://github.com/Yogesh-Dhakal34)**

<br>

✦ *Your goals are the quests.* <br>
✦ *Your actions are the XP.* <br>
✦ *Your progress builds the legend.*

<br>

**⚔️ Aurum Quest — v0.1.0**

</div>
