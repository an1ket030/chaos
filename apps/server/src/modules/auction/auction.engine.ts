import type { Server, Socket } from 'socket.io';
import type { RoomState, Player, Position, PlayerState } from '@chaos/shared';
import { getRoomState, setRoomState } from '../../config/redis';
import { shouldTriggerCard, selectCard, selectTargets, applyCardEffect } from '../chaos/chaos.engine';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@chaos/shared';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

// Active timers per room
const bidTimers = new Map<string, ReturnType<typeof setTimeout>>();
const roundTimers = new Map<string, ReturnType<typeof setTimeout>>();

async function updateAndBroadcast(io: IO, code: string, room: RoomState): Promise<void> {
  await setRoomState(code, room);
  io.to(code).emit('player:state_update', { players: room.players });
}

// ============================================================
// START AUCTION (called when creator clicks "Start Game")
// ============================================================
export async function startAuction(io: IO, code: string): Promise<void> {
  const room = await getRoomState<RoomState>(code);
  if (!room) return;

  room.status = 'SPINNING';
  room.startedAt = Date.now();
  await setRoomState(code, room);

  // Broadcast status change so clients navigate to auction page
  io.to(code).emit('room:state', room);

  io.to(code).emit('room:system_msg', {
    message: 'The auction has begun! Let the chaos begin!',
    type: 'info',
  });

  // Brief pause then spin
  setTimeout(() => startRound(io, code), 2000);
}

// ============================================================
// START A ROUND — system spins the wheel
// ============================================================
async function startRound(io: IO, code: string): Promise<void> {
  const room = await getRoomState<RoomState>(code);
  if (!room || room.remainingPositions.length === 0) {
    await endAuction(io, code);
    return;
  }

  room.status = 'SPINNING';
  room.round += 1;
  room.currentPlayer = null;
  room.activeBid = null;

  // Decrement transfer bans
  for (const player of room.players) {
    if (player.transferBan.active && player.transferBan.roundsRemaining > 0) {
      player.transferBan.roundsRemaining--;
      if (player.transferBan.roundsRemaining === 0) {
        player.transferBan.active = false;
        io.to(code).emit('room:system_msg', {
          message: `Transfer ban lifted for @${player.username}!`,
          type: 'info',
        });
      }
    }
  }

  await setRoomState(code, room);
  io.to(code).emit('room:state', room);

  io.to(code).emit('system:wheel_spin', { availablePositions: room.remainingPositions });
  io.to(code).emit('room:system_msg', {
    message: `System: Round ${room.round} — Spinning for next position...`,
    type: 'info',
  });

  // Spin duration: 3–5 seconds
  const spinDuration = 3000 + Math.random() * 2000;
  setTimeout(() => landPosition(io, code), spinDuration);
}

// ============================================================
// POSITION LANDS — system picks position
// ============================================================
async function landPosition(io: IO, code: string): Promise<void> {
  const room = await getRoomState<RoomState>(code);
  if (!room) return;

  // Pick random position from remaining
  const idx = Math.floor(Math.random() * room.remainingPositions.length);
  const position = room.remainingPositions.splice(idx, 1)[0] as Position;
  room.currentPosition = position;
  room.status = 'SPINNING';

  await setRoomState(code, room);
  io.to(code).emit('room:state', room);
  io.to(code).emit('system:position_land', { position });
  io.to(code).emit('room:system_msg', {
    message: `System: It's the ${position} slot!`,
    type: 'info',
  });

  // 1.5 second pause then reveal player
  setTimeout(() => revealPlayer(io, code, position), 1500);
}

// ============================================================
// REVEAL PLAYER — system selects player for position
// ============================================================
async function revealPlayer(io: IO, code: string, position: Position): Promise<void> {
  const room = await getRoomState<RoomState>(code);
  if (!room) return;

  // Find eligible players for this position (prefer matching position, else any)
  let eligible = room.remainingPlayers.filter((p) => p.position === position);
  if (eligible.length === 0) eligible = room.remainingPlayers;
  if (eligible.length === 0) {
    await endAuction(io, code);
    return;
  }

  const playerIdx = Math.floor(Math.random() * eligible.length);
  const player = eligible[playerIdx];

  // Remove from remaining
  room.remainingPlayers = room.remainingPlayers.filter((p) => p.id !== player.id);
  room.currentPlayer = player;
  room.status = 'REVEALING';

  await setRoomState(code, room);
  // Broadcast full state so all clients see the revealed player
  io.to(code).emit('room:state', room);

  io.to(code).emit('system:player_reveal', { player });
  io.to(code).emit('room:system_msg', {
    message: `System: ${player.name} revealed — base value ${player.baseValue} CP. Bidding opens!`,
    type: 'info',
  });

  // 2 second reveal pause then open bidding
  setTimeout(() => openBidding(io, code), 2000);
}

// ============================================================
// OPEN BIDDING
// ============================================================
async function openBidding(io: IO, code: string): Promise<void> {
  const room = await getRoomState<RoomState>(code);
  if (!room || !room.currentPlayer) return;

  // Determine starting bid
  let startBid = 1;
  if (room.doubleBidNextRound) {
    startBid = room.currentPlayer.baseValue * 2;
    room.doubleBidNextRound = false;
  }

  // Determine timer
  const timer = room.timeBombActive ? 4 : room.settings.bidTimer;
  room.timeBombActive = false;
  room.status = 'BIDDING';
  room.activeBid = {
    playerId: room.currentPlayer.id,
    currentBid: startBid,
    currentBidderId: null,
    currentBidderUsername: null,
    timeLeft: timer,
    isOpen: true,
    skips: [],
  };

  await setRoomState(code, room);
  // Broadcast full state so clients get currentPlayer + activeBid together
  io.to(code).emit('room:state', room);

  io.to(code).emit('system:bid_open', {
    playerId: room.currentPlayer.id,
    playerName: room.currentPlayer.name,
    startBid,
    timer,
  });

  startBidTimer(io, code, timer);
}

// ============================================================
// BID TIMER
// ============================================================
function startBidTimer(io: IO, code: string, seconds: number): void {
  // Clear any existing timer
  const existing = bidTimers.get(code);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => soldPlayer(io, code), seconds * 1000);
  bidTimers.set(code, timer);
}

// ============================================================
// HANDLE BID (player action)
// ============================================================
export async function handleBid(
  io: IO,
  code: string,
  userId: string,
  username: string,
  amount: number,
): Promise<{ success: boolean; error?: string }> {
  const room = await getRoomState<RoomState>(code);
  if (!room || room.status !== 'BIDDING' || !room.activeBid) {
    return { success: false, error: 'No active bidding' };
  }

  const player = room.players.find((p) => p.userId === userId);
  if (!player) return { success: false, error: 'Player not in room' };
  if (player.transferBan.active) return { success: false, error: 'You are transfer-banned' };
  if (player.budget < amount) return { success: false, error: 'Insufficient budget' };
  if (amount <= room.activeBid.currentBid) return { success: false, error: 'Bid too low' };

  room.activeBid.currentBid = amount;
  room.activeBid.currentBidderId = userId;
  room.activeBid.currentBidderUsername = username;
  room.activeBid.timeLeft = room.settings.bidTimer;

  await setRoomState(code, room);

  io.to(code).emit('auction:bid_update', {
    currentBid: amount,
    bidderId: userId,
    bidderUsername: username,
    timeLeft: room.activeBid.timeLeft,
  });

  io.to(code).emit('room:system_msg', {
    message: `@${username} bids ${amount} CP for ${room.currentPlayer?.name}!`,
    type: 'info',
  });

  // Reset timer
  startBidTimer(io, code, room.activeBid.timeLeft);
  return { success: true };
}

// ============================================================
// HANDLE SKIP (player action)
// ============================================================
export async function handleSkip(
  io: IO,
  code: string,
  userId: string,
  username: string,
): Promise<{ success: boolean; error?: string }> {
  const room = await getRoomState<RoomState>(code);
  if (!room || room.status !== 'BIDDING' || !room.activeBid) {
    return { success: false, error: 'No active bidding' };
  }

  const player = room.players.find((p) => p.userId === userId);
  if (!player) return { success: false, error: 'Player not in room' };

  if (!room.activeBid.skips.includes(userId)) {
    room.activeBid.skips.push(userId);
    await setRoomState(code, room);

    io.to(code).emit('auction:bid_update', {
      currentBid: room.activeBid.currentBid,
      bidderId: room.activeBid.currentBidderId,
      bidderUsername: room.activeBid.currentBidderUsername,
      timeLeft: room.activeBid.timeLeft,
      skips: room.activeBid.skips,
    });

    io.to(code).emit('room:system_msg', {
      message: `@${username} skipped ${room.currentPlayer?.name}.`,
      type: 'info',
    });

    if (room.activeBid.skips.length >= room.players.length) {
      // Everyone skipped. End bid immediately.
      const bidTimer = bidTimers.get(code);
      if (bidTimer) clearTimeout(bidTimer);
      await skippedPlayer(io, code, room);
    }
  }

  return { success: true };
}

// ============================================================
// SKIPPED! — Everyone skipped
// ============================================================
async function skippedPlayer(io: IO, code: string, room: RoomState): Promise<void> {
  bidTimers.delete(code);
  if (!room.activeBid || !room.currentPlayer) return;

  room.activeBid.isOpen = false;
  const player = room.currentPlayer;

  io.to(code).emit('room:system_msg', {
    message: `Everyone skipped! ${player.name} goes to NOBODY.`,
    type: 'warning',
  });

  room.currentPlayer = null;
  room.activeBid = null;

  await setRoomState(code, room);
  io.to(code).emit('player:state_update', { players: room.players });

  // Schedule next round or chaos card after 2 second pause
  const timer = setTimeout(async () => {
    roundTimers.delete(code);
    const freshRoom = await getRoomState<RoomState>(code);
    if (!freshRoom) return;
    if (freshRoom.remainingPositions.length === 0) {
      await endAuction(io, code);
      return;
    }
    if (
      freshRoom.settings.chaosCardsEnabled || freshRoom.settings.financeCardsEnabled
    ) {
      if (shouldTriggerCard(freshRoom.round)) {
        await triggerChaosCard(io, code, freshRoom);
        return;
      }
    }
    await startRound(io, code);
  }, 2000);
  roundTimers.set(code, timer);
}

// ============================================================
// SOLD! — timer expired
// ============================================================
async function soldPlayer(io: IO, code: string): Promise<void> {
  bidTimers.delete(code);
  const room = await getRoomState<RoomState>(code);
  if (!room || !room.activeBid || !room.currentPlayer) return;

  room.activeBid.isOpen = false;
  const player = room.currentPlayer;
  const bid = room.activeBid;

  let winnerId: string;
  let winnerUsername: string;
  let finalPrice: number;

  if (bid.currentBidderId) {
    winnerId = bid.currentBidderId;
    winnerUsername = bid.currentBidderUsername!;
    finalPrice = bid.currentBid;
  } else {
    // Nobody bid — assign to player with fewest filled slots
    const sorted = [...room.players].sort((a, b) => a.filledSlots - b.filledSlots);
    const assignee = sorted[0];
    winnerId = assignee.userId;
    winnerUsername = assignee.username;
    finalPrice = 1;
    io.to(code).emit('auction:no_bids', { playerId: player.id, assignedToUserId: winnerId });
    io.to(code).emit('room:system_msg', {
      message: `No bids! ${player.name} auto-assigned to @${winnerUsername} for 1 CP.`,
      type: 'warning',
    });
  }

  // Assign player to winner
  const winner = room.players.find((p) => p.userId === winnerId);
  if (winner) {
    winner.budget -= finalPrice;
    const emptySlot = winner.squad.find((s) => s.player === null);
    if (emptySlot) {
      emptySlot.player = player;
      emptySlot.purchasePrice = finalPrice;
      winner.filledSlots++;
    }
  }

  room.currentPlayer = null;
  room.activeBid = null;

  await setRoomState(code, room);

  io.to(code).emit('auction:sold', {
    playerId: player.id,
    playerName: player.name,
    winnerId,
    winnerUsername,
    finalPrice,
  });
  io.to(code).emit('room:system_msg', {
    message: `SOLD! ${player.name} goes to @${winnerUsername} for ${finalPrice} CP! 🏷️`,
    type: 'sold',
  });
  io.to(code).emit('player:state_update', { players: room.players });

  // Check bankruptcy
  await checkBankruptcy(io, code, room);

  // Schedule next round or chaos card after 2 second pause
  const timer = setTimeout(async () => {
    roundTimers.delete(code);
    const freshRoom = await getRoomState<RoomState>(code);
    if (!freshRoom) return;
    if (freshRoom.remainingPositions.length === 0) {
      await endAuction(io, code);
      return;
    }
    if (
      freshRoom.settings.chaosCardsEnabled || freshRoom.settings.financeCardsEnabled
    ) {
      if (shouldTriggerCard(freshRoom.round)) {
        await triggerChaosCard(io, code, freshRoom);
        return;
      }
    }
    await startRound(io, code);
  }, 2000);
  roundTimers.set(code, timer);
}

// ============================================================
// CHAOS CARD TRIGGER (system-driven)
// ============================================================
async function triggerChaosCard(io: IO, code: string, room: RoomState): Promise<void> {
  const card = selectCard(
    room.settings.chaosCardsEnabled,
    room.settings.financeCardsEnabled,
  );
  if (!card) {
    await startRound(io, code);
    return;
  }

  room.status = 'CHAOS';
  room.chaosCardActive = true;
  await setRoomState(code, room);

  io.to(code).emit('chaos:card_trigger', { type: card.type });
  io.to(code).emit('room:system_msg', {
    message: 'CHAOS CARD INCOMING... ⚡',
    type: 'chaos',
  });

  // Spin duration (system spins, players watch)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  io.to(code).emit('chaos:wheel_spin', {
    cardPool: [card.id],
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  io.to(code).emit('chaos:card_land', {
    cardId: card.id,
    cardName: card.name,
    cardType: card.type,
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Select targets
  const freshRoom = await getRoomState<RoomState>(code);
  if (!freshRoom) return;

  const targets = selectTargets(card, freshRoom);
  const targetUsernames = targets.map(
    (id) => freshRoom.players.find((p) => p.userId === id)?.username ?? id
  );

  io.to(code).emit('chaos:target_selected', { targetUserIds: targets, targetUsernames });
  io.to(code).emit('room:system_msg', {
    message: `System: ${card.name} — targeting ${targetUsernames.map((u) => `@${u}`).join(' and ')}!`,
    type: 'chaos',
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Apply effect
  const { room: updatedRoom, effect } = applyCardEffect(card, targets, freshRoom);
  updatedRoom.chaosCardActive = false;
  updatedRoom.status = 'SPINNING';
  await setRoomState(code, updatedRoom);

  io.to(code).emit('chaos:effect_applied', { effect });
  io.to(code).emit('player:state_update', { players: updatedRoom.players });
  io.to(code).emit('room:system_msg', {
    message: `System: ${card.name} applied! ${card.flavor}`,
    type: 'chaos',
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));
  io.to(code).emit('chaos:overlay_close');

  // Continue to next round
  await startRound(io, code);
}

// ============================================================
// BANKRUPTCY CHECK
// ============================================================
async function checkBankruptcy(io: IO, code: string, room: RoomState): Promise<void> {
  for (const player of room.players) {
    if (player.isBankrupt) continue;
    const remainingSlots = player.squad.filter((s) => s.player === null).length;
    if (remainingSlots === 0) continue;

    // Check if they can afford the cheapest remaining player
    const cheapest = room.remainingPlayers.reduce(
      (min, p) => Math.min(min, p.baseValue),
      Infinity,
    );
    if (player.budget < cheapest && player.budget < 1) {
      player.isBankrupt = true;
      io.to(code).emit('auction:bankruptcy', {
        userId: player.userId,
        username: player.username,
      });
      io.to(code).emit('room:system_msg', {
        message: `@${player.username} has run out of funds! System is auto-filling their remaining slots...`,
        type: 'bankruptcy',
      });

      // Auto-fill with cheapest available players
      const autoPlayers: typeof room.remainingPlayers = [];
      const emptySlots = player.squad.filter((s) => s.player === null);
      for (const slot of emptySlots) {
        if (room.remainingPlayers.length === 0) break;
        const cheapIdx = room.remainingPlayers.reduce(
          (minIdx, p, idx, arr) => p.baseValue < arr[minIdx].baseValue ? idx : minIdx,
          0,
        );
        const [cheapPlayer] = room.remainingPlayers.splice(cheapIdx, 1);
        slot.player = cheapPlayer;
        slot.purchasePrice = 0;
        slot.isSystemPick = true;
        player.filledSlots++;
        autoPlayers.push(cheapPlayer);
      }

      io.to(code).emit('auction:auto_fill', {
        userId: player.userId,
        players: autoPlayers,
      });
    }
  }

  await setRoomState(code, room);
}

// ============================================================
// END AUCTION — transition to squad builder
// ============================================================
async function endAuction(io: IO, code: string): Promise<void> {
  const room = await getRoomState<RoomState>(code);
  if (!room) return;

  // Auto-fill any remaining empty slots due to skips
  for (const player of room.players) {
    const emptySlots = player.squad.filter(s => s.player === null);
    for (const slot of emptySlots) {
      if (room.remainingPlayers.length === 0) break;
      const cheapIdx = room.remainingPlayers.reduce(
        (minIdx, p, idx, arr) => p.baseValue < arr[minIdx].baseValue ? idx : minIdx,
        0,
      );
      const [cheapPlayer] = room.remainingPlayers.splice(cheapIdx, 1);
      slot.player = cheapPlayer;
      slot.purchasePrice = 0;
      slot.isSystemPick = true;
      player.filledSlots++;
    }
  }

  room.status = 'SQUAD_BUILDER';
  await setRoomState(code, room);

  // Trigger frontend navigation
  io.to(code).emit('room:state', room);

  io.to(code).emit('room:system_msg', {
    message: 'AUCTION COMPLETE! All positions filled. Time to build your squads!',
    type: 'info',
  });

  // Squad builder timer: 90 seconds
  let timeLeft = 90;
  const squadTimer = setInterval(async () => {
    timeLeft--;
    io.to(code).emit('squad:timer_update', { timeLeft });
    if (timeLeft <= 0) {
      clearInterval(squadTimer);
      // Auto-submit all unfinished squads
      io.to(code).emit('squad:all_ready');
    }
  }, 1000);
}

// ============================================================
// CLEANUP
// ============================================================
export function clearRoomTimers(code: string): void {
  const bid = bidTimers.get(code);
  if (bid) { clearTimeout(bid); bidTimers.delete(code); }
  const round = roundTimers.get(code);
  if (round) { clearTimeout(round); roundTimers.delete(code); }
}
