# ⚔️ AURUM QUEST

### ✦ Turn your real-life goals into quests. Earn XP. Build your legend.

Aurum Quest is a **gamified personal productivity application** built around quests, XP, progression, and personal growth.

The project is being developed progressively — starting with a simple working quest loop and expanding toward **persistence, richer progression systems, and eventually a more immersive personal world.**

---

## 🌟 Current Status

**Version:** `v0.1.0`
**Phase:** `Phase 1 — Opening Experience + App Shell + First Dashboard`

Aurum Quest currently provides a functional local quest loop:

```text
                    ⚔️ AURUM QUEST

                         OPEN
                           │
                           ▼
                  🧙 PLAYER IDENTITY
                           │
                           ▼
                    📜 TODAY'S QUESTS
                           │
                           ▼
                    ⚔️ COMPLETE QUEST
                           │
                           ▼
                       ✦ EARN XP
                           │
                           ▼
                   📈 TRACK PROGRESS

                   Phase 1 focuses on proving this core loop before introducing persistence and more advanced progression systems.

✨ What You Can Do

🧙 Build Your Legend
View your player identity
See your current level
Track XP progression
Maintain a daily streak
Display your player title


⚔️ Complete Quests

View today's quests
Organize quests by category
See quest difficulty
View XP rewards
Complete available quests
Receive animated XP feedback


📈 Track Your Progress

View today's earned XP
Track completed quests
See total daily quests
Monitor completion percentage
Watch your daily progress update in real time


🖥️ Responsive Experience

Aurum Quest adapts to different screen sizes.

Desktop

┌─────────────────────────────────────────────────────────┐
│ ⚔️ Aurum Quest                                          │
├────────────────┬────────────────────────────────────────┤
│                │                                        │
│  📜 Quests    │       ⚔️ Today's Quests                │
│                │                                        │
│  🧙 Legend    │       🧙 Player                        │
│                │                                        │
│  📈 Progress   │       📜 Quest List                    │
│                │                                        │
│  🌎 Realm      │       ✦ XP & Progress                  │
│                │                                        │
│  ⚙️ Settings  │                                        │
│                │                                        │
└────────────────┴────────────────────────────────────────┘

Mobile

┌──────────────────────────────┐
│ ⚔️ Aurum Quest               │
├──────────────────────────────┤
│ 📜 Quests  🧙 Legend  📈 ... │
├──────────────────────────────┤
│                              │
│       Today's Quests         │
│                              │
│       🧙 Player Card         │
│                              │
│       ⚔️ Quest Cards         │
│                              │
│       📈 Daily Progress      │
│                              │
└──────────────────────────────┘


🧩 Tech Stack

Technology	Purpose
⚛️ React	User interface
🔷 TypeScript	Type-safe development
⚡ Vite	Development and production build
🎨 Tailwind CSS	Styling and responsive layouts
✨ Motion for React	UI animations
🌿 Git	Version control
🐙 GitHub	Repository and project history


🏗️ Project Structure
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


🚀 Running Locally

1. Clone the repository
git clone https://github.com/Yogesh-Dhakal34/Aurum-Quest.git

2. Enter the project
cd Aurum-Quest

3. Install dependencies
npm install

4. Start the development server
npm run dev

Vite will provide the local development URL in the terminal.

5. Create a production build
npm run build
🧪 Phase 1 Validation

Phase 1 has been tested across both desktop and mobile layouts.

🖥️ Desktop
 Opening experience
 Sidebar navigation
 Quest grouping
 Quest completion
 XP feedback
 Daily XP tracking
 Daily progress percentage
 Responsive layout

📱 Mobile
 Mobile navigation
 Quest grouping
 Quest completion
 XP feedback
 Daily XP tracking
 Daily progress
 Responsive layout
 No horizontal layout issues observed
🔨 Production Build
npm run build


✓ TypeScript compilation
✓ Vite production build
✓ Production bundle generated


🗺️ Development Roadmap

Aurum Quest is being built phase by phase.

The goal is not to build the entire vision at once, but to establish a reliable foundation before increasing complexity.

✅ Phase 0 — Environment & Initialization

Status: Complete

React + TypeScript + Vite project
Development environment
Initial project structure
Dependency setup
Git initialization
GitHub repository
Initial documentation
✅ Phase 1 — Opening Experience + App Shell + First Dashboard

Status: Complete
Release: v0.1.0

Delivered
⚔️ Branded opening experience
🧭 Application navigation
🖥️ Responsive application shell
🧙 Player identity card
📊 Level and XP display
🔥 Streak display
📜 Today's quest list
🏷️ Quest categories
⚔️ Quest difficulty
✦ Quest XP rewards
✅ Quest completion
✨ Animated XP feedback
📈 Daily progress tracking
📱 Desktop and mobile testing
🔜 Phase 2 — Progression & Persistence

Status: Planned

The next phase will begin moving Aurum Quest beyond a temporary local experience.

Potential areas include:

💾 Persistent player state
📈 More complete progression logic
✦ Expanded XP systems
🏆 More detailed progress views
⚔️ Expanded quest interactions
🗃️ More structured application data
🔮 Future Direction

As Aurum Quest develops, the system may expand toward:

                    ⚔️ AURUM QUEST
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

Longer-term development may explore:

🏆 Achievements
🔥 Streak systems
📊 Advanced statistics
🌎 Realm/world systems
💾 Persistent data
🎯 More advanced quest structures
🧩 Personalization
✨ A more immersive productivity experience

The roadmap is intentionally flexible and will evolve as the application is tested and developed.

🧠 Development Philosophy

Aurum Quest is intentionally being built incrementally.

Rather than attempting to create the entire vision immediately, each phase aims to establish a small, functional foundation that can be tested before additional complexity is introduced.

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

This approach keeps the project:

🧩 Understandable
🧪 Testable
🛠️ Maintainable
📈 Incrementally scalable
📌 Versioning
Current Release

v0.1.0 — Phase 1

The v0.1.0 tag represents the completed Phase 1 baseline.

Development continues from the main branch.

📖 Development Journal

Important development decisions, implementation notes, testing results, and milestones are recorded in:

DEV_JOURNAL.md

The development journal provides a chronological record of how Aurum Quest is being built.

👤 Project
⚔️ Aurum Quest

A personal productivity RPG built with React and TypeScript.

Developed by Yogesh Dhakal

<div align="center">
✦ Your goals are the quests.
✦ Your actions are the XP.
✦ Your progress builds the legend.

⚔️ Aurum Quest — v0.1.0

</div> ```
Why I prefer this version

It has a much stronger hierarchy when someone opens the GitHub repository:

AURUM QUEST
↓
What is it?
↓
What exists right now?
↓
What can I do?
↓
How does it look?
↓
How is it built?
↓
How do I run it?
↓
What has been completed?
↓
Where is it going?