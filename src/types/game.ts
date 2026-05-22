import type { MountainCardDef, ChallengeCardDef, PlayerCard, SkillCard } from './cards';

export type TurnPhase = 'draw' | 'play' | 'move' | 'challenge' | 'buy' | 'end';
export type GamePhase = 'setup' | 'playing' | 'victory';
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  positionIndex: number;
  deck: PlayerCard[];
  hand: PlayerCard[];
  discardPile: PlayerCard[];
  activeSkills: SkillCard[];
  gold: number;
  campsPlaced: number;
  maxCamps: number;
  hasMovedThisTurn: boolean;
  actionsRemaining: number;
  skipNextMove: boolean;
  alive: boolean;
  respawning: boolean;
  respawnTargetIndex: number | null;
}

export interface CampToken {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerColor: PlayerColor;
}

export interface MountainSlot {
  mountainCard: MountainCardDef;
  challengeSlots: (ChallengeCardDef | null)[];
  occupants: string[];
  camp: CampToken | null;
  revealed: boolean;
}

export interface ActiveChallenge {
  mountainSlotIndex: number;
  challengeSlotIndex: number;
  challengeCard: ChallengeCardDef;
  committedCardIds: string[];
  currentStatTotal: number;
  outcome: 'pass' | 'solve' | 'fail' | null;
  pendingSlots: number[];
}

export interface LogEntry {
  id: string;
  timestamp: number;
  playerName?: string;
  playerColor?: PlayerColor;
  message: string;
  type: 'info' | 'action' | 'challenge' | 'combat' | 'system';
}

export interface GameConfig {
  playerCount: number;
  handSize: number;
  startingGold: number;
  campCost: number;
  jostleCost: number;
  shopRowSize: number;
}

export interface GameState {
  gamePhase: GamePhase;
  turnPhase: TurnPhase;
  players: Player[];
  activePlayerIndex: number;
  board: {
    mountainSlots: MountainSlot[];
    summitIndex: number;
  };
  shop: {
    available: PlayerCard[];
    drawPile: PlayerCard[];
  };
  activeChallenge: ActiveChallenge | null;
  pendingJostle: {
    attackerId: string;
    targetId: string;
    slotIndex: number;
  } | null;
  turnGold: number;
  selectedCardId: string | null;
  log: LogEntry[];
  config: GameConfig;
  winner: string | null;
}
