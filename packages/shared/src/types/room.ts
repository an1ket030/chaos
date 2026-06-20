import type { Player, Position } from './player';

export type RoomStatus = 'WAITING' | 'SPINNING' | 'REVEALING' | 'BIDDING' | 'CHAOS' | 'SQUAD_BUILDER' | 'SIMULATION' | 'RESULTS';

export type RoomVisibility = 'public' | 'private';

export type GameMode = 'ffa' | 'team';

export type EditionSlug =
  | 'world-cup'
  | 'champions-league'
  | 'premier-league'
  | 'la-liga'
  | 'bundesliga'
  | 'all-time-legends'
  | 'custom';

export interface RoomSettings {
  edition: EditionSlug;
  startingBudget: number;      // 80–200 CP
  maxPlayers: 2 | 3 | 4;
  mode: GameMode;
  chaosCardsEnabled: boolean;
  financeCardsEnabled: boolean;
  bidTimer: 8 | 10 | 15;       // seconds
  visibility: RoomVisibility;
}

export interface SquadSlot {
  position: Position;
  player: Player | null;
  purchasePrice: number;
  isSystemPick: boolean;
}

export type TransferBanStatus = {
  active: boolean;
  roundsRemaining: number;
};

export interface PlayerState {
  userId: string;
  username: string;
  avatarUrl: string;
  budget: number;
  squad: SquadSlot[];           // 11 slots
  filledSlots: number;
  isBankrupt: boolean;
  transferBan: TransferBanStatus;
  chaosCardsReceived: number;
  isConnected: boolean;
}

export interface ActiveBid {
  playerId: string;
  currentBid: number;
  currentBidderId: string | null;
  currentBidderUsername: string | null;
  timeLeft: number;
  isOpen: boolean;
  skips: string[];
}

export interface RoomState {
  roomId: string;
  code: string;                  // 6-char
  creatorId: string;
  settings: RoomSettings;
  status: RoomStatus;
  players: PlayerState[];
  round: number;
  totalRounds: number;
  currentPosition: Position | null;
  currentPlayer: Player | null;
  activeBid: ActiveBid | null;
  remainingPositions: Position[];
  remainingPlayers: Player[];
  chaosCardActive: boolean;
  activeCardEffect: string | null;
  doubleBidNextRound: boolean;
  timeBombActive: boolean;
  createdAt: number;             // epoch ms
  startedAt: number | null;
  expiresAt: number;             // epoch ms (6h TTL)
}

// Formation types
export type Formation =
  | '4-3-3'
  | '4-4-2'
  | '4-2-3-1'
  | '3-5-2'
  | '5-3-2'
  | '4-1-4-1'
  | '3-4-3';

export interface FormationSlot {
  position: Position;
  x: number;  // 0-100 percentage on pitch
  y: number;  // 0-100 percentage on pitch
}

export interface FinalizedSquad {
  userId: string;
  formation: Formation;
  lineup: Array<{ slotIndex: number; playerId: string; position: Position }>;
  captain: string;              // playerId
  viceCaptain: string;          // playerId
  overallRating: number;
  chemistry: number;
}

// Lobby types
export interface PublicRoom {
  roomId: string;
  code: string;
  edition: EditionSlug;
  playerCount: number;
  maxPlayers: number;
  status: RoomStatus;
  createdAt: number;
}
