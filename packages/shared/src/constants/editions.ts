import type { EditionSlug } from '../types/room';

export interface EditionDefinition {
  slug: EditionSlug;
  name: string;
  description: string;
  logo: string;
  gradient: string;
  accentColor: string;
  filter: (player: { editions: string[]; nationality?: string; league?: string; isLegend?: boolean }) => boolean;
}

export const EDITIONS: EditionDefinition[] = [
  {
    slug: 'world-cup',
    name: 'World Cup Edition',
    description: 'Top stars from the 16 best FIFA-ranked national teams',
    logo: '🏆',
    gradient: 'from-yellow-600 via-yellow-500 to-amber-400',
    accentColor: '#FFD700',
    filter: (p) => p.editions.includes('world-cup'),
  },
  {
    slug: 'champions-league',
    name: 'Champions League Edition',
    description: 'Elite players from current UCL group stage clubs',
    logo: '⭐',
    gradient: 'from-blue-900 via-blue-700 to-blue-500',
    accentColor: '#4169E1',
    filter: (p) => p.editions.includes('champions-league'),
  },
  {
    slug: 'premier-league',
    name: 'Premier League Edition',
    description: "England's finest from the world's most-watched league",
    logo: '🦁',
    gradient: 'from-purple-900 via-purple-700 to-purple-500',
    accentColor: '#3D0087',
    filter: (p) => p.editions.includes('premier-league'),
  },
  {
    slug: 'la-liga',
    name: 'La Liga Edition',
    description: 'Spanish supremacy — Real Madrid, Barcelona & beyond',
    logo: '🇪🇸',
    gradient: 'from-red-900 via-red-700 to-orange-500',
    accentColor: '#FF4500',
    filter: (p) => p.editions.includes('la-liga'),
  },
  {
    slug: 'bundesliga',
    name: 'Bundesliga Edition',
    description: 'German football powerhouses and rising stars',
    logo: '🦅',
    gradient: 'from-red-800 via-red-600 to-yellow-500',
    accentColor: '#D00000',
    filter: (p) => p.editions.includes('bundesliga'),
  },
  {
    slug: 'all-time-legends',
    name: 'All-Time Legends Edition',
    description: 'The greatest players to ever grace the beautiful game',
    logo: '👑',
    gradient: 'from-yellow-900 via-amber-700 to-yellow-500',
    accentColor: '#C8FF00',
    filter: (p) => p.isLegend === true,
  },
  {
    slug: 'custom',
    name: 'Custom Edition',
    description: 'Room creator selects from the full player pool',
    logo: '🎮',
    gradient: 'from-gray-900 via-gray-700 to-gray-500',
    accentColor: '#888888',
    filter: () => true,
  },
];

export const DEFAULT_EDITION: EditionSlug = 'world-cup';

export function getEdition(slug: EditionSlug): EditionDefinition {
  return EDITIONS.find((e) => e.slug === slug) ?? EDITIONS[EDITIONS.length - 1];
}
