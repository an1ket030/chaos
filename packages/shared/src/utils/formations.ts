import type { Formation, FormationSlot } from '../types/room';
import type { Position } from '../types/player';

// ============================================================
// FORMATION COORDINATE MAPS
// Coordinates: x = left→right (0–100%), y = top→bottom (0–100%)
// GK is at top (y=5%), attack is at bottom (y=90%)
// ============================================================

export const FORMATION_LAYOUTS: Record<Formation, FormationSlot[]> = {
  '4-3-3': [
    { position: 'GK', x: 50, y: 8 },
    { position: 'LB', x: 15, y: 28 },
    { position: 'CB', x: 35, y: 25 },
    { position: 'CB', x: 65, y: 25 },
    { position: 'RB', x: 85, y: 28 },
    { position: 'CM', x: 25, y: 52 },
    { position: 'CM', x: 50, y: 48 },
    { position: 'CM', x: 75, y: 52 },
    { position: 'LW', x: 18, y: 75 },
    { position: 'ST', x: 50, y: 82 },
    { position: 'RW', x: 82, y: 75 },
  ],
  '4-4-2': [
    { position: 'GK', x: 50, y: 8 },
    { position: 'LB', x: 15, y: 28 },
    { position: 'CB', x: 35, y: 25 },
    { position: 'CB', x: 65, y: 25 },
    { position: 'RB', x: 85, y: 28 },
    { position: 'LW', x: 15, y: 52 },
    { position: 'CM', x: 38, y: 50 },
    { position: 'CM', x: 62, y: 50 },
    { position: 'RW', x: 85, y: 52 },
    { position: 'ST', x: 35, y: 80 },
    { position: 'ST', x: 65, y: 80 },
  ],
  '4-2-3-1': [
    { position: 'GK', x: 50, y: 8 },
    { position: 'LB', x: 15, y: 28 },
    { position: 'CB', x: 35, y: 25 },
    { position: 'CB', x: 65, y: 25 },
    { position: 'RB', x: 85, y: 28 },
    { position: 'CDM', x: 35, y: 47 },
    { position: 'CDM', x: 65, y: 47 },
    { position: 'LW', x: 18, y: 67 },
    { position: 'CAM', x: 50, y: 65 },
    { position: 'RW', x: 82, y: 67 },
    { position: 'ST', x: 50, y: 85 },
  ],
  '3-5-2': [
    { position: 'GK', x: 50, y: 8 },
    { position: 'CB', x: 25, y: 25 },
    { position: 'CB', x: 50, y: 22 },
    { position: 'CB', x: 75, y: 25 },
    { position: 'LB', x: 10, y: 50 },
    { position: 'CDM', x: 30, y: 48 },
    { position: 'CM', x: 50, y: 47 },
    { position: 'CDM', x: 70, y: 48 },
    { position: 'RB', x: 90, y: 50 },
    { position: 'ST', x: 35, y: 80 },
    { position: 'ST', x: 65, y: 80 },
  ],
  '5-3-2': [
    { position: 'GK', x: 50, y: 8 },
    { position: 'LB', x: 10, y: 28 },
    { position: 'CB', x: 27, y: 25 },
    { position: 'CB', x: 50, y: 22 },
    { position: 'CB', x: 73, y: 25 },
    { position: 'RB', x: 90, y: 28 },
    { position: 'CM', x: 25, y: 55 },
    { position: 'CM', x: 50, y: 52 },
    { position: 'CM', x: 75, y: 55 },
    { position: 'ST', x: 35, y: 80 },
    { position: 'ST', x: 65, y: 80 },
  ],
  '4-1-4-1': [
    { position: 'GK', x: 50, y: 8 },
    { position: 'LB', x: 15, y: 28 },
    { position: 'CB', x: 35, y: 25 },
    { position: 'CB', x: 65, y: 25 },
    { position: 'RB', x: 85, y: 28 },
    { position: 'CDM', x: 50, y: 45 },
    { position: 'LW', x: 12, y: 62 },
    { position: 'CM', x: 35, y: 60 },
    { position: 'CM', x: 65, y: 60 },
    { position: 'RW', x: 88, y: 62 },
    { position: 'ST', x: 50, y: 83 },
  ],
  '3-4-3': [
    { position: 'GK', x: 50, y: 8 },
    { position: 'CB', x: 25, y: 25 },
    { position: 'CB', x: 50, y: 22 },
    { position: 'CB', x: 75, y: 25 },
    { position: 'LB', x: 15, y: 50 },
    { position: 'CM', x: 35, y: 48 },
    { position: 'CM', x: 65, y: 48 },
    { position: 'RB', x: 85, y: 50 },
    { position: 'LW', x: 18, y: 75 },
    { position: 'ST', x: 50, y: 80 },
    { position: 'RW', x: 82, y: 75 },
  ],
};

export const ALL_FORMATIONS: Formation[] = [
  '4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2', '4-1-4-1', '3-4-3',
];

export const DEFAULT_FORMATION: Formation = '4-3-3';

// Natural position groups for chemistry
export const POSITION_GROUPS: Record<Position, string> = {
  GK: 'keeper',
  LB: 'fullback',
  RB: 'fullback',
  CB: 'centre-back',
  CDM: 'defensive-mid',
  CM: 'midfielder',
  CAM: 'attacking-mid',
  LW: 'winger',
  RW: 'winger',
  ST: 'striker',
};
