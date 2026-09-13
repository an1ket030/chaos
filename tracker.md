# 📊 DRAFTWAR — Master Phase-by-Phase Progress Tracker

> **Real-time implementation status across all development phases**  
> *Last Updated: September 2026 | Branch: `main`*

---

## 📈 Overall Progress Dashboard

| Phase | Description | Status | Completion |
|---|---|---|---|
| **Phase 1** | Core Product & Brand Revamp | 🟢 **Completed** | **100%** |
| **Phase 2** | Premium V1 & Solo/Progression | ⚪ Planned | **0%** |
| **Phase 3** | Growth, Social & Competitive | ⚪ Planned | **0%** |
| **Phase 4** | Monetization & Economy | ⚪ Planned | **0%** |
| **Phase 5** | Platform, Ecosystem & Expansion | ⚪ Planned | **0%** |

```
PHASE 1 PROGRESS: [================================] 100% (18/18 Core Modules)
OVERALL ROADMAP:  [======--------------------------] 21% (18/86 Total Milestones)
```

---

## 🏁 Phase 1: Core Product & Brand Revamp

### Status: 🟢 Completed (100% Complete)
*Goal: Transform the prototype into an independent, production-grade, commercial application.*

#### 1.1 Brand Identity & Design System
- [x] **New Brand Identity Established**
  - Project officially rechristened as **DRAFTWAR** ("Build your squad. Win the war.")
  - Complete departure from "Chaos Club" YouTube branding and lime green palette.
- [x] **Typography Stack Integrated** (`apps/client/index.html`)
  - `Bebas Neue` (display headlines, timers, bid numbers).
  - `Barlow Condensed` (headers, player cards).
  - `Inter` (body copy, buttons, UI controls).
  - `JetBrains Mono` (live financial counters, coordinates, timers).
- [x] **Tailwind & CSS Design Tokens** (`apps/client/src/index.css`, `apps/client/tailwind.config.js`)
  - `--dw-void` (`#080C12`), `--dw-surface` (`#0F1520`), `--dw-elevated` (`#161E2E`).
  - `--dw-fire` (`#FF6B2B`), `--dw-gold` (`#E8B84B`), `--dw-steel` (`#3D8EFF`).
  - `--dw-chaos` (`#9B5DE5`), `--dw-danger` (`#FF3B3B`), `--dw-success` (`#2ECC71`).
  - Custom scrollbars, glow utilities, and keyframe animations.
- [x] **Environment Configuration** (`apps/client/src/hooks/useSocket.ts`, `tsconfig.json`)
  - Eliminated hardcoded `localhost:3001` endpoints; configured dynamic `import.meta.env.VITE_SERVER_URL`.
  - Added `"vite/client"` to TypeScript compiler configuration.

#### 1.2 Authentication & Gateway
- [x] **Branded Login Page** (`apps/client/src/pages/auth/LoginPage.tsx`)
  - DraftWar tactical theme, split layout, Google OAuth button, and form feedback.
- [x] **Branded Register Page** (`apps/client/src/pages/auth/RegisterPage.tsx`)
  - Password strength, matching validation, and War Room aesthetic.
- [x] **Auth Token Refresh Interceptor** (`apps/client/src/lib/api.ts`)
  - Request queueing mechanism during token refresh to avoid race conditions.
  - Automatic token rotation (`/auth/refresh`) and graceful logout on failure.

#### 1.3 Lobby & Room Discovery
- [x] **Lobby Command Center Overhaul** (`apps/client/src/pages/lobby/LobbyPage.tsx`)
  - DraftWar navigation bar with live ELO pill, profile avatar, and status badges.
  - Public Room Browser tab displaying live joinable matches.
  - Direct 6-character room code join box.
  - Tactical Briefing onboarding launch button in header.
- [x] **Custom Room Creation Modal** (`apps/client/src/pages/lobby/LobbyPage.tsx`)
  - Visual Edition Picker: World Cup, Champions League, Premier League, La Liga, Bundesliga, Legends.
  - Match settings controls: Starting budget slider (80–200 CP), Manager count (2–4), Timer (8s, 10s, 15s).
  - Disruption engine toggles: Chaos cards on/off, Finance cards on/off.
  - Public vs Private visibility toggle.
- [x] **Backend Public Rooms Discovery** (`apps/server/src/routes/lobby.router.ts`, `room.service.ts`)
  - `GET /lobby/rooms` endpoint scanning active Redis rooms and returning sanitized public previews.

#### 1.4 Waiting Room
- [x] **Waiting Room Overhaul** (`apps/client/src/pages/waiting/WaitingRoomPage.tsx`)
  - High-visibility room code with 1-click clipboard copy.
  - Manager roster grid with ready status badges and host indicators.
  - Room settings summary pill.
  - Host "Start Auction" authorization check and trigger.

#### 1.5 Auction Arena (Core Gameplay)
- [x] **Auction Room Arena Overhaul** (`apps/client/src/pages/auction/AuctionRoomPage.tsx`)
  - 3-column tactical war room layout with mobile-responsive flex folding.
  - High-drama circular SVG countdown timer with pulsing red warning at $\le 5$s.
  - Massive 96px `Bebas Neue` live bid display with fire-orange scale-up flash.
  - Incremental bid buttons (`+1`, `+5`, `+10`) and custom bid input field.
  - Skip consensus counter with visual progress (`Skip 2/4`).
  - Real-time manager roster showing budget bars, squad filling, and bankruptcy flags.
  - Chaos card trigger overlay modal with purple radiance and card details.

#### 1.6 Match Simulation & Tactical Pitch
- [x] **Simulation Page Rebuild** (`apps/client/src/pages/simulation/SimulationPage.tsx`)
  - Live broadcast match header: team names, badges, running clock (0'–90'+), and live score.
  - 2D tactical pitch view with dynamic formation blips and ball transitions.
  - Styled match events feed for Goals, Saves, Yellow/Red Cards, and Substitutions.
  - Auto-transition to Results at final whistle.

#### 1.8 Phase 1 Feedback Overhaul & Quality Polish (Post-Test Enhancements)
- [x] **Symmetrical Lobby Command Cards** (`apps/client/src/pages/lobby/LobbyPage.tsx`)
  - Perfectly aligned Host a War and Join Battle cards with identical outer dimensions (`min-h-[360px] flex flex-col justify-between`).
  - Symmetrical icon badges (Commander & Operator pills), aligned headings, and identical button heights/styling.
- [x] **Solid Tactical Onboarding & DB Persistence** (`OnboardingModal.tsx`, `auth.service.ts`, `auth.router.ts`, `schema.sql`)
  - Completely stripped glassmorphic backdrop-blur and translucent cards; upgraded to solid dark tactical carbon panels (`#0F1520` / `#161E2E`) with fire-orange corner brackets.
  - Added `has_completed_onboarding BOOLEAN DEFAULT false` to PostgreSQL `users` table and `POST /auth/complete-onboarding` endpoint. Returning users never see onboarding again across any session or device.
- [x] **Auction Engine Natural Position Squad Slot Mapping** (`apps/server/src/modules/auction/auction.engine.ts`)
  - Fixed blind index assignment bug (`find(s => s.player === null)`).
  - Implemented `findBestEmptySlot()` with exact position matching, category matching (GK, DEF, MID, FWD), and outfield protection.
  - Auction sidebar now displays true position labels, player ratings, and purchase prices on squad slots.
- [x] **Fair & Calibrated Match Simulation Engine** (`packages/shared/src/utils/simulation.ts`, `socket.gateway.ts`)
  - Enforced severe 50% defense score penalty when playing without a genuine goalkeeper.
  - Scaled chemistry effect to dynamic $\pm 15\%$ team efficiency factor.
  - Calibrated expected goals ($\lambda$) realistically from rating differentials while removing the arbitrary 15% upset boost.
  - Lineup pitch positions mapped directly to simulation team rosters.
- [x] **Manager's XI Branding Hierarchy** (`simulation.ts`, `SimulationPage.tsx`, `ResultsPage.tsx`)
  - Full consistency across the simulation experience: "[Manager]'s XI" displayed on scoreboards, live broadcast commentary feed, winner banners, and final tournament standings.
- [x] **Tactical Character Manager Avatar System** (`apps/client/src/components/ui/Avatar.tsx`, `avatars.ts`)
  - Completely replaced letter-based colored circles with high-res tactical character portraits with cyber visors and tactical rank frames.
- [x] **Proportional 3:4 Vertical Football Pitch** (`apps/client/src/pages/squad-builder/SquadBuilderPage.tsx`)
  - Fixed oversized square horizontal pitch stretch by constraining the pitch to an authentic 3:4 vertical aspect ratio (`aspect-[3/4] h-full max-w-full mx-auto`).
- [x] **Synchronized 3-Second Kickoff Countdown Transition** (`SquadBuilderPage.tsx`, `socket.gateway.ts`)
  - When Manager 1 confirms, visual state updates to "SQUAD LOCKED · WAITING FOR RIVAL MANAGERS...".
  - When Manager 2 confirms, server emits `squad:all_ready`, triggering a synchronized 3-2-1 tactical countdown modal on all clients before navigating to simulation.
  - Server delays match event streaming by 3.5s to align seamlessly with client mount.
- [x] **Backend Match Results API** (`apps/server/src/routes/room.router.ts`, `room.service.ts`)
  - `GET /rooms/:code/results` endpoint calculating final standings, squad OVRs, and awards from Redis room state.
- [x] **Squad Finalization Dual-Path & Rate Limit Hardening** (`room.router.ts`, `socket.gateway.ts`, `SquadBuilderPage.tsx`, `App.tsx`, `SocketContext.tsx`)
  - Built `POST /rooms/:code/finalize-squad` endpoint complementing WebSocket `squad:finalize` for zero dropped submissions.
  - Eliminated global rate limiting on localhost dev routes and prevented auth token purging on non-401 responses.
  - Stabilized countdown listeners with `useRef` and established reliable 2.5s polling fallback ensuring synchronized 3s countdown transition even across transient disconnects.
- [x] **Complete Sports-Editorial Branding & Interactive Landing Page Overhaul** (`LandingPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `tailwind.config.js`, `index.css`)
  - Synthesized user's 5 moodboard references into an original, high-energy sports-editorial aesthetic (monumental display typography, dramatic player cutouts, giant numerical stats, radial radar lines, asymmetric cream paper breaks, and orange trajectory paths).
  - Built interactive 7-chapter storytelling Landing Page (`/`) featuring live interactive Bidding Arena demo (+5 CP clicks against AI counter-bidders and chaos triggers) and interactive tactical pitch.
  - Sourced and integrated high-resolution hero player and striker cutouts with zero generic placeholders.
  - Overhauled Login and Register into cohesive sports-editorial poster layouts with quick 1-click test credentials.

#### 1.8 Database, Progression & Architecture
- [x] **PostgreSQL Match Persistence** (`apps/server/src/modules/match/match.service.ts`)
  - Fully persists every completed tournament to PostgreSQL `games` and `game_participants` tables.
  - Saves room code, edition, settings, full results, awards, participant placements, OVRs, formations, and CP spent.
- [x] **Multiplayer ELO Rating Engine** (`apps/server/src/modules/elo/elo.service.ts`)
  - Pairwise logistic ELO algorithm scaled for multiplayer tournaments.
  - Computes rating adjustments and tier titles (Bronze, Silver, Gold, Platinum, Diamond, Elite).
  - Automatically updates users' lifetime ELO and stats upon tournament completion.
- [x] **Revamped Profile Page** (`apps/client/src/pages/profile/ProfilePage.tsx`)
  - Full Tactical Dossier view featuring:
    - Manager Avatar with ELO tier frame, commissioning date, and tactics.
    - 6 Core KPIs: Tournaments Won, Total Matches, Win Rate %, Best Squad OVR, Average Spend/Match, Chaos Survived.
    - Interactive Tabs: Match History list with ranks and ELO impact deltas ($\pm\Delta$), Career Achievements unlock showcase, and Combat/Financial intelligence breakdown.
- [x] **Centralized Socket Provider** (`apps/client/src/context/SocketContext.tsx`, `useSocket.ts`)
  - React Context provider with singleton socket lifecycle, connection state reactivity, and auto-reconnect.
  - Wrapped around the entire app in `App.tsx`.
- [x] **Interactive Onboarding Modal** (`apps/client/src/components/onboarding/OnboardingModal.tsx`)
  - 3-step visual swipe guide explaining Bidding Pressure, Chaos Disruption Cards, and 2D Pitch Simulation.
  - Automatically launches for new managers (stored in `localStorage['draftwar_onboarding_seen']`).
  - Accessible on-demand via the "Briefing" button in the Hub header.

---

## 🚀 Phase 2: Premium V1 & Solo/Progression Systems

### Status: ⚪ Planned (0% Complete)
*Target Timeline: Weeks 7–12*

| Task / Feature | Target File / Module | Status | Priority |
|---|---|---|---|
| **Daily Draft Challenge** (Solo puzzle mode) | `apps/client/src/pages/challenge/` | ⚪ Planned | 🔴 High |
| **50+ Achievements Engine** | `apps/server/src/modules/achievement/` | ⚪ Planned | 🟠 Medium |
| **Manager Level & XP System (1–100)** | `apps/server/src/modules/progression/` | ⚪ Planned | 🟠 Medium |
| **Dynamic Canvas Share Card PNG Generator** | `apps/client/src/utils/shareCard.ts` | ⚪ Planned | 🟠 Medium |
| **Manager Titles & Avatar Frames Locker** | `apps/client/src/pages/store/cosmetics/` | ⚪ Planned | 🟡 Medium |
| **Web Audio API Sound Effects Framework** | `apps/client/src/lib/audio.ts` | ⚪ Planned | 🟡 Medium |
| **Spectator Mode (Live View Only)** | `apps/client/src/pages/auction/Spectator.tsx` | ⚪ Planned | 🟡 Medium |
| **Guest Trial Mode (1 session without auth)** | `apps/client/src/pages/auth/GuestMode.tsx` | ⚪ Planned | 🟡 Low |

---

## 📈 Phase 3: Growth, Social & Competitive

### Status: ⚪ Planned (0% Complete)
*Target Timeline: Weeks 13–20*

| Task / Feature | Target File / Module | Status | Priority |
|---|---|---|---|
| **Friends System (Add, Remove, Activity Feed)** | `apps/server/src/modules/friend/` | ⚪ Planned | 🔴 High |
| **Global Top 100 & Friends Leaderboards** | `apps/client/src/pages/leaderboard/` | ⚪ Planned | 🔴 High |
| **Competitive Season 1 Launch (Ranked Tiers)** | `apps/server/src/modules/season/` | ⚪ Planned | 🟠 Medium |
| **Direct Challenge Invite Links** | `apps/client/src/pages/play/challengeLink.ts` | ⚪ Planned | 🟠 Medium |
| **Quick Draft Mode (6-Man Teams)** | `@chaos/shared`, `room.service.ts` | ⚪ Planned | 🟡 Medium |
| **Blind Draft Mode (Masked Attributes)** | `@chaos/shared`, `auction.service.ts` | ⚪ Planned | 🟡 Medium |
| **In-Game Notification Center** | `apps/client/src/components/notifications/` | ⚪ Planned | 🟡 Medium |
| **PWA Manifest & Mobile App Shell** | `apps/client/public/manifest.json` | ⚪ Planned | 🟡 Low |

---

## 💎 Phase 4: Monetization & Economy

### Status: ⚪ Planned (0% Complete)
*Target Timeline: Weeks 21–28*

| Task / Feature | Target File / Module | Status | Priority |
|---|---|---|---|
| **DraftCoins Soft Currency System** | `apps/server/src/modules/economy/` | ⚪ Planned | 🔴 High |
| **50-Tier Season Pass (Free & Premium Tracks)** | `apps/client/src/pages/store/SeasonPass.tsx` | ⚪ Planned | 🔴 High |
| **Stripe Payment Gateway Integration** | `apps/server/src/modules/payment/` | ⚪ Planned | 🔴 High |
| **Rotating Cosmetic Storefront** | `apps/client/src/pages/store/CosmeticStore.tsx` | ⚪ Planned | 🟠 Medium |
| **Cosmetic Theme Bundles** | `apps/server/src/modules/store/bundles.ts` | ⚪ Planned | 🟡 Medium |
| **Rewarded Video Ads Integration (Optional)** | `apps/client/src/lib/ads.ts` | ⚪ Planned | 🟡 Low |
| **Monetization Funnel Analytics** | `apps/client/src/lib/analytics.ts` | ⚪ Planned | 🟡 Low |

---

## 🌌 Phase 5: Platform, Ecosystem & Expansion

### Status: ⚪ Planned (0% Complete)
*Target Timeline: Month 7+*

| Task / Feature | Target File / Module | Status | Priority |
|---|---|---|---|
| **Intelligent AI Opponents for Solo Play** | `apps/server/src/modules/ai/` | ⚪ Planned | 🔴 High |
| **64-Manager Community Tournament Engine** | `apps/server/src/modules/tournament/` | ⚪ Planned | 🔴 High |
| **Auction Replay System & Viewer** | `apps/client/src/pages/replay/` | ⚪ Planned | 🟠 Medium |
| **Native Mobile App (React Native/Capacitor)** | `apps/mobile/` | ⚪ Planned | 🟠 Medium |
| **Live Matchday Real-World Data Sync** | `apps/server/src/jobs/playerSync.ts` | ⚪ Planned | 🟡 Medium |
| **Club/Clan Wars Guild System** | `apps/server/src/modules/club/` | ⚪ Planned | 🟡 Medium |
| **Public Developer REST / GraphQL API** | `apps/server/src/api/v1/` | ⚪ Planned | 🟡 Low |
