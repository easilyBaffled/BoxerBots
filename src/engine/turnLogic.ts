import type { GameState, TurnPhase } from '../types/game';
import type { PlayerCard, SkillCard, UtilityCard } from '../types/cards';
import { drawCards } from './deckLogic';
import { addLog } from './logHelpers';
import { respawnPlayer } from './boardLogic';

const PHASE_ORDER: TurnPhase[] = ['play', 'move', 'challenge', 'buy', 'end'];

export function advancePhase(state: GameState): GameState {
  const currentPhaseIndex = PHASE_ORDER.indexOf(state.turnPhase);
  const nextPhase = PHASE_ORDER[currentPhaseIndex + 1] ?? 'end';

  if (nextPhase === 'challenge') {
    return startChallengePhase({ ...state, turnPhase: 'challenge' });
  }

  if (nextPhase === 'end') {
    return endTurn(state);
  }

  return { ...state, turnPhase: nextPhase };
}

function startChallengePhase(state: GameState): GameState {
  const activePlayer = state.players[state.activePlayerIndex];
  const currentSlot = state.board.mountainSlots[activePlayer.positionIndex];

  const hasChallenges = currentSlot.challengeSlots.some(c => c !== null);
  if (!hasChallenges) {
    // Skip challenge phase
    return { ...state, turnPhase: 'buy' };
  }

  return state;
}

export function endTurn(state: GameState): GameState {
  const activePlayer = state.players[state.activePlayerIndex];

  // Discard non-permanent cards from hand
  const toDiscard = activePlayer.hand.filter(c => {
    if (c.category === 'skill') return !(c as SkillCard).permanent;
    return true;
  });
  const permanentSkills = activePlayer.hand.filter(c =>
    c.category === 'skill' && (c as SkillCard).permanent
  ) as SkillCard[];

  const newDiscard = [...activePlayer.discardPile, ...toDiscard];
  const newActiveSkills = [
    ...activePlayer.activeSkills,
    ...permanentSkills,
  ];

  let updatedPlayers = state.players.map(p =>
    p.id === activePlayer.id
      ? {
          ...p,
          hand: [],
          discardPile: newDiscard,
          activeSkills: newActiveSkills,
          hasMovedThisTurn: false,
          actionsRemaining: 1,
          skipNextMove: false,
        }
      : p
  );

  // Respawn any waiting players
  let respawnState = { ...state, players: updatedPlayers };
  for (const p of updatedPlayers) {
    if (p.respawning) {
      respawnState = respawnPlayer(respawnState, { playerId: p.id });
    }
  }
  updatedPlayers = respawnState.players;

  // Advance to next player
  const nextPlayerIndex = (state.activePlayerIndex + 1) % state.players.length;
  const nextPlayer = updatedPlayers[nextPlayerIndex];

  // Draw cards for next player
  const handSize = state.config.handSize + (nextPlayer.activeSkills.some(s => s.definitionId === 'endurance_training') ? 1 : 0);
  const needed = handSize - nextPlayer.hand.length;
  const { drawn, newDeck, newDiscard: nd } = drawCards(nextPlayer.deck, nextPlayer.discardPile, needed);

  const finalPlayers = updatedPlayers.map(p =>
    p.id === nextPlayer.id
      ? { ...p, deck: newDeck, hand: [...p.hand, ...drawn], discardPile: nd }
      : p
  );

  return {
    ...respawnState,
    players: finalPlayers,
    activePlayerIndex: nextPlayerIndex,
    turnPhase: 'play',
    turnGold: 0,
    activeChallenge: null,
    log: addLog(respawnState.log, {
      message: `${nextPlayer.name}'s turn begins.`,
      type: 'system',
      playerName: nextPlayer.name,
      playerColor: nextPlayer.color,
    }),
  };
}

export function playCard(
  state: GameState,
  payload: { playerId: string; cardId: string },
): GameState {
  const player = state.players.find(p => p.id === payload.playerId)!;
  const card = player.hand.find(c => c.id === payload.cardId);
  if (!card) return state;

  let goldGained = 0;

  // Check for gold-producing effects
  if (card.category === 'utility' && (card as UtilityCard).consumable) {
    if (card.definitionId === 'protein_bar') goldGained = 1;
    if (card.definitionId === 'portaledge') goldGained = 2;
  }
  if (card.category === 'tool' && card.definitionId === 'portaledge') goldGained = 2;

  // Remove card from hand (put in discard if not permanent skill)
  const newHand = player.hand.filter(c => c.id !== payload.cardId);
  let newDiscard = [...player.discardPile];

  if (card.category === 'skill' && (card as SkillCard).permanent) {
    // Goes to activeSkills
    const newState = {
      ...state,
      turnGold: state.turnGold + goldGained,
      players: state.players.map(p =>
        p.id === payload.playerId
          ? { ...p, hand: newHand, activeSkills: [...p.activeSkills, card as SkillCard] }
          : p
      ),
      log: addLog(state.log, {
        message: `${player.name} played ${card.name}.`,
        type: 'action',
        playerName: player.name,
        playerColor: player.color,
      }),
    };
    return newState;
  }

  newDiscard = [...newDiscard, card];

  // Food rations: draw 1 card
  let extraDraw: PlayerCard[] = [];
  if (card.definitionId === 'food_rations') {
    const { drawn, newDeck, newDiscard: nd } = drawCards(player.deck, newDiscard, 1);
    extraDraw = drawn;
    return {
      ...state,
      turnGold: state.turnGold + goldGained,
      players: state.players.map(p =>
        p.id === payload.playerId
          ? { ...p, hand: [...newHand, ...extraDraw], deck: newDeck, discardPile: nd }
          : p
      ),
      log: addLog(state.log, {
        message: `${player.name} played ${card.name} and drew a card.`,
        type: 'action',
        playerName: player.name,
        playerColor: player.color,
      }),
    };
  }

  return {
    ...state,
    turnGold: state.turnGold + goldGained,
    players: state.players.map(p =>
      p.id === payload.playerId
        ? { ...p, hand: newHand, discardPile: newDiscard }
        : p
    ),
    log: addLog(state.log, {
      message: `${player.name} played ${card.name}.`,
      type: 'action',
      playerName: player.name,
      playerColor: player.color,
    }),
  };
}

export function buyCard(
  state: GameState,
  payload: { playerId: string; shopCardId: string },
): GameState {
  const player = state.players.find(p => p.id === payload.playerId)!;
  const card = state.shop.available.find(c => c.id === payload.shopCardId);
  if (!card) return state;

  const totalGold = state.turnGold + player.gold;
  if (totalGold < card.cost) return state;

  let goldFromTurn = state.turnGold;
  let playerGold = player.gold;
  if (goldFromTurn >= card.cost) {
    goldFromTurn -= card.cost;
  } else {
    const rem = card.cost - goldFromTurn;
    goldFromTurn = 0;
    playerGold -= rem;
  }

  const newAvailable = state.shop.available.filter(c => c.id !== payload.shopCardId);
  let newDrawPile = [...state.shop.drawPile];
  let refilled: PlayerCard[] = [];
  if (newDrawPile.length > 0) {
    refilled = [newDrawPile.shift()!];
  }

  return {
    ...state,
    turnGold: goldFromTurn,
    shop: {
      available: [...newAvailable, ...refilled],
      drawPile: newDrawPile,
    },
    players: state.players.map(p =>
      p.id === payload.playerId
        ? { ...p, discardPile: [...p.discardPile, card], gold: playerGold }
        : p
    ),
    log: addLog(state.log, {
      message: `${player.name} acquired ${card.name} (cost ${card.cost}).`,
      type: 'action',
      playerName: player.name,
      playerColor: player.color,
    }),
  };
}
