import type { StatBlock } from '../types/cards';

export interface Background {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseStats: StatBlock;
  handSizeBonus: number;
  startingGoldBonus: number;
  maxCampsBonus: number;
  abilityId: string;
  abilityName: string;
  abilityDescription: string;
  extraStarterDefinitionIds: string[];
  removeStarterCount: number;
}

export const BACKGROUNDS: Background[] = [
  {
    id: 'mountaineer',
    name: 'Mountaineer',
    icon: '⛏',
    description: 'Expert technical climber. Dominates rock and ice but neglects recovery.',
    baseStats: { strength: 3, agility: 2, survival: -2, warmth: -1 },
    handSizeBonus: 0,
    startingGoldBonus: 0,
    maxCampsBonus: 0,
    abilityId: 'sure_footed',
    abilityName: 'Sure-Footed',
    abilityDescription: 'Terrain falls become "discard 1" instead of falling.',
    extraStarterDefinitionIds: ['rope'],
    removeStarterCount: 1,
  },
  {
    id: 'doctor',
    name: 'Field Doctor',
    icon: '🏥',
    description: 'Wilderness medic. Incredible endurance but slow on the mountain.',
    baseStats: { survival: 3, warmth: 2, strength: -2, agility: -1 },
    handSizeBonus: 1,
    startingGoldBonus: -1,
    maxCampsBonus: 0,
    abilityId: 'triage',
    abilityName: 'Triage',
    abilityDescription: 'Discard and lose-card penalties cost 1 fewer card (min 1).',
    extraStarterDefinitionIds: ['first_aid'],
    removeStarterCount: 1,
  },
  {
    id: 'scout',
    name: 'Mountain Scout',
    icon: '🔭',
    description: 'Reads terrain instinctively. Travels light but freezes easily.',
    baseStats: { navigation: 3, agility: 2, warmth: -2, survival: -1 },
    handSizeBonus: -1,
    startingGoldBonus: 1,
    maxCampsBonus: 0,
    abilityId: 'reconnaissance',
    abilityName: 'Reconnaissance',
    abilityDescription: 'Gain 1 gold whenever you reveal a new mountain card.',
    extraStarterDefinitionIds: ['trekking_poles'],
    removeStarterCount: 1,
  },
  {
    id: 'survivalist',
    name: 'Survivalist',
    icon: '🏕',
    description: 'Built for the long haul. Gets lost, but never gives up.',
    baseStats: { warmth: 3, survival: 2, navigation: -2, strength: -1 },
    handSizeBonus: 0,
    startingGoldBonus: 0,
    maxCampsBonus: 1,
    abilityId: 'endure',
    abilityName: 'Endure',
    abilityDescription: 'Skip-turn penalties become "discard 1" instead.',
    extraStarterDefinitionIds: ['thermos'],
    removeStarterCount: 1,
  },
  {
    id: 'athlete',
    name: 'Elite Athlete',
    icon: '💪',
    description: 'Peak physical specimen. Instinct over preparation.',
    baseStats: { strength: 2, agility: 2, navigation: -1, warmth: -1 },
    handSizeBonus: 0,
    startingGoldBonus: -1,
    maxCampsBonus: 0,
    abilityId: 'rising_to_challenge',
    abilityName: 'Rising to the Challenge',
    abilityDescription: 'Gain 1 gold whenever you pass or complete a challenge.',
    extraStarterDefinitionIds: ['energy_drink'],
    removeStarterCount: 1,
  },
];
