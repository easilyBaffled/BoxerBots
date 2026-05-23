export type StatDomain = 'strength' | 'agility' | 'warmth' | 'survival' | 'navigation';
export type StatBlock = Partial<Record<StatDomain, number>>;
export type ChallengeType = 'weather' | 'animal' | 'terrain' | 'condition';
export type TerrainType = 'snow' | 'ice' | 'rock' | 'mixed' | 'crevasse' | 'summit';

export interface FailPenalty {
  type: 'fall' | 'discard' | 'skip_turn' | 'lose_card';
  amount?: number;
  description: string;
}

export interface MountainCardDef {
  definitionId: string;
  name: string;
  elevation: number;
  terrain: TerrainType;
  playerSpaces: number;
  challengeSlots: number;
  allowsCamp: boolean;
  sectionName: string;
  flavorText?: string;
}

export interface SolveReward {
  gold?: number;
  draw?: number;
}

export interface ChallengeCardDef {
  definitionId: string;
  name: string;
  challengeType: ChallengeType;
  requiredDomains: StatDomain[];
  passThreshold: number;
  solveThreshold: number;
  failPenalty: FailPenalty;
  solveReward: SolveReward;
  description: string;
}

export interface ToolCard {
  id: string;
  definitionId: string;
  category: 'tool';
  name: string;
  cost: number;
  stats: StatBlock;
  durability: number | null;
  tags: string[];
  description: string;
  effect?: string;
}

export interface UtilityCard {
  id: string;
  definitionId: string;
  category: 'utility';
  name: string;
  cost: number;
  stats: StatBlock;
  consumable: boolean;
  tags: string[];
  description: string;
  effect?: string;
}

export interface SkillCard {
  id: string;
  definitionId: string;
  category: 'skill';
  name: string;
  cost: number;
  stats: StatBlock;
  permanent: boolean;
  tags: string[];
  description: string;
  passiveBonus?: StatBlock;
  effect?: string;
}

export type PlayerCard = ToolCard | UtilityCard | SkillCard;
