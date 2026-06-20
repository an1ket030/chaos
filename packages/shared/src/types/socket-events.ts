import type { RoomState, PlayerState, FinalizedSquad, PublicRoom } from './room';
import type { Player, Position } from './player';
import type { CardEffect, ChaosCardType, FinanceCardType } from './cards';

// ============================================================
// SERVER → CLIENT EVENTS (emitted by server)
// ============================================================

export interface ServerToClientEvents {
  // Room lifecycle
  'room:created': (data: { roomId: string; code: string; settings: import('./room').RoomSettings }) => void;
  'room:joined': (data: { userId: string; username: string; avatarUrl: string }) => void;
  'room:player_left': (data: { userId: string; username: string }) => void;
  'room:state': (data: RoomState) => void;
  'room:start': (data: { roomId: string; players: PlayerState[]; settings: import('./room').RoomSettings }) => void;
  'room:chat': (data: { senderId: string; username: string; avatarUrl: string; message: string; timestamp: number }) => void;
  'room:system_msg': (data: { message: string; type: 'info' | 'chaos' | 'sold' | 'warning' | 'bankruptcy' }) => void;
  'room:error': (data: { message: string }) => void;

  // Auction — system-driven flow
  'system:wheel_spin': (data: { availablePositions: Position[] }) => void;
  'system:position_land': (data: { position: Position }) => void;
  'system:player_reveal': (data: { player: Player }) => void;
  'system:bid_open': (data: { playerId: string; playerName: string; startBid: number; timer: number }) => void;
  'system:round_start': (data: { round: number; totalRounds: number }) => void;

  // Bidding
  'auction:bid_update': (data: { currentBid: number; bidderId: string; bidderUsername: string; timeLeft: number }) => void;
  'auction:sold': (data: { playerId: string; playerName: string; winnerId: string; winnerUsername: string; finalPrice: number }) => void;
  'auction:no_bids': (data: { playerId: string; assignedToUserId: string }) => void;
  'auction:auto_fill': (data: { userId: string; players: Player[] }) => void;
  'auction:bankruptcy': (data: { userId: string; username: string }) => void;

  // Chaos & Finance cards
  'chaos:card_trigger': (data: { type: 'chaos' | 'finance' }) => void;
  'chaos:wheel_spin': (data: { cardPool: string[] }) => void;
  'chaos:card_land': (data: { cardId: string; cardName: string; cardType: 'chaos' | 'finance' }) => void;
  'chaos:target_selected': (data: { targetUserIds: string[]; targetUsernames: string[] }) => void;
  'chaos:effect_applied': (data: { effect: CardEffect }) => void;
  'chaos:overlay_close': () => void;

  // Squad builder
  'squad:timer_update': (data: { timeLeft: number }) => void;
  'squad:player_submitted': (data: { userId: string; username: string }) => void;
  'squad:all_ready': () => void;

  // Match simulation
  'simulation:start': (data: { matchups: Array<{ teamA: string; teamB: string }> }) => void;
  'simulation:event': (data: {
    minute: number;
    type: 'goal' | 'assist' | 'yellow' | 'red' | 'save' | 'key_pass';
    teamId: string;
    playerId: string;
    playerName: string;
    detail: string;
    score: Record<string, number>;
  }) => void;
  'simulation:result': (data: {
    matchId: string;
    teamA: string;
    teamB: string;
    scoreA: number;
    scoreB: number;
    stats: Record<string, unknown>;
    potm: { playerId: string; playerName: string; teamId: string };
    winner: string | null;
  }) => void;
  'simulation:tournament_result': (data: {
    winner: string;
    winnerUsername: string;
    allResults: unknown[];
    awards: unknown;
  }) => void;

  // Player state updates
  'player:state_update': (data: { players: PlayerState[] }) => void;
}

// ============================================================
// CLIENT → SERVER EVENTS (emitted by client)
// ============================================================

export interface ClientToServerEvents {
  // Room
  'room:join': (data: { code: string; token: string }, callback: (result: { success: boolean; room?: RoomState; error?: string }) => void) => void;
  'room:leave': () => void;
  'room:start_game': (callback: (result: { success: boolean; error?: string }) => void) => void;
  'room:chat': (data: { message: string }) => void;

  // Bidding (player-initiated)
  'auction:bid': (data: { amount: number }, callback: (result: { success: boolean; error?: string }) => void) => void;

  // Squad builder
  'squad:finalize': (data: FinalizedSquad, callback: (result: { success: boolean; error?: string }) => void) => void;
}

// ============================================================
// SERVER-SIDE SOCKET DATA
// ============================================================

export interface SocketData {
  userId: string;
  username: string;
  avatarUrl: string;
  roomCode: string | null;
}

// ============================================================
// INTER-SERVER EVENTS (Socket.IO adapter, for scaling)
// ============================================================

export interface InterServerEvents {
  ping: () => void;
}
