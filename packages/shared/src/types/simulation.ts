export interface SimPlayer {
  id: string;
  name: string;
  position: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  club: string;
  nationality: string;
}

export interface SimTeam {
  userId: string;
  username: string;
  players: SimPlayer[];
  formation: string;
  captain: string;        // playerId
  overallRating: number;
  chemistry: number;
}

export interface SimEvent {
  minute: number;
  type: 'goal' | 'assist' | 'yellow' | 'red' | 'save' | 'key_pass' | 'kickoff' | 'halftime' | 'fulltime';
  teamId: string;
  playerId: string;
  playerName: string;
  detail: string;
}

export interface MatchResult {
  matchId: string;
  teamA: SimTeam;
  teamB: SimTeam;
  scoreA: number;
  scoreB: number;
  events: SimEvent[];
  stats: {
    possession: [number, number];
    shots: [number, number];
    shotsOnTarget: [number, number];
    corners: [number, number];
  };
  potm: {
    playerId: string;
    playerName: string;
    teamId: string;
  };
  winner: string | null;  // userId or null for draw
}

export interface TournamentResult {
  matches: MatchResult[];
  winner: string | null;
  winnerUsername: string | null;
  awards: {
    mostExpensiveBuy: { playerName: string; cp: number; buyerUsername: string } | null;
    bestValuePick: { playerName: string; rating: number; cp: number; ratio: number; buyerUsername: string } | null;
    biggestRobbery: { playerName: string; baseValue: number; paidPrice: number; buyerUsername: string } | null;
    chaosMagnet: { username: string; chaosCardsReceived: number } | null;
    bankruptManager: { username: string } | null;
  };
}
