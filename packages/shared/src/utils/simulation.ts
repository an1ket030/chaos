import type { SimTeam, MatchResult, SimEvent } from '../types/simulation';

// ============================================================
// ATTACK SCORE
// ============================================================
function attackScore(team: SimTeam): number {
  const attackers = team.players.filter((p) =>
    ['ST', 'LW', 'RW', 'CAM', 'CM'].includes(p.position)
  );
  if (attackers.length === 0) return 50;
  const avg = attackers.reduce((sum, p) => {
    return sum +
      p.shooting * 0.35 +
      p.dribbling * 0.25 +
      p.pace * 0.20 +
      p.passing * 0.20;
  }, 0) / attackers.length;
  return Math.round(avg);
}

// ============================================================
// DEFENSE SCORE
// ============================================================
function defenseScore(team: SimTeam): number {
  const defenders = team.players.filter((p) =>
    ['GK', 'LB', 'RB', 'CB', 'CDM'].includes(p.position)
  );
  if (defenders.length === 0) return 50;
  const avg = defenders.reduce((sum, p) => {
    return sum +
      p.defending * 0.40 +
      p.physical * 0.30 +
      p.pace * 0.20 +
      (p.position === 'GK' ? 80 : p.defending) * 0.10;
  }, 0) / defenders.length;
  return Math.round(avg);
}

// ============================================================
// TEAM STRENGTH
// ============================================================
function teamStrength(team: SimTeam): number {
  const atk = attackScore(team);
  const def = defenseScore(team);
  const captain = team.players.find((p) => p.id === team.captain);
  const captainBonus = captain ? (captain.rating / 99) * 3 : 0;
  const chemBonus = (team.chemistry / 100) * 5;
  return atk * 0.55 + def * 0.45 + chemBonus + captainBonus;
}

// ============================================================
// POISSON RANDOM VARIABLE
// ============================================================
function poissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

// ============================================================
// WEIGHTED RANDOM PICK
// ============================================================
function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ============================================================
// GENERATE MATCH EVENTS
// ============================================================
function generateEvents(
  teamA: SimTeam,
  teamB: SimTeam,
  goalsA: number,
  goalsB: number,
): SimEvent[] {
  const events: SimEvent[] = [];
  const scoreA = { score: 0 };
  const scoreB = { score: 0 };

  // Goal minutes (spread across 90)
  const usedMinutes = new Set<number>();
  function pickMinute(): number {
    let m: number;
    do { m = Math.floor(Math.random() * 90) + 1; } while (usedMinutes.has(m));
    usedMinutes.add(m);
    return m;
  }

  // Attackers for goal scoring
  const attackersA = teamA.players.filter((p) => ['ST', 'LW', 'RW', 'CAM', 'CM'].includes(p.position));
  const attackersB = teamB.players.filter((p) => ['ST', 'LW', 'RW', 'CAM', 'CM'].includes(p.position));
  const midA = teamA.players.filter((p) => ['CM', 'CAM', 'CDM'].includes(p.position));
  const midB = teamB.players.filter((p) => ['CM', 'CAM', 'CDM'].includes(p.position));
  const outfieldA = teamA.players.filter((p) => p.position !== 'GK');
  const outfieldB = teamB.players.filter((p) => p.position !== 'GK');
  const gkA = teamA.players.find((p) => p.position === 'GK');
  const gkB = teamB.players.find((p) => p.position === 'GK');

  // Generate goals for A
  for (let i = 0; i < goalsA; i++) {
    const minute = pickMinute();
    const scorer = attackersA.length > 0
      ? weightedPick(attackersA, attackersA.map((p) => p.shooting))
      : teamA.players[0];
    const assist = midA.length > 0
      ? weightedPick(midA, midA.map((p) => p.passing))
      : null;
    scoreA.score++;
    events.push({
      minute,
      type: 'goal',
      teamId: teamA.userId,
      playerId: scorer.id,
      playerName: scorer.name,
      detail: assist
        ? `⚽ GOAL! ${scorer.name} (assist: ${assist.name}) — ${teamA.username} leads ${scoreA.score}-${scoreB.score}`
        : `⚽ GOAL! ${scorer.name} — ${teamA.username} leads ${scoreA.score}-${scoreB.score}`,
    });
  }

  // Generate goals for B
  for (let i = 0; i < goalsB; i++) {
    const minute = pickMinute();
    const scorer = attackersB.length > 0
      ? weightedPick(attackersB, attackersB.map((p) => p.shooting))
      : teamB.players[0];
    const assist = midB.length > 0
      ? weightedPick(midB, midB.map((p) => p.passing))
      : null;
    scoreB.score++;
    events.push({
      minute,
      type: 'goal',
      teamId: teamB.userId,
      playerId: scorer.id,
      playerName: scorer.name,
      detail: assist
        ? `⚽ GOAL! ${scorer.name} (assist: ${assist.name}) — ${teamB.username} leads ${scoreB.score}-${scoreA.score}`
        : `⚽ GOAL! ${scorer.name} — ${teamB.username} leads ${scoreB.score}-${scoreA.score}`,
    });
  }

  // Yellow cards (8% chance per player)
  for (const player of outfieldA) {
    if (Math.random() < 0.08) {
      const minute = pickMinute();
      events.push({
        minute,
        type: 'yellow',
        teamId: teamA.userId,
        playerId: player.id,
        playerName: player.name,
        detail: `🟨 Yellow card — ${player.name} (${teamA.username})`,
      });
    }
  }
  for (const player of outfieldB) {
    if (Math.random() < 0.08) {
      const minute = pickMinute();
      events.push({
        minute,
        type: 'yellow',
        teamId: teamB.userId,
        playerId: player.id,
        playerName: player.name,
        detail: `🟨 Yellow card — ${player.name} (${teamB.username})`,
      });
    }
  }

  // Red card (2% total)
  if (Math.random() < 0.02) {
    const allOutfield = [...outfieldA, ...outfieldB];
    const victim = allOutfield[Math.floor(Math.random() * allOutfield.length)];
    const isTeamA = outfieldA.includes(victim);
    const minute = pickMinute();
    events.push({
      minute,
      type: 'red',
      teamId: isTeamA ? teamA.userId : teamB.userId,
      playerId: victim.id,
      playerName: victim.name,
      detail: `🟥 Red card — ${victim.name} (${isTeamA ? teamA.username : teamB.username}) sent off!`,
    });
  }

  // GK saves
  if (gkA && goalsB > 0) {
    events.push({
      minute: 45,
      type: 'save',
      teamId: teamA.userId,
      playerId: gkA.id,
      playerName: gkA.name,
      detail: `🧤 Great save by ${gkA.name}!`,
    });
  }
  if (gkB && goalsA > 0) {
    events.push({
      minute: 55,
      type: 'save',
      teamId: teamB.userId,
      playerId: gkB.id,
      playerName: gkB.name,
      detail: `🧤 Great save by ${gkB.name}!`,
    });
  }

  // Sort by minute
  events.sort((a, b) => a.minute - b.minute);
  return events;
}

// ============================================================
// POTM CALCULATION
// ============================================================
function calculatePOTM(
  events: SimEvent[],
  teamA: SimTeam,
  teamB: SimTeam,
): { playerId: string; playerName: string; teamId: string } {
  const contributions: Record<string, { count: number; playerId: string; playerName: string; teamId: string }> = {};

  for (const event of events) {
    if (event.type === 'goal' || event.type === 'save') {
      const key = event.playerId;
      if (!contributions[key]) {
        contributions[key] = {
          count: 0,
          playerId: event.playerId,
          playerName: event.playerName,
          teamId: event.teamId,
        };
      }
      contributions[key].count += event.type === 'goal' ? 2 : 1;
    }
  }

  // Find highest rating as tiebreaker
  const allPlayers = [...teamA.players, ...teamB.players];
  const topContributor = Object.values(contributions).sort((a, b) => b.count - a.count)[0];

  if (topContributor) return topContributor;

  // Fallback: highest-rated player from both teams
  const best = allPlayers.sort((a, b) => b.rating - a.rating)[0];
  const isTeamA = teamA.players.includes(best);
  return {
    playerId: best.id,
    playerName: best.name,
    teamId: isTeamA ? teamA.userId : teamB.userId,
  };
}

// ============================================================
// SIMULATE A SINGLE MATCH
// ============================================================
export function simulateMatch(teamA: SimTeam, teamB: SimTeam): MatchResult {
  const strengthA = teamStrength(teamA);
  const strengthB = teamStrength(teamB);

  // Expected goals
  let lambdaA = (strengthA / strengthB) * 1.3;
  let lambdaB = (strengthB / strengthA) * 1.3;
  lambdaA = Math.min(Math.max(lambdaA, 0.3), 3.5);
  lambdaB = Math.min(Math.max(lambdaB, 0.3), 3.5);

  let goalsA = poissonRandom(lambdaA);
  let goalsB = poissonRandom(lambdaB);

  // 15% upset multiplier
  if (strengthA > strengthB && Math.random() < 0.15) goalsB += 1;
  if (strengthB > strengthA && Math.random() < 0.15) goalsA += 1;

  const events = generateEvents(teamA, teamB, goalsA, goalsB);
  const potm = calculatePOTM(events, teamA, teamB);

  const shotsA = goalsA + Math.floor(Math.random() * 6);
  const shotsB = goalsB + Math.floor(Math.random() * 6);
  const possA = Math.floor(40 + Math.random() * 20);

  return {
    matchId: `${teamA.userId}_vs_${teamB.userId}_${Date.now()}`,
    teamA,
    teamB,
    scoreA: goalsA,
    scoreB: goalsB,
    events,
    stats: {
      possession: [possA, 100 - possA],
      shots: [shotsA, shotsB],
      shotsOnTarget: [goalsA + Math.floor(shotsA * 0.4), goalsB + Math.floor(shotsB * 0.4)],
      corners: [Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)],
    },
    potm,
    winner: goalsA > goalsB ? teamA.userId : goalsB > goalsA ? teamB.userId : null,
  };
}

// ============================================================
// CHEMISTRY CALCULATOR
// ============================================================
export function calculateChemistry(
  players: Array<{ nationality: string; club: string; position: string; naturalPosition: string }>,
): number {
  let chemistry = 50; // Base

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      if (players[i].nationality === players[j].nationality) chemistry += 5;
      if (players[i].club === players[j].club) chemistry += 3;
    }
    if (players[i].position !== players[i].naturalPosition) chemistry -= 5;
  }

  return Math.min(Math.max(chemistry, 0), 100);
}

// ============================================================
// ELO CALCULATION
// ============================================================
export function calculateEloChange(
  winnerElo: number,
  loserElo: number,
  K = 32,
): { winnerChange: number; loserChange: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const winnerChange = Math.round(K * (1 - expectedWinner));
  const loserChange = -winnerChange;
  return { winnerChange, loserChange };
}
