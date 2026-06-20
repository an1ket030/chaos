export type ChaosCardType =
  | 'transfer-ban'
  | 'injury-concern'
  | 'ego-clash'
  | 'blind-bag'
  | 'the-swap'
  | 'double-down'
  | 'time-bomb'
  | 'position-reroll';

export type FinanceCardType =
  | 'oil-money'
  | 'ffp-violation'
  | 'bankruptcy-bailout'
  | 'tax-raid'
  | 'prize-windfall'
  | 'wage-bill-crisis';

export type CardType = 'chaos' | 'finance';

export interface CardDefinition {
  id: ChaosCardType | FinanceCardType;
  type: CardType;
  name: string;
  description: string;
  flavor: string;
  color: string;
  icon: string;
  targetType: 'random' | 'richest' | 'poorest' | 'two-random' | 'all' | 'none';
  weightedTarget?: { type: 'richest' | 'poorest'; weight: number };
}

export interface CardEffect {
  cardId: ChaosCardType | FinanceCardType;
  targetUserIds: string[];
  description: string;
  cpChanges?: Record<string, number>;
  transferBan?: { userId: string; rounds: number };
  playerRemoved?: { userId: string; playerId: string; cpRefunded?: number; returnToPool?: boolean };
  playerGranted?: { userId: string; playerId: string };
  budgetSwap?: { userId1: string; userId2: string };
  modifiers?: {
    doubleBidNextRound?: boolean;
    timeBombNextRound?: boolean;
    positionReroll?: boolean;
  };
}
