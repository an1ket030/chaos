/**
 * DRAFTWAR — Match Persistence & Progression Service
 * 
 * Handles database persistence for completed matches, computes participant stats,
 * and executes ELO rating updates.
 */

import { query, queryOne } from '../../config/db';
import type { RoomState, FinalizedSquad, MatchResult } from '@chaos/shared';
import { calculateMultiplayerElo, type PlayerEloInput, type PlayerEloResult } from '../elo/elo.service';

export interface PersistMatchOptions {
  room: RoomState;
  allResults: MatchResult[];
  winnerUserId: string;
  awards: Record<string, unknown>;
  standings: Array<{
    userId: string;
    username: string;
    wins: number;
    goals: number;
  }>;
  finalizedSquads?: Map<string, FinalizedSquad>;
}

export interface MatchPersistenceResult {
  gameId: string;
  eloResults: PlayerEloResult[];
}

export async function persistMatchResult(options: PersistMatchOptions): Promise<MatchPersistenceResult | null> {
  const { room, allResults, winnerUserId, awards, standings, finalizedSquads } = options;

  try {
    // 1. Insert into games table
    const gameRows = await query<{ id: string }>(
      `INSERT INTO games (room_code, edition, mode, winner_id, settings, results, awards, player_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        room.code,
        room.settings.edition,
        room.settings.mode,
        winnerUserId || null,
        JSON.stringify(room.settings),
        JSON.stringify(allResults),
        JSON.stringify(awards),
        room.players.length,
      ],
    );

    const gameId = gameRows[0]?.id;
    if (!gameId) {
      console.error('[MatchService] Failed to create game record: no ID returned');
      return null;
    }

    // 2. Fetch current ELO ratings for all participants
    const userIds = room.players.map((p) => p.userId);
    const userEloMap: Record<string, number> = {};

    if (userIds.length > 0) {
      const usersData = await query<{ id: string; elo_rating: number }>(
        `SELECT id, elo_rating FROM users WHERE id = ANY($1::uuid[])`,
        [userIds],
      );
      for (const u of usersData) {
        userEloMap[u.id] = u.elo_rating ?? 1000;
      }
    }

    // 3. Map standings to placements (1st, 2nd, etc.)
    const eloInputs: PlayerEloInput[] = standings.map((item, idx) => ({
      userId: item.userId,
      username: item.username,
      currentElo: userEloMap[item.userId] ?? 1000,
      placement: idx + 1,
    }));

    // 4. Calculate multiplayer ELO adjustments
    const eloResults = calculateMultiplayerElo(eloInputs);
    const eloDeltaMap: Record<string, PlayerEloResult> = {};
    for (const r of eloResults) {
      eloDeltaMap[r.userId] = r;
    }

    // 5. Insert participants & update users
    for (let i = 0; i < room.players.length; i++) {
      const player = room.players[i];
      const participantPlacement = standings.findIndex((s) => s.userId === player.userId) + 1 || (i + 1);
      const eloInfo = eloDeltaMap[player.userId] || {
        delta: 0,
        newElo: userEloMap[player.userId] ?? 1000,
      };

      const finalSquad = finalizedSquads?.get(player.userId) || {
        formation: '4-3-3',
        startingXI: player.squad,
        bench: [],
      };

      // Calculate squad rating from starting XI
      let squadRating = 0;
      let ratedCount = 0;
      for (const slot of player.squad) {
        if (slot.player?.rating) {
          squadRating += slot.player.rating;
          ratedCount++;
        }
      }
      const avgSquadRating = ratedCount > 0 ? parseFloat((squadRating / ratedCount).toFixed(2)) : 0;
      const cpSpent = Math.max(0, room.settings.startingBudget - player.budget);

      // Insert into game_participants
      await query(
        `INSERT INTO game_participants (
          game_id, user_id, username, final_budget, squad, formation,
          squad_rating, chemistry, cp_spent, chaos_cards_received, elo_change, position
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          gameId,
          player.userId,
          player.username,
          player.budget,
          JSON.stringify(player.squad),
          finalSquad.formation || '4-3-3',
          avgSquadRating,
          85, // base chemistry
          cpSpent,
          player.chaosCardsReceived || 0,
          eloInfo.delta,
          participantPlacement,
        ],
      );

      // Update user aggregate stats
      const isWinner = player.userId === winnerUserId;
      await query(
        `UPDATE users
         SET games_played = games_played + 1,
             games_won = games_won + $1,
             total_cp_spent = total_cp_spent + $2,
             chaos_cards_received = chaos_cards_received + $3,
             elo_rating = $4,
             best_squad_rating = GREATEST(COALESCE(best_squad_rating, 0), $5),
             favorite_formation = COALESCE($6, favorite_formation),
             updated_at = NOW()
         WHERE id = $7`,
        [
          isWinner ? 1 : 0,
          cpSpent,
          player.chaosCardsReceived || 0,
          eloInfo.newElo,
          avgSquadRating,
          finalSquad.formation || '4-3-3',
          player.userId,
        ],
      );
    }

    console.log(`[MatchService] Match ${room.code} successfully persisted (Game ID: ${gameId})`);
    return { gameId, eloResults };
  } catch (error) {
    console.error('[MatchService] Error persisting match result:', error);
    return null;
  }
}

export function calculateAwards(
  room: RoomState,
  _results?: unknown[],
): Record<string, unknown> {
  let mostExpensiveBuy: { playerName: string; cp: number; buyerUsername: string } | null = null;
  let bestValue: { playerName: string; rating: number; cp: number; ratio: number; buyerUsername: string } | null = null;
  let biggestRobbery: { playerName: string; baseValue: number; paidPrice: number; buyerUsername: string } | null = null;
  let chaosMagnet: { username: string; chaosCardsReceived: number } | null = null;
  let bankruptManager: { username: string } | null = null;

  for (const player of room.players) {
    if (!chaosMagnet || player.chaosCardsReceived > chaosMagnet.chaosCardsReceived) {
      chaosMagnet = { username: player.username, chaosCardsReceived: player.chaosCardsReceived };
    }
    if (player.isBankrupt) bankruptManager = { username: player.username };

    for (const slot of player.squad) {
      if (!slot.player) continue;
      const price = slot.purchasePrice;
      const rating = slot.player.rating;
      const baseValue = slot.player.baseValue;

      if (!mostExpensiveBuy || price > mostExpensiveBuy.cp) {
        mostExpensiveBuy = { playerName: slot.player.name, cp: price, buyerUsername: player.username };
      }
      if (price > 0) {
        const ratio = rating / price;
        if (!bestValue || ratio > bestValue.ratio) {
          bestValue = { playerName: slot.player.name, rating, cp: price, ratio, buyerUsername: player.username };
        }
      }
      if (price < baseValue && (!biggestRobbery || (baseValue - price) > (biggestRobbery.baseValue - biggestRobbery.paidPrice))) {
        biggestRobbery = { playerName: slot.player.name, baseValue, paidPrice: price, buyerUsername: player.username };
      }
    }
  }

  return { mostExpensiveBuy, bestValue, biggestRobbery, chaosMagnet, bankruptManager };
}

