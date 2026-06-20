import type { RoomState, PlayerState, CardEffect } from '@chaos/shared';
import { CHAOS_CARDS, FINANCE_CARDS, ALL_CARDS } from '@chaos/shared';
import type { ChaosCardType, FinanceCardType } from '@chaos/shared';

// Should the system trigger a card this round?
export function shouldTriggerCard(round: number): boolean {
  if (round < 2) return false;
  return Math.random() < 0.4;
}

// Select a random card (chaos or finance) based on settings
export function selectCard(
  chaosEnabled: boolean,
  financeEnabled: boolean,
): (typeof ALL_CARDS)[number] | null {
  if (!chaosEnabled && !financeEnabled) return null;
  const pool = [
    ...(chaosEnabled ? CHAOS_CARDS : []),
    ...(financeEnabled ? FINANCE_CARDS : []),
  ];
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Select targets for a card
export function selectTargets(
  card: (typeof ALL_CARDS)[number],
  room: RoomState,
): string[] {
  const players = room.players;
  if (players.length === 0) return [];

  switch (card.targetType) {
    case 'all':
      return players.map((p) => p.userId);

    case 'richest': {
      const sorted = [...players].sort((a, b) => b.budget - a.budget);
      return [sorted[0].userId];
    }

    case 'poorest': {
      const sorted = [...players].sort((a, b) => a.budget - b.budget);
      return [sorted[0].userId];
    }

    case 'two-random': {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 2).map((p) => p.userId);
    }

    case 'random':
    default: {
      // Some cards have weighted targeting
      if (card.weightedTarget) {
        const { type, weight } = card.weightedTarget;
        if (Math.random() < weight) {
          const sorted = [...players].sort((a, b) =>
            type === 'richest' ? b.budget - a.budget : a.budget - b.budget
          );
          return [sorted[0].userId];
        }
      }

      // Special constraints
      if (card.id === 'transfer-ban') {
        // Cannot target already banned player
        const eligible = players.filter((p) => !p.transferBan.active);
        if (eligible.length === 0) return [players[Math.floor(Math.random() * players.length)].userId];
        return [eligible[Math.floor(Math.random() * eligible.length)].userId];
      }

      if (card.id === 'injury-concern' || card.id === 'ego-clash') {
        const eligible = players.filter((p) => p.filledSlots > 0);
        if (eligible.length === 0) return [];
        return [eligible[Math.floor(Math.random() * eligible.length)].userId];
      }

      return [players[Math.floor(Math.random() * players.length)].userId];
    }
  }
}

// Apply the card effect to room state — returns effect descriptor and mutated room
export function applyCardEffect(
  card: (typeof ALL_CARDS)[number],
  targetUserIds: string[],
  room: RoomState,
): { room: RoomState; effect: CardEffect } {
  const effect: CardEffect = {
    cardId: card.id as ChaosCardType | FinanceCardType,
    targetUserIds,
    description: card.description,
  };

  function getPlayer(userId: string): PlayerState | undefined {
    return room.players.find((p) => p.userId === userId);
  }

  switch (card.id) {
    // ===== FINANCE CARDS =====
    case 'oil-money': {
      const target = getPlayer(targetUserIds[0]);
      if (target) {
        target.budget += 25;
        effect.cpChanges = { [target.userId]: 25 };
      }
      break;
    }
    case 'ffp-violation': {
      const target = getPlayer(targetUserIds[0]);
      if (target) {
        const deduction = Math.min(target.budget, 15);
        target.budget -= deduction;
        effect.cpChanges = { [target.userId]: -deduction };
      }
      break;
    }
    case 'bankruptcy-bailout': {
      const target = getPlayer(targetUserIds[0]);
      if (target) {
        target.budget += 20;
        effect.cpChanges = { [target.userId]: 20 };
      }
      break;
    }
    case 'tax-raid': {
      const rich = getPlayer(targetUserIds[0]);
      if (rich) {
        const taken = Math.min(rich.budget, 10);
        rich.budget -= taken;
        const others = room.players.filter((p) => p.userId !== rich.userId);
        const share = others.length > 0 ? Math.floor(taken / others.length) : 0;
        const changes: Record<string, number> = { [rich.userId]: -taken };
        for (const other of others) {
          other.budget += share;
          changes[other.userId] = share;
        }
        effect.cpChanges = changes;
      }
      break;
    }
    case 'prize-windfall': {
      const changes: Record<string, number> = {};
      for (const player of room.players) {
        player.budget += 8;
        changes[player.userId] = 8;
      }
      effect.cpChanges = changes;
      break;
    }
    case 'wage-bill-crisis': {
      const target = getPlayer(targetUserIds[0]);
      if (target) {
        const deduction = Math.min(Math.max(target.filledSlots * 5, 5), 20);
        const actual = Math.min(target.budget, deduction);
        target.budget -= actual;
        effect.cpChanges = { [target.userId]: -actual };
      }
      break;
    }

    // ===== CHAOS CARDS =====
    case 'transfer-ban': {
      const target = getPlayer(targetUserIds[0]);
      if (target) {
        target.transferBan = { active: true, roundsRemaining: 2 };
        target.chaosCardsReceived++;
        effect.transferBan = { userId: target.userId, rounds: 2 };
      }
      break;
    }
    case 'injury-concern': {
      const target = getPlayer(targetUserIds[0]);
      if (target && target.filledSlots > 0) {
        // Find most recently purchased player (last non-null slot)
        const filledSlots = target.squad.filter((s) => s.player !== null);
        const lastSlot = filledSlots[filledSlots.length - 1];
        if (lastSlot?.player) {
          const removedId = lastSlot.player.id;
          // Return player to pool
          room.remainingPlayers.push(lastSlot.player);
          lastSlot.player = null;
          lastSlot.purchasePrice = 0;
          target.filledSlots--;
          target.chaosCardsReceived++;
          effect.playerRemoved = { userId: target.userId, playerId: removedId };
        }
      }
      break;
    }
    case 'ego-clash': {
      const target = getPlayer(targetUserIds[0]);
      if (target && target.filledSlots > 0) {
        // Find highest-rated player
        const filledSlots = target.squad.filter((s) => s.player !== null);
        const best = [...filledSlots].sort((a, b) =>
          (b.player?.rating ?? 0) - (a.player?.rating ?? 0)
        )[0];
        if (best?.player) {
          const refund = best.purchasePrice;
          target.budget += refund;
          const returnedPlayer = best.player;
          // Insert at FRONT of remaining players (next auction)
          room.remainingPlayers.unshift(returnedPlayer);
          best.player = null;
          best.purchasePrice = 0;
          target.filledSlots--;
          target.chaosCardsReceived++;
          effect.playerRemoved = {
            userId: target.userId,
            playerId: returnedPlayer.id,
            cpRefunded: refund,
            returnToPool: true,
          };
        }
      }
      break;
    }
    case 'blind-bag': {
      const target = getPlayer(targetUserIds[0]);
      if (target && room.remainingPlayers.length > 0) {
        const randomIdx = Math.floor(Math.random() * room.remainingPlayers.length);
        const [grantedPlayer] = room.remainingPlayers.splice(randomIdx, 1);
        // Find first empty slot
        const emptySlot = target.squad.find((s) => s.player === null);
        if (emptySlot) {
          emptySlot.player = grantedPlayer;
          emptySlot.purchasePrice = 0;
          emptySlot.isSystemPick = true;
          target.filledSlots++;
          target.chaosCardsReceived++;
          effect.playerGranted = { userId: target.userId, playerId: grantedPlayer.id };
        }
      }
      break;
    }
    case 'the-swap': {
      const t1 = getPlayer(targetUserIds[0]);
      const t2 = getPlayer(targetUserIds[1]);
      if (t1 && t2) {
        const temp = t1.budget;
        t1.budget = t2.budget;
        t2.budget = temp;
        t1.chaosCardsReceived++;
        t2.chaosCardsReceived++;
        effect.budgetSwap = { userId1: t1.userId, userId2: t2.userId };
      }
      break;
    }
    case 'double-down': {
      room.doubleBidNextRound = true;
      effect.modifiers = { doubleBidNextRound: true };
      break;
    }
    case 'time-bomb': {
      room.timeBombActive = true;
      effect.modifiers = { timeBombNextRound: true };
      break;
    }
    case 'position-reroll': {
      // Re-add current position back and pick from remaining
      if (room.currentPosition) {
        room.remainingPositions.push(room.currentPosition);
        room.currentPosition = null;
      }
      effect.modifiers = { positionReroll: true };
      break;
    }
  }

  return { room, effect };
}
