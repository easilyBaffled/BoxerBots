import type { GameState, Player, MountainSlot, PlayerColor } from '../types/game';
import type { PlayerCard } from '../types/cards';
import { MOUNTAIN_CARDS } from '../data/mountainCards';
import { CHALLENGE_CARDS } from '../data/challengeCards';
import { makeToolCards } from '../data/toolCards';
import { makeUtilityCards } from '../data/utilityCards';
import { makeSkillCards } from '../data/skillCards';
import { makeStarterDeck } from '../data/starterDeck';
import { BACKGROUNDS } from '../data/backgrounds';
import { shuffle, cloneCardWithNewId } from './deckLogic';

const COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];

function buildPlayer(name: string, index: number, backgroundId: string): Player {
  const bg = BACKGROUNDS.find(b => b.id === backgroundId) ?? BACKGROUNDS[0];
  const starterDeck = shuffle(makeStarterDeck().map(c => cloneCardWithNewId(c)));
  const hand = starterDeck.splice(0, 5);
  return {
    id: `player_${index}`,
    name,
    color: COLORS[index],
    backgroundId: bg.id,
    baseStats: bg.baseStats,
    positionIndex: 0,
    deck: starterDeck,
    hand,
    discardPile: [],
    activeSkills: [],
    gold: 3,
    campsPlaced: 0,
    maxCamps: 2,
    hasMovedThisTurn: false,
    actionsRemaining: 1,
    skipNextMove: false,
    alive: true,
    respawning: false,
    respawnTargetIndex: null,
  };
}

function buildMountainSlots(): MountainSlot[] {
  const challenges = shuffle([...CHALLENGE_CARDS]);
  let challengePool = [...challenges, ...challenges];
  challengePool = shuffle(challengePool);

  return MOUNTAIN_CARDS.map((card) => {
    const slots: (typeof CHALLENGE_CARDS[0] | null)[] = [];
    for (let i = 0; i < card.challengeSlots; i++) {
      slots.push(challengePool.shift() ?? null);
    }
    return {
      mountainCard: card,
      challengeSlots: slots,
      occupants: [],
      camp: null,
      revealed: card.elevation === 0,
    };
  });
}

function buildShopDeck(): PlayerCard[] {
  const tools = makeToolCards().map(c => cloneCardWithNewId(c));
  const utils = makeUtilityCards().map(c => cloneCardWithNewId(c));
  const skills = makeSkillCards().map(c => cloneCardWithNewId(c));
  const all: PlayerCard[] = [
    ...tools, ...utils, ...skills,
    ...makeToolCards().map(c => cloneCardWithNewId(c)),
    ...makeUtilityCards().map(c => cloneCardWithNewId(c)),
  ];
  return shuffle(all);
}

export function buildInitialState(playerNames: string[], backgroundIds: string[]): GameState {
  const players = playerNames.map((name, i) => buildPlayer(name, i, backgroundIds[i] ?? BACKGROUNDS[0].id));
  const mountainSlots = buildMountainSlots();

  mountainSlots[0].occupants = players.map(p => p.id);

  const shopDeck = buildShopDeck();
  const shopAvailable = shopDeck.splice(0, 5);

  return {
    gamePhase: 'playing',
    turnPhase: 'play',
    players,
    activePlayerIndex: 0,
    board: {
      mountainSlots,
      summitIndex: MOUNTAIN_CARDS.length - 1,
    },
    shop: {
      available: shopAvailable,
      drawPile: shopDeck,
    },
    activeChallenge: null,
    pendingJostle: null,
    turnGold: 0,
    selectedCardId: null,
    log: [
      {
        id: 'log_start',
        timestamp: Date.now(),
        message: 'The expedition begins. Reach the summit to win!',
        type: 'system',
      },
    ],
    config: {
      playerCount: playerNames.length,
      handSize: 5,
      startingGold: 3,
      campCost: 4,
      jostleCost: 2,
      shopRowSize: 5,
    },
    winner: null,
  };
}

export function buildSetupState(): GameState {
  return {
    gamePhase: 'setup',
    turnPhase: 'play',
    players: [],
    activePlayerIndex: 0,
    board: { mountainSlots: [], summitIndex: 0 },
    shop: { available: [], drawPile: [] },
    activeChallenge: null,
    pendingJostle: null,
    turnGold: 0,
    selectedCardId: null,
    log: [],
    config: {
      playerCount: 2,
      handSize: 5,
      startingGold: 3,
      campCost: 4,
      jostleCost: 2,
      shopRowSize: 5,
    },
    winner: null,
  };
}
