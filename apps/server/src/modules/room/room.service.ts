import { v4 as uuidv4 } from 'uuid';
import { setRoomState, getRoomState, deleteRoomState } from '../../config/redis';
import type { RoomState, RoomSettings, PlayerState } from '@chaos/shared';
import { PLAYERS, getPlayersForEdition, AUCTION_POSITIONS } from '@chaos/shared';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function createRoom(
  creatorId: string,
  creatorUsername: string,
  creatorAvatarUrl: string,
  settings: RoomSettings,
): Promise<RoomState> {
  const code = generateRoomCode();
  const roomId = uuidv4();

  const playerList = getPlayersForEdition(settings.edition);
  const remainingPositions = [...AUCTION_POSITIONS] as import('@chaos/shared').Position[];

  const creatorPlayerState: PlayerState = {
    userId: creatorId,
    username: creatorUsername,
    avatarUrl: creatorAvatarUrl,
    budget: settings.startingBudget,
    squad: remainingPositions.map((pos) => ({
      position: pos,
      player: null,
      purchasePrice: 0,
      isSystemPick: false,
    })),
    filledSlots: 0,
    isBankrupt: false,
    transferBan: { active: false, roundsRemaining: 0 },
    chaosCardsReceived: 0,
    isConnected: true,
  };

  const now = Date.now();
  const room: RoomState = {
    roomId,
    code,
    creatorId,
    settings,
    status: 'WAITING',
    players: [creatorPlayerState],
    round: 0,
    totalRounds: 11,
    currentPosition: null,
    currentPlayer: null,
    activeBid: null,
    remainingPositions,
    remainingPlayers: playerList,
    chaosCardActive: false,
    activeCardEffect: null,
    doubleBidNextRound: false,
    timeBombActive: false,
    createdAt: now,
    startedAt: null,
    expiresAt: now + 6 * 60 * 60 * 1000,
  };

  await setRoomState(code, room);
  return room;
}

export async function getRoom(code: string): Promise<RoomState | null> {
  return getRoomState<RoomState>(code);
}

export async function joinRoom(
  code: string,
  userId: string,
  username: string,
  avatarUrl: string,
): Promise<RoomState> {
  const room = await getRoom(code);
  if (!room) throw new Error('Room not found');
  if (room.status !== 'WAITING') throw new Error('Game already in progress');
  if (room.players.length >= room.settings.maxPlayers) throw new Error('Room is full');
  if (room.players.find((p) => p.userId === userId)) throw new Error('Already in this room');

  const newPlayer: PlayerState = {
    userId,
    username,
    avatarUrl: avatarUrl || '',
    budget: room.settings.startingBudget,
    squad: (room.remainingPositions as import('@chaos/shared').Position[]).map((pos) => ({
      position: pos,
      player: null,
      purchasePrice: 0,
      isSystemPick: false,
    })),
    filledSlots: 0,
    isBankrupt: false,
    transferBan: { active: false, roundsRemaining: 0 },
    chaosCardsReceived: 0,
    isConnected: true,
  };

  room.players.push(newPlayer);
  await setRoomState(code, room);
  return room;
}

export async function updateRoom(code: string, room: RoomState): Promise<void> {
  await setRoomState(code, room);
}

export async function removeRoom(code: string): Promise<void> {
  await deleteRoomState(code);
}

export async function setPlayerConnected(code: string, userId: string, connected: boolean): Promise<void> {
  const room = await getRoom(code);
  if (!room) return;
  const player = room.players.find((p) => p.userId === userId);
  if (player) {
    player.isConnected = connected;
    await setRoomState(code, room);
  }
}
