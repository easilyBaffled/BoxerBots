import type { StatBlock } from '../types/cards';

export interface Background {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseStats: StatBlock;
  flavor: string;
}

export const BACKGROUNDS: Background[] = [
  {
    id: 'mountaineer',
    name: 'Mountaineer',
    icon: '⛏',
    description: 'Expert in technical climbing. Shines on rock and ice.',
    baseStats: { strength: 2, agility: 2 },
    flavor: 'Strength +2, Agility +2',
  },
  {
    id: 'doctor',
    name: 'Field Doctor',
    icon: '🏥',
    description: 'Trained wilderness medic. Tough body, calm under pressure.',
    baseStats: { survival: 3, warmth: 1 },
    flavor: 'Survival +3, Warmth +1',
  },
  {
    id: 'scout',
    name: 'Mountain Scout',
    icon: '🔭',
    description: 'Reads terrain and weather instinctively. Born navigator.',
    baseStats: { navigation: 3, agility: 1 },
    flavor: 'Navigation +3, Agility +1',
  },
  {
    id: 'survivalist',
    name: 'Survivalist',
    icon: '🏕',
    description: 'Hardened against cold and the elements above all else.',
    baseStats: { warmth: 3, survival: 1 },
    flavor: 'Warmth +3, Survival +1',
  },
  {
    id: 'athlete',
    name: 'Elite Athlete',
    icon: '💪',
    description: 'Peak physical condition. Balanced across all physical demands.',
    baseStats: { strength: 2, agility: 1, survival: 1 },
    flavor: 'Strength +2, Agility +1, Survival +1',
  },
];
