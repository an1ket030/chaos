# Chaos Club Auction ⚡

> The ultimate real-time multiplayer football squad auction game.

## What is Chaos?

Chaos Club Auction is a multiplayer game where players compete in live auctions to build the best football squad, then simulate a match to see who wins.

### Game Flow
1. **Lobby** — Create or join a room with a 6-character code
2. **Live Auction** — Bid on real footballers with your starting budget (CP)
3. **Squad Builder** — Arrange your bought players into a formation
4. **Match Simulation** — The Chaos Match Engine simulates the match live
5. **Results** — See who won, goals, assists, awards and stats

### Features
- ⚡ Real-time bidding with live countdowns
- 🎴 Chaos Cards — random events that shake up the auction
- ⏭️ Skip mechanic — all players must skip to pass on a footballer
- 🏗️ Formation builder with chemistry & overall rating
- 🏆 Live match simulation with play-by-play events
- 📊 Post-match awards (Best Value, Biggest Robbery, etc.)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Socket.IO + Express |
| Database | PostgreSQL |
| Cache / State | Redis |
| Monorepo | pnpm + Turborepo |

## Running Locally

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/an1ket030/chaos.git
cd chaos

# 2. Install dependencies
pnpm install

# 3. Copy env file and fill in secrets
cp .env.example apps/server/.env

# 4. Start PostgreSQL + Redis
docker-compose up -d

# 5. Start everything
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) — use a normal + incognito window to simulate two players.

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

---

Built with ❤️ and chaos.
