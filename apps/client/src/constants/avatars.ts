export interface TacticalAvatar {
  id: string;
  name: string;
  callsign: string;
  url: string;
}

export const TACTICAL_AVATARS: TacticalAvatar[] = [
  {
    id: 'commander-voss',
    name: 'Commander Voss',
    callsign: 'APEX-01',
    url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=CommanderVoss&backgroundColor=0F1520&eyes=glow&mouth=smile01',
  },
  {
    id: 'tactician-rex',
    name: 'Tactician Rex',
    callsign: 'IRON-02',
    url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=TacticianRex&backgroundColor=161E2E&eyes=eva&mouth=grill01',
  },
  {
    id: 'strategist-maya',
    name: 'Strategist Maya',
    callsign: 'VALKYRIE-03',
    url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=StrategistMaya&backgroundColor=080C12&eyes=frame1&mouth=bite',
  },
  {
    id: 'cipher-zero',
    name: 'Cipher Zero',
    callsign: 'GHOST-04',
    url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=CipherZero&backgroundColor=0F1520&eyes=robocop&mouth=diagram',
  },
  {
    id: 'overwatch-prime',
    name: 'Overwatch Prime',
    callsign: 'AEGIS-05',
    url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=OverwatchPrime&backgroundColor=161E2E&eyes=sensor&mouth=grill02',
  },
  {
    id: 'phantom-lead',
    name: 'Phantom Lead',
    callsign: 'SPECTRE-06',
    url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=PhantomLead&backgroundColor=080C12&eyes=glow&mouth=bite',
  },
];

export function getTacticalAvatarUrl(seed: string): string {
  const safeSeed = encodeURIComponent(seed.trim() || 'TacticalManager');
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${safeSeed}&backgroundColor=0F1520&eyes=eva,frame1,frame2,glow,robocop,sensor&mouth=bite,diagram,grill01,grill02,smile01`;
}
