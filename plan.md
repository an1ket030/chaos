# 🏟️ DRAFTWAR — Master Production Implementation Plan

> **From MVP to Standalone Commercial Product**  
> *Based on `product_redesign.md` — The Complete Technical & Product Blueprint*

---

## 1. Executive Summary & Vision

### 1.1 Product Statement
**DraftWar** is a high-intensity, real-time multiplayer football squad auction game where 2–4 players bid, bluff, and outmaneuver rivals to build an 11-player squad under budget pressure, withstand game-altering Chaos Cards, and watch an automated match simulation decide the victor.

- **Brand Name:** DRAFTWAR
- **Tagline:** *"Build your squad. Win the war."*
- **Alternative Tagline:** *"Every bid is a battle."*
- **Core Value Proposition:** Unlike season-long, async fantasy games (FPL) or single-player console drafts (EA FC Draft), DraftWar delivers a 20–30 minute, high-stakes social experience in any browser, blending live auction psychology with tactical squad construction and unpredictable card disruptions.

### 1.2 Transformation from MVP to Production Grade
| Dimension | Existing MVP | Production DraftWar |
|---|---|---|
| **Branding & IP** | Borrowed "Chaos Club" YouTube branding & neon lime (#C8FF00) | 100% original identity: "The War Room" aesthetic, Deep Space Void (`#080C12`), Fire Orange (`#FF6B2B`), Auction Gold (`#E8B84B`) |
| **Room Discovery** | Private codes only; hardcoded room presets | Public Lobby Browser with search/filters + Custom Room Creation modal (budget, timer, editions, card toggles) |
| **Auction Experience** | Basic timer bar, text log, hardcoded endpoints | Circular SVG countdown, 96px animated bid numbers, custom bid input, visual bankruptcy & transfer ban feedback, responsive mobile layout |
| **Post-Auction & Simulation** | Plain text log simulation; 29-line stub Results page ("Results calculating...") | Cinematic 2D Pitch Simulation with animated scoreboard & goal flashes; Full Results Screen with confetti, winner hero banner, ELO delta, match awards, squad ratings, and share cards |
| **Progression & Retention** | Ephemeral sessions, zero persistent stats | True ELO engine, XP & Manager Levels (1–100), Match History, 50+ Achievements, Badges, Hall of Fame squads, Daily Challenges |
| **Infrastructure** | Scattered `localhost:3001` URLs, ad-hoc socket re-instantiation | Centralized Socket Context with auto-reconnect, dynamic environment configs, Drizzle ORM PostgreSQL migrations, Redis session management, Sentry tracking |

---

## 2. Brand Identity & Design System

### 2.1 Aesthetic Archetype: "The War Room"
DraftWar evokes an elite tactical command bunker: dark, focused, precise, and serious. High-contrast typography and utilitarian layouts keep information immediate; bursts of fire orange, auction gold, and chaos purple punctuate emotional highs.

### 2.2 Color Tokens (`apps/client/src/index.css`)
```css
:root {
  /* Surface & Background */
  --dw-void: #080C12;             /* Core app canvas */
  --dw-surface: #0F1520;          /* Primary cards & panels */
  --dw-elevated: #161E2E;         /* Modals, dropdowns, popovers */
  --dw-border: rgba(255, 255, 255, 0.08);
  --dw-border-active: rgba(255, 255, 255, 0.20);

  /* Semantic Brand Accents */
  --dw-fire: #FF6B2B;             /* Primary CTA, bidding action */
  --dw-fire-dim: #CC5522;         /* Hover / pressed state */
  --dw-steel: #3D8EFF;            /* Secondary actions, info pills */
  --dw-gold: #E8B84B;             /* Sold stamp, winners, achievements */
  --dw-chaos: #9B5DE5;            /* Chaos cards, disruption events */
  --dw-danger: #FF3B3B;           /* Transfer bans, bankruptcy, errors */
  --dw-success: #2ECC71;          /* Wins, positive budget, confirmations */

  /* Typography Colors */
  --dw-text-primary: #F0F4FF;     /* Headings, high emphasis */
  --dw-text-secondary: #8A95A8;   /* Body labels, muted descriptions */
  --dw-text-ghost: #3A4458;       /* Disabled, borders, placeholders */
}
```

### 2.3 Typography Stack
- **Display:** `Bebas Neue` (400) — Big numbers, headlines, game titles, countdown timers.
- **Headings:** `Barlow Condensed` (600, 700, 800) — Card titles, player names, section headers.
- **Body UI:** `Inter` (400, 500, 600, 700) — Core application copy, labels, form controls.
- **Numeric & Live Stats:** `JetBrains Mono` (600, 700) — Budgets, timers, coordinates, live bid values.

---

## 3. Information Architecture & Route Mapping

```
/                       → Authenticated Hub / Dashboard (Active rooms, quick actions, stats)
/login                  → Split-screen Branded Login
/register               → Registration with validation
/play                   → Public Room Browser (Filters, search, live statuses)
/play/create            → Multi-step Room Creation Wizard Modal
/room/:code             → Waiting Room / Pre-flight Lobby (Player list, ready checks, chat)
/room/:code/auction     → Real-time 3-Column Auction Arena (Bidding, timer, managers, chaos overlay)
/room/:code/squad       → Tactical Squad Builder (Pitch view, formations, chemistry, captaincy)
/room/:code/simulation  → Live Match Simulation (Scoreboard, minute tracker, 2D pitch animations)
/room/:code/results     → Post-Match Climax (Winner reveal, confetti, ELO, Awards, Share Card)
/challenge              → Solo Daily Draft Challenge
/leaderboard            → Global & Friends Leaderboards (Season rankings)
/profile/:id            → Public Player Profile & Hall of Fame Squad
/profile/me             → Personal Account, Match History & Cosmetics Locker
/achievements           → 50+ Milestones & Badge Showcase
/store                  → Cosmetic Shop & Season Pass Hub
/rules                  → Interactive How-To-Play Guide & Card Encyclopedia
/settings               → Sound, Display & Account Settings
```

---

## 4. Screen-by-Screen Blueprint & UI/UX Specifications

### 4.1 Hub / Dashboard (`/`)
- **Hero Unit:** User ELO badge, current rank tier (Bronze → Elite), win streak counter, and quick-match CTA.
- **Active Games Feed:** Re-join banner for in-progress or recently finished rooms.
- **Quick Action Grid:** "Host War Room" (triggers creation modal), "Join via Code", "Browse Public Wars", "Daily Solo Challenge".
- **Mission Progress Tracker:** Mini progress bars for weekly quests.
- **Friends Activity Drawer:** Online statuses and one-click rematch invites.

### 4.2 Room Creation Modal (`/play/create`)
- **Step 1: Edition Selection** (Visual cards with sample player silhouettes): World Cup, Champions League, Premier League, La Liga, Bundesliga, Legends.
- **Step 2: Match Parameters:** Starting Budget (80–200 CP), Manager Count (2–4), Bid Timer (8s, 10s, 15s).
- **Step 3: Disruption Engine:** Chaos Cards (ON/OFF), Finance Cards (ON/OFF), Custom Card frequency.
- **Step 4: Visibility & Security:** Public (listed in browser) vs Private (invite code only).

### 4.3 Public Room Browser (`/play`)
- Real-time room cards displaying Edition badge, slots (e.g. 3/4), status (Waiting/Auction), host name, and rules tags.
- Instant search by 6-character room code.
- Filter toolbar: Edition, Max Players, and "Joinable Only" toggle.
- Auto-polling / WebSocket subscription with 15s refresh interval.

### 4.4 Waiting Room (`/room/:code`)
- Prominent room code with single-click clipboard copy.
- Player roster grid with ready status, avatar frames, and ELO badges.
- Host Controls: "Start Auction" (unlocked at 2+ managers), room settings quick-edit.
- Tactical Rules Drawer: Quick reference sheet explaining bidding rules and active cards.
- Pre-match room chat box.

### 4.5 The Auction Arena (`/room/:code/auction`)
- **Left Panel (Player Reveal & Feed):**
  - Spinning position roulette with decelerating mechanical reel animation.
  - FIFA-style player card reveal (flip animation, tier glow, hexagon radar stats).
  - Terminal-style live commentary feed (bids, skips, card triggers).
- **Center Stage (The Bidding Arena):**
  - High-urgency circular SVG timer with pulse animations at $\le 5\text{s}$.
  - Massive 96px `Bebas Neue` bid counter with fire-orange scale-flash on updates.
  - Action Controls: Quick-bid increment buttons (`+1`, `+5`, `+10`), Custom Bid number input, and dynamic Skip consensus button (`Skip (2/4)`).
  - Contextual alerts: Bankruptcy banner and Transfer Ban countdown.
- **Right Panel (Command Roster):**
  - Real-time manager list sorted by remaining budget.
  - 11-slot formation matrix per manager indicating acquired positions and player ratings.
- **Chaos Card Overlay (Full-Screen Modal):**
  - Phase 1: Chaos Siren warning with screen-edge vignette pulse.
  - Phase 2: 3D Card flip revealing card name, archetype icon, and flavor text.
  - Phase 3: Targeted execution animation (budget deduction, squad wipe, transfer ban).

### 4.6 Tactical Squad Builder (`/room/:code/squad`)
- Interactive pitch background with tactical grid overlay.
- Formation selector dropdown (4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2, etc.).
- Drag-and-drop / click-to-swap player slotting.
- Live Squad Chemistry & Overall Rating meter recalculating in real-time.
- Captaincy appointment (+5% rating boost to selected player).
- "Auto-Optimize" fallback button and 90-second lock-in timer.

### 4.7 Match Simulation Engine (`/room/:code/simulation`)
- Broadcast scoreboard header: Team names, badges, running clock (0' to 90'+), and goal indicators.
- 2D tactical pitch view with animated player radar blips displaying ball movement and attacking plays.
- Event commentary timeline:
  - ⚽ **Goals:** Screen flash, stadium cheer audio, and scoreboard scale-burst.
  - 🟨 / 🟥 **Cards:** Referee whistle audio and card popup.
  - 🧤 **Saves / Key Defenses:** Defending team pulse.
- Full-time statistical breakdown: Expected Goals (xG), Possession %, Shots on Target, Squad Chemistry impact.

### 4.8 The Climax: Results & Awards Screen (`/room/:code/results`)
- **Victory Podium:** Winner spotlight, gold gradient banner, and canvas confetti explosion.
- **Final Standings Table:** Placements (1st–4th), Manager Avatars, Squad OVR, Match Score, and ELO Points delta ($\pm \Delta$).
- **Endgame Accolades:**
  - 💰 *Best Value Pick:* Highest rated player acquired for lowest CP.
  - 🔫 *Biggest Robbery:* Winner with lowest net expenditure.
  - 💸 *Overpaid Manager:* Highest average spend per rating point.
  - 🎲 *Chaos Magnet:* Manager struck by the most chaos cards.
  - 🛡️ *Clean Sheet Shield:* Best defensive rating in simulation.
  - 🚀 *Attack of the Match:* Highest goal tally.
- **Viral Result Card Generator:** Client-side canvas snapshot generating a sleek, downloadable PNG with match summary and QR/challenge link.
- **Rematch & Exit Navigation:** Instant room rematch loop.

---

## 5. Core Gameplay, Game Modes & Mechanics Engine

### 5.1 Game Loop Mechanics
1. **Reveal Round:** Position randomly selected $\rightarrow$ player card flipped.
2. **Bidding Window:** Base 10-second timer. Each bid resets timer to 8s (anti-sniping).
3. **Consensus Skip:** If all active managers hit "Skip", round closes immediately.
4. **Resolution:** High bidder pays CP $\rightarrow$ player assigned to roster slot.
5. **Disruption Injection:** Every 3–4 rounds, roll for Chaos/Finance card trigger.
6. **Squad Lock:** 11 players acquired per manager or bankruptcy auto-fill $\rightarrow$ Formation phase.
7. **Simulation & Resolution:** Weighted simulator determines match winner.

### 5.2 Game Mode Catalog
1. **Standard War (Core):** 2–4 players, 11 rounds, full chaos & finance cards, 120 CP budget.
2. **Quick Draft:** 6-player squads (1 GK + 5 Outfield), 60 CP budget, 8s timer (~10 min total).
3. **Solo Draft Challenge:** Daily rotating player pool; single-player puzzle mode to maximize squad rating under strict CP limits; asynchronous daily leaderboard.
4. **Blind Draft:** Player attributes masked during auction (only name and position shown); stats unveiled post-purchase.
5. **All-In Arena:** Skip button disabled; every revealed player must be bought; forces extreme budgeting discipline.
6. **Head-to-Head (1v1):** Streamlined two-player duel with aggressive card targeting.
7. **Custom Tournament Pools (Future):** Host selects 20 specific curated players.
8. **Versus AI (Future):** Offline/single-player training against bot managers (Aggressive, Saver, Balanced).
9. **Draft Leagues (Future):** 8-manager double-elimination tournament brackets.
10. **Themed Live Events (Future):** Real-world tournament tie-ins (e.g. "Champions Week") with exclusive pools and cards.

---

## 6. Progression, Personalization & Economy

### 6.1 Progression Systems
- **ELO Engine:** K-factor based rating system adjusting for match placement, opponent ratings, and final goal margin. Tiers:
  - Bronze ($<1000$)
  - Silver ($1000–1299$)
  - Gold ($1300–1599$)
  - Platinum ($1600–1899$)
  - Diamond ($1900–2199$)
  - Elite ($2200+$)
- **Manager Level & XP:** Level 1–100 track. XP awarded for bids placed (+5), players won (+20), chaos cards survived (+25), and podium finishes (+150 for 1st).
- **Achievements (50+ Trophies):** "The Bargain Hunter", "Chaos Proof", "Invincible Streak", "Centurion Spend".
- **Hall of Fame:** Permanent showcase on profile for the highest-rated squad ever drafted.

### 6.2 Personalization & Cosmetics
- **Avatar Frames:** Dynamic borders (Neon, Gold Gilded, Flame, Chaos Matrix).
- **Manager Titles:** Displayed beside username (e.g. *The Tactician*, *Chaos Incarnate*, *The Bankbreaker*).
- **War Room Themes:** Visual styles for hosted rooms (Tactical Bunker, Neon Arena, Classic Stadium, Midnight Gold).
- **Card Back Customization:** Custom 3D reverse textures during card flips.
- **Audio Soundpacks:** Distinct gavel and UI feedback tones.

### 6.3 Economy Architecture (Zero Pay-to-Win)
- **DraftCoins (Soft Currency):** Earned strictly through matches, daily challenges, and achievements. Spent on cosmetic shop items.
- **Fair Play Guarantee:** Real money cannot buy in-game budget (CP), player advantages, or card immunities.

---

## 7. Social, Virality & Retention Systems

### 7.1 Virality Engine
- **One-Tap Share Cards:** Auto-generated match graphics with manager squad, final placement, and "Challenge Me" deep link.
- **Rematch Invites:** Direct room recreation with identical competitors from the results screen.
- **Global & Friends Leaderboards:** Real-time top 100 ELO rankings with weekly reward badges.
- **Spectator Mode:** Non-participating users can watch auctions live via shareable observer link.

### 7.2 Retention Loops
- **Daily:** Solo Draft Challenge (resets midnight UTC) + Daily Streak Bonus.
- **Weekly:** 5-Mission quest pack (e.g. "Win 3 auctions with $<10$ CP remaining").
- **Seasonal:** 3-month Season Passes featuring 50 cosmetic tiers and soft ELO resets.
- **Re-engagement:** "Welcome Back Manager" bonus package triggered after 7+ days of inactivity.

---

## 8. Audio & Motion Design Framework

### 8.1 Sound Identity
- Broadcast-grade sports atmosphere meets electronic trading floor.
- **SFX Trigger Catalog:**
  - `bid_placed`: Sharp, tactile click.
  - `bid_outbid`: Descending audio cue + haptic shake.
  - `timer_urgent`: Heartbeat pulse at $\le 5\text{s}$.
  - `auction_sold`: Heavy auction gavel slam + stadium murmur.
  - `chaos_warning`: Deep sub-bass drop and electrical crackle.
  - `goal_scored`: Explosive crowd roar.
  - `match_victory`: Brass-heavy victory fanfare.
- User controls: Master, SFX, and Ambient sliders; all audio opt-in on initial launch.

### 8.2 Motion Design Principles
- Transitions adhere to standard Material cubic bezier: `cubic-bezier(0.2, 0, 0.2, 1)`.
- UI micro-interactions $\le 150\text{ms}$; dramatic reveals (card flip, chaos) $400–600\text{ms}$.
- Spring-physics animations for badge awards, medals, and podium reveals.

---

## 9. Technical & Information Architecture

### 9.1 Stack Specifications
- **Client:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas API (share cards).
- **Client State:** Zustand (persisted player session, preferences), TanStack React Query (remote profiles, leaderboards).
- **Real-Time Layer:** Socket.IO Client with typed events from `@chaos/shared` and centralized `SocketContext` singleton.
- **Backend:** Node.js, Express, Socket.IO Server, TypeScript.
- **State Store (Ephemeral):** Redis (Rooms, auction rounds, timers, skip tallies, public room index).
- **Persistent Database:** PostgreSQL with Drizzle ORM (Users, match history, ELO, achievements, cosmetic inventory).
- **Deployment & DevOps:** Docker, Turborepo, GitHub Actions CI/CD.

### 9.2 Database Schema Plan (PostgreSQL)
```typescript
// users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 32 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url'),
  eloRating: integer('elo_rating').notNull().default(1200),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  draftCoins: integer('draft_coins').notNull().default(100),
  equippedFrame: varchar('equipped_frame', { length: 64 }),
  equippedTitle: varchar('equipped_title', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// matches table
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomCode: varchar('room_code', { length: 12 }).notNull(),
  edition: varchar('edition', { length: 32 }).notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  playedAt: timestamp('played_at').defaultNow().notNull(),
  summaryData: jsonb('summary_data').notNull(), // Full squads, awards, goals
});

// match_participants table
export const matchParticipants = pgTable('match_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  placement: integer('placement').notNull(),
  eloDelta: integer('elo_delta').notNull(),
  xpEarned: integer('xp_earned').notNull(),
  totalSpent: integer('total_spent').notNull(),
  squadOvr: integer('squad_ovr').notNull(),
});
```

---

## 10. Complete Phase-by-Phase Roadmap

### 🏁 Phase 1 — Core Product & Brand Revamp (Weeks 1–6)
*Objective: Transform MVP into a complete, standalone, bug-free, deployable product with original DraftWar identity.*
- [x] Brand identity overhaul (Bebas Neue, Barlow, Inter, JetBrains Mono; Void/Fire/Gold tokens).
- [x] Complete overhaul of `LobbyPage.tsx` into branded Hub + Public Room Browser.
- [x] Interactive Room Creation Modal with full parameter customization.
- [x] Overhaul `WaitingRoomPage.tsx` with room code copy, player status, and host start controls.
- [x] Redesign `AuctionRoomPage.tsx` with circular timer, 96px bid counter, and mobile responsiveness.
- [x] Overhaul `SimulationPage.tsx` with scoreboard and live event highlights.
- [x] Complete rebuild of `ResultsPage.tsx` with winner hero, standings, match awards, and share mock.
- [x] Backend room endpoints (`GET /lobby/rooms`, `GET /rooms/:code/results`).
- [x] Database match persistence (PostgreSQL schema + repository: `match.service.ts`).
- [x] ELO calculation service and player history (`elo.service.ts`).
- [x] Profile page revamp with match records (`ProfilePage.tsx`).
- [x] Centralized Socket Context with auto-reconnection (`SocketContext.tsx`).
- [x] Onboarding intro modal (`OnboardingModal.tsx`).
- [x] Auth token refresh interceptor with queueing (`api.ts`).

### 🚀 Phase 2 — Premium V1 & Solo/Progression Systems (Weeks 7–12)
*Objective: Build retention hooks, progression layers, and solo playability.*
- [ ] Solo Daily Draft Challenge mode (asynchronous solo puzzle with daily leaderboard).
- [ ] 50+ Achievement tracking system with unlock toasts.
- [ ] Manager Level & XP progression engine (Levels 1–100).
- [ ] Cosmetics locker: Avatar frames and Manager titles.
- [ ] Dynamic Client-side Result Share Card canvas generator.
- [ ] Web Audio API sound effects framework with volume mixer.
- [ ] Spectator mode for live auctions.
- [ ] Guest play mode (instant one-session trial).

### 📈 Phase 3 — Growth, Social & Competitive (Weeks 13–20)
*Objective: Scale social network effects, competitive play, and virality.*
- [ ] Friends system: Add/remove friends, online statuses, direct challenge links.
- [ ] Global Top 100 Leaderboards and Friends Leaderboard.
- [ ] Season 1 Competitive Launch with rank tiers and soft resets.
- [ ] New Modes: Quick Draft (6-man teams) and Blind Draft.
- [ ] In-game notification center for challenge alerts and friend activity.
- [ ] Push notifications & PWA installation manifest.

### 💎 Phase 4 — Monetization & Economy (Weeks 21–28)
*Objective: Sustainable revenue generation with zero pay-to-win mechanics.*
- [ ] DraftCoins soft currency balance and reward mechanics.
- [ ] 50-Tier Season Pass (Free & Premium tracks).
- [ ] Rotating Cosmetic Store (avatar frames, themes, card backs, sound packs).
- [ ] Stripe checkout integration for season passes and cosmetic bundles.
- [ ] Optional rewarded ads (extra daily challenge attempt, XP multipliers).

### 🌌 Phase 5 — Platform, Ecosystem & Long-Term Expansion (Month 7+)
*Objective: Transform DraftWar into the premier digital football auction platform.*
- [ ] Intelligent AI managers with configurable bidding personalities for offline play.
- [ ] Community tournament bracket engine (up to 64 managers).
- [ ] Auction Replay Viewer.
- [ ] Native Mobile App (React Native or Capacitor PWA).
- [ ] Real-world matchday live data synchronization.
- [ ] Club/Clan wars system for team-based auction leagues.
