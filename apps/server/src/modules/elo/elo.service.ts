/**
 * DRAFTWAR — ELO Rating Engine
 * 
 * Computes multi-player pairwise ELO rating adjustments based on tournament standings.
 */

export interface PlayerEloInput {
  userId: string;
  username: string;
  currentElo: number;
  placement: number; // 1 = 1st, 2 = 2nd, etc.
}

export interface PlayerEloResult {
  userId: string;
  username: string;
  oldElo: number;
  newElo: number;
  delta: number;
  placement: number;
}

const BASE_K_FACTOR = 32;
const MINIMUM_ELO = 100;

/**
 * Calculates expected score between two players using standard logistic curve:
 * E_A = 1 / (1 + 10 ^ ((R_B - R_A) / 400))
 */
export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculates multiplayer ELO changes using pairwise decomposition.
 * Each player plays a virtual 1v1 match against every other participant.
 */
export function calculateMultiplayerElo(players: PlayerEloInput[]): PlayerEloResult[] {
  const n = players.length;
  if (n <= 1) {
    return players.map((p) => ({
      userId: p.userId,
      username: p.username,
      oldElo: p.currentElo,
      newElo: p.currentElo,
      delta: 0,
      placement: p.placement,
    }));
  }

  // Adjusted K-factor scaled for multiplayer pairwise matches
  const k = BASE_K_FACTOR / (n - 1);

  const deltas: Record<string, number> = {};
  for (const p of players) {
    deltas[p.userId] = 0;
  }

  // Pairwise comparisons
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const playerA = players[i];
      const playerB = players[j];

      const expectedA = calculateExpectedScore(playerA.currentElo, playerB.currentElo);
      const expectedB = 1 - expectedA;

      // Actual score based on placement: lower placement number = better finish
      let actualA = 0.5;
      let actualB = 0.5;

      if (playerA.placement < playerB.placement) {
        actualA = 1.0;
        actualB = 0.0;
      } else if (playerA.placement > playerB.placement) {
        actualA = 0.0;
        actualB = 1.0;
      }

      const deltaA = k * (actualA - expectedA);
      const deltaB = k * (actualB - expectedB);

      deltas[playerA.userId] += deltaA;
      deltas[playerB.userId] += deltaB;
    }
  }

  return players.map((p) => {
    const rawDelta = Math.round(deltas[p.userId] || 0);
    const oldElo = p.currentElo;
    const newElo = Math.max(MINIMUM_ELO, oldElo + rawDelta);
    return {
      userId: p.userId,
      username: p.username,
      oldElo,
      newElo,
      delta: newElo - oldElo,
      placement: p.placement,
    };
  });
}

/**
 * Maps an ELO rating to a competitive tier title.
 */
export function getEloTier(elo: number): { tier: string; color: string } {
  if (elo >= 2200) return { tier: 'Elite', color: '#E8B84B' };
  if (elo >= 1900) return { tier: 'Diamond', color: '#9B5DE5' };
  if (elo >= 1600) return { tier: 'Platinum', color: '#3D8EFF' };
  if (elo >= 1300) return { tier: 'Gold', color: '#F1C40F' };
  if (elo >= 1000) return { tier: 'Silver', color: '#BDC3C7' };
  return { tier: 'Bronze', color: '#CD7F32' };
}
