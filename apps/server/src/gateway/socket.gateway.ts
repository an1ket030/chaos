import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  FinalizedSquad,
  RoomState,
  SimTeam,
} from '@chaos/shared';
import { simulateMatch, calculateChemistry, calculateEloChange } from '@chaos/shared';
import { verifyAccessToken, getUserById } from '../modules/auth/auth.service';
import { createRoom, getRoom, joinRoom, setPlayerConnected } from '../modules/room/room.service';
import { startAuction, handleBid, clearRoomTimers, handleSkip } from '../modules/auction/auction.engine';
import { getRoomState, setRoomState } from '../config/redis';
import { query } from '../config/db';
import { z } from 'zod';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

// Track finalized squads per room: code -> Map<userId, FinalizedSquad>
const finalizedSquads = new Map<string, Map<string, FinalizedSquad>>();

export function setupSocketGateway(io: IO): void {
  // ============================================================
  // AUTH MIDDLEWARE ON SOCKET HANDSHAKE
  // ============================================================
  io.use(async (socket, next) => {
    const token = (socket.handshake.auth as { token?: string }).token;
    if (!token) { next(new Error('Unauthorized')); return; }
    try {
      const { userId } = verifyAccessToken(token);
      const user = await getUserById(userId);
      if (!user) { next(new Error('User not found')); return; }
      socket.data.userId = userId;
      socket.data.username = user.username;
      socket.data.avatarUrl = user.avatar_url || '';
      socket.data.roomCode = null;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AppSocket) => {
    console.log(`✅ Socket connected: ${socket.data.username} (${socket.id})`);

    // ===== ROOM: JOIN =====
    socket.on('room:join', async (data, callback) => {
      try {
        const { code } = z.object({ code: z.string().length(6), token: z.string() }).parse(data);
        const upperCode = code.toUpperCase();

        // Check if already in room (e.g. creator reconnecting)
        const existingRoom = await getRoom(upperCode);
        if (!existingRoom) {
          callback({ success: false, error: 'Room not found' });
          return;
        }

        const alreadyInRoom = existingRoom.players.some((p) => p.userId === socket.data.userId);

        let room = existingRoom;
        if (!alreadyInRoom) {
          // New player joining
          room = await joinRoom(upperCode, socket.data.userId, socket.data.username, socket.data.avatarUrl);
          // Notify others a new player arrived
          socket.to(upperCode).emit('room:joined', {
            userId: socket.data.userId,
            username: socket.data.username,
            avatarUrl: socket.data.avatarUrl,
          });
        }

        // Add socket to the room channel regardless
        socket.join(upperCode);
        socket.data.roomCode = upperCode;

        // Mark player as connected
        await setPlayerConnected(upperCode, socket.data.userId, true);

        // Broadcast updated state so all clients refresh
        const updatedRoom = await getRoom(upperCode);
        if (updatedRoom) {
          io.to(upperCode).emit('room:state', updatedRoom);
        }

        callback({ success: true, room });
      } catch (err: unknown) {
        callback({ success: false, error: err instanceof Error ? err.message : 'Join failed' });
      }
    });

    // ===== ROOM: START GAME =====
    socket.on('room:start_game', async (callback) => {
      try {
        const code = socket.data.roomCode;
        if (!code) { callback({ success: false, error: 'Not in a room' }); return; }
        const room = await getRoom(code);
        if (!room) { callback({ success: false, error: 'Room not found' }); return; }
        if (room.creatorId !== socket.data.userId) {
          callback({ success: false, error: 'Only the creator can start the game' }); return;
        }
        if (room.players.length < 2) {
          callback({ success: false, error: 'Need at least 2 players' }); return;
        }

        // Re-calculate positions for total rounds based on number of players
        const basePositions = room.remainingPositions.slice(0, 11);
        const allPositions: import('@chaos/shared').Position[] = [];
        for (let i = 0; i < room.players.length; i++) {
          allPositions.push(...basePositions);
        }
        room.remainingPositions = allPositions;
        room.totalRounds = allPositions.length;
        await setRoomState(code, room);

        callback({ success: true });
        io.to(code).emit('room:start', {
          roomId: room.roomId,
          players: room.players,
          settings: room.settings,
        });
        // System takes over the auction flow
        await startAuction(io, code);
      } catch (err: unknown) {
        callback({ success: false, error: err instanceof Error ? err.message : 'Start failed' });
      }
    });

    // ===== ROOM: LEAVE =====
    socket.on('room:leave', async () => {
      const code = socket.data.roomCode;
      if (code) {
        await setPlayerConnected(code, socket.data.userId, false);
        socket.to(code).emit('room:player_left', {
          userId: socket.data.userId,
          username: socket.data.username,
        });
        socket.leave(code);
        socket.data.roomCode = null;
      }
    });

    // ===== ROOM: CHAT =====
    socket.on('room:chat', (data) => {
      const code = socket.data.roomCode;
      if (!code) return;
      const { message } = z.object({ message: z.string().min(1).max(200) }).parse(data);
      io.to(code).emit('room:chat', {
        senderId: socket.data.userId,
        username: socket.data.username,
        avatarUrl: socket.data.avatarUrl,
        message,
        timestamp: Date.now(),
      });
    });

    // ===== AUCTION: BID =====
    socket.on('auction:bid', async (data, callback) => {
      const code = socket.data.roomCode;
      if (!code) { callback({ success: false, error: 'Not in a room' }); return; }
      const result = await handleBid(
        io,
        code,
        socket.data.userId,
        socket.data.username,
        data.amount,
      );
      callback(result);
    });

    // ===== AUCTION: SKIP =====
    socket.on('auction:skip', async (callback) => {
      const code = socket.data.roomCode;
      if (!code) { callback({ success: false, error: 'Not in a room' }); return; }
      const result = await handleSkip(
        io,
        code,
        socket.data.userId,
        socket.data.username,
      );
      if (callback) callback(result);
    });

    // ===== SQUAD: FINALIZE =====
    socket.on('squad:finalize', async (data, callback) => {
      const code = socket.data.roomCode;
      if (!code) { callback({ success: false, error: 'Not in a room' }); return; }
      try {
        const room = await getRoomState<RoomState>(code);
        if (!room || room.status !== 'SQUAD_BUILDER') {
          callback({ success: false, error: 'Not in squad builder phase' }); return;
        }

        // Store this player's finalized squad
        if (!finalizedSquads.has(code)) finalizedSquads.set(code, new Map());
        finalizedSquads.get(code)!.set(socket.data.userId, data);

        io.to(code).emit('squad:player_submitted', {
          userId: socket.data.userId,
          username: socket.data.username,
        });

        callback({ success: true });

        // Check if all players have submitted
        const submitted = finalizedSquads.get(code)!;
        if (submitted.size >= room.players.length) {
          io.to(code).emit('squad:all_ready');
          // Start simulation
          await runSimulation(io, code, room);
        }
      } catch (err: unknown) {
        callback({ success: false, error: err instanceof Error ? err.message : 'Finalize failed' });
      }
    });

    // ===== DISCONNECT =====
    socket.on('disconnect', async () => {
      console.log(`❌ Socket disconnected: ${socket.data.username} (${socket.id})`);
      const code = socket.data.roomCode;
      if (code) {
        await setPlayerConnected(code, socket.data.userId, false);
        socket.to(code).emit('room:player_left', {
          userId: socket.data.userId,
          username: socket.data.username,
        });
      }
    });
  });
}

// ============================================================
// SIMULATION RUNNER (system-driven)
// ============================================================
async function runSimulation(io: IO, code: string, room: RoomState): Promise<void> {
  const squads = finalizedSquads.get(code);
  if (!squads) return;

  room.status = 'SIMULATION';
  await setRoomState(code, room);
  io.to(code).emit('room:state', room);

  const players = room.players;
  const allResults: ReturnType<typeof simulateMatch>[] = [];

  // Notify simulation start
  const matchups: Array<{ teamA: string; teamB: string }> = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matchups.push({ teamA: players[i].userId, teamB: players[j].userId });
    }
  }

  io.to(code).emit('simulation:start', { matchups });

  // Run all matches
  for (const matchup of matchups) {
    const playerA = players.find((p) => p.userId === matchup.teamA)!;
    const playerB = players.find((p) => p.userId === matchup.teamB)!;
    const squadA = squads.get(matchup.teamA);
    const squadB = squads.get(matchup.teamB);

    if (!squadA || !squadB) continue;

    const simPlayers = (ps: typeof playerA, sq: typeof squadA) =>
      ps.squad
        .filter((s) => s.player !== null)
        .map((s) => ({
          ...s.player!,
        }));

    const teamA: SimTeam = {
      userId: playerA.userId,
      username: playerA.username,
      players: simPlayers(playerA, squadA),
      formation: squadA.formation,
      captain: squadA.captain,
      overallRating: squadA.overallRating,
      chemistry: squadA.chemistry,
    };

    const teamB: SimTeam = {
      userId: playerB.userId,
      username: playerB.username,
      players: simPlayers(playerB, squadB),
      formation: squadB.formation,
      captain: squadB.captain,
      overallRating: squadB.overallRating,
      chemistry: squadB.chemistry,
    };

    const result = simulateMatch(teamA, teamB);
    allResults.push(result);

    // Stream events with delay for drama
    for (const event of result.events) {
      await new Promise((r) => setTimeout(r, 400));
      io.to(code).emit('simulation:event', {
        minute: event.minute,
        type: event.type as 'goal' | 'assist' | 'yellow' | 'red' | 'save' | 'key_pass',
        teamId: event.teamId,
        playerId: event.playerId,
        playerName: event.playerName,
        detail: event.detail,
        score: {
          [result.teamA.userId]: result.scoreA,
          [result.teamB.userId]: result.scoreB,
        },
      });
    }

    // Emit match result
    io.to(code).emit('simulation:result', {
      matchId: result.matchId,
      teamA: result.teamA.userId,
      teamB: result.teamB.userId,
      scoreA: result.scoreA,
      scoreB: result.scoreB,
      stats: result.stats as Record<string, unknown>,
      potm: result.potm,
      winner: result.winner,
    });

    await new Promise((r) => setTimeout(r, 2000));
  }

  // Calculate overall winner (most wins, then goals)
  const standings: Record<string, { wins: number; goals: number; userId: string; username: string }> = {};
  for (const p of players) {
    standings[p.userId] = { wins: 0, goals: 0, userId: p.userId, username: p.username };
  }
  for (const result of allResults) {
    if (result.winner) standings[result.winner].wins++;
    standings[result.teamA.userId].goals += result.scoreA;
    standings[result.teamB.userId].goals += result.scoreB;
  }

  const ranked = Object.values(standings).sort((a, b) =>
    b.wins !== a.wins ? b.wins - a.wins : b.goals - a.goals
  );
  const winner = ranked[0];

  // Awards
  const awards = calculateAwards(room, allResults);

  io.to(code).emit('simulation:tournament_result', {
    winner: winner.userId,
    winnerUsername: winner.username,
    allResults,
    awards,
  });

  // Save game to DB
  try {
    await saveGameResult(room, allResults, winner.userId, awards);
  } catch (err) {
    console.error('Failed to save game result:', err);
  }

  // Clean up
  finalizedSquads.delete(code);
  clearRoomTimers(code);
}

// ============================================================
// AWARDS CALCULATION
// ============================================================
function calculateAwards(
  room: RoomState,
  _results: ReturnType<typeof simulateMatch>[],
): Record<string, unknown> {
  let mostExpensiveBuy: { playerName: string; cp: number; buyerUsername: string } | null = null;
  let bestValue: { playerName: string; rating: number; cp: number; ratio: number; buyerUsername: string } | null = null;
  let biggestRobbery: { playerName: string; baseValue: number; paidPrice: number; buyerUsername: string } | null = null;
  let chaosMagnet: { username: string; chaosCardsReceived: number } | null = null;
  let bankruptManager: { username: string } | null = null;

  for (const player of room.players) {
    // Chaos magnet
    if (!chaosMagnet || player.chaosCardsReceived > chaosMagnet.chaosCardsReceived) {
      chaosMagnet = { username: player.username, chaosCardsReceived: player.chaosCardsReceived };
    }
    // Bankrupt
    if (player.isBankrupt) bankruptManager = { username: player.username };

    for (const slot of player.squad) {
      if (!slot.player) continue;
      const price = slot.purchasePrice;
      const rating = slot.player.rating;
      const baseValue = slot.player.baseValue;

      // Most expensive
      if (!mostExpensiveBuy || price > mostExpensiveBuy.cp) {
        mostExpensiveBuy = { playerName: slot.player.name, cp: price, buyerUsername: player.username };
      }
      // Best value (highest rating/price ratio, minimum 1 CP paid)
      if (price > 0) {
        const ratio = rating / price;
        if (!bestValue || ratio > bestValue.ratio) {
          bestValue = { playerName: slot.player.name, rating, cp: price, ratio, buyerUsername: player.username };
        }
      }
      // Biggest robbery (paid much less than base value)
      if (price < baseValue && (!biggestRobbery || (baseValue - price) > (biggestRobbery.baseValue - biggestRobbery.paidPrice))) {
        biggestRobbery = { playerName: slot.player.name, baseValue, paidPrice: price, buyerUsername: player.username };
      }
    }
  }

  return { mostExpensiveBuy, bestValue, biggestRobbery, chaosMagnet, bankruptManager };
}

// ============================================================
// SAVE GAME TO POSTGRES
// ============================================================
async function saveGameResult(
  room: RoomState,
  results: ReturnType<typeof simulateMatch>[],
  winnerId: string,
  awards: Record<string, unknown>,
): Promise<void> {
  const gameId = (await query<{ id: string }>(
    `INSERT INTO games (room_code, edition, mode, winner_id, settings, results, awards, player_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      room.code,
      room.settings.edition,
      room.settings.mode,
      winnerId || null,
      JSON.stringify(room.settings),
      JSON.stringify(results),
      JSON.stringify(awards),
      room.players.length,
    ],
  ))[0]?.id;

  if (!gameId) return;

  // Save each participant
  for (const player of room.players) {
    const cpSpent = room.settings.startingBudget - player.budget;
    await query(
      `INSERT INTO game_participants (game_id, user_id, username, final_budget, squad, cp_spent, chaos_cards_received)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        gameId,
        player.userId,
        player.username,
        player.budget,
        JSON.stringify(player.squad),
        cpSpent,
        player.chaosCardsReceived,
      ],
    );

    // Update user stats
    const isWinner = player.userId === winnerId;
    await query(
      `UPDATE users
       SET games_played = games_played + 1,
           games_won = games_won + $1,
           total_cp_spent = total_cp_spent + $2,
           chaos_cards_received = chaos_cards_received + $3,
           updated_at = NOW()
       WHERE id = $4`,
      [isWinner ? 1 : 0, cpSpent, player.chaosCardsReceived, player.userId],
    );
  }
}
