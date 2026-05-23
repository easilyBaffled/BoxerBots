import type { GameState, ActiveChallenge } from '../types/game';
import type { PlayerCard, SkillCard, StatBlock, StatDomain, ChallengeCardDef } from '../types/cards';
import { addLog } from './logHelpers';
import { drawCards } from './deckLogic';

export function calculateInnate(baseStats: StatBlock, challenge: ChallengeCardDef): number {
  let total = 0;
  for (const domain of challenge.requiredDomains) {
    total += (baseStats as Record<StatDomain, number>)[domain] ?? 0;
  }
  return total;
}

export function calculateTotal(
  committedCards: PlayerCard[],
  activeSkills: SkillCard[],
  baseStats: StatBlock,
  challenge: ChallengeCardDef,
): number {
  let total = calculateInnate(baseStats, challenge);
  for (const card of committedCards) {
    for (const domain of challenge.requiredDomains) {
      total += (card.stats as Record<StatDomain, number>)[domain] ?? 0;
    }
  }
  for (const skill of activeSkills) {
    if (skill.passiveBonus) {
      for (const domain of challenge.requiredDomains) {
        total += (skill.passiveBonus as Record<StatDomain, number>)[domain] ?? 0;
      }
    }
  }
  return total;
}

export function openChallenge(
  state: GameState,
  mountainSlotIndex: number,
  challengeSlotIndex: number,
  canRetreat: boolean,
): GameState {
  const slot = state.board.mountainSlots[mountainSlotIndex];
  const challenge = slot?.challengeSlots[challengeSlotIndex];
  if (!challenge) return state;

  const activePlayer = state.players[state.activePlayerIndex];
  const innateTotal = calculateInnate(activePlayer.baseStats, challenge);
  const fullTotal = calculateTotal([], activePlayer.activeSkills, activePlayer.baseStats, challenge);

  const ac: ActiveChallenge = {
    mountainSlotIndex,
    challengeSlotIndex,
    challengeCard: challenge,
    committedCardIds: [],
    innateTotal,
    currentStatTotal: fullTotal,
    outcome: null,
    canRetreat,
  };

  return {
    ...state,
    activeChallenge: ac,
    log: addLog(state.log, {
      message: `${activePlayer.name} faces: ${challenge.name} (pass ${challenge.passThreshold} / complete ${challenge.solveThreshold})`,
      type: 'challenge',
      playerName: activePlayer.name,
      playerColor: activePlayer.color,
    }),
  };
}

export function commitCard(
  state: GameState,
  payload: { playerId: string; cardId: string },
): GameState {
  if (!state.activeChallenge) return state;
  const player = state.players.find(p => p.id === payload.playerId);
  if (!player) return state;

  const cardInHand = player.hand.find(c => c.id === payload.cardId);
  if (!cardInHand) return state;

  const committed = [...state.activeChallenge.committedCardIds, payload.cardId];
  const allCommittedCards = player.hand.filter(c => committed.includes(c.id));
  const newTotal = calculateTotal(allCommittedCards, player.activeSkills, player.baseStats, state.activeChallenge.challengeCard);

  return {
    ...state,
    activeChallenge: {
      ...state.activeChallenge,
      committedCardIds: committed,
      currentStatTotal: newTotal,
    },
  };
}

export function uncommitCard(
  state: GameState,
  payload: { playerId: string; cardId: string },
): GameState {
  if (!state.activeChallenge) return state;
  const player = state.players.find(p => p.id === payload.playerId);
  if (!player) return state;

  const committed = state.activeChallenge.committedCardIds.filter(id => id !== payload.cardId);
  const allCommittedCards = player.hand.filter(c => committed.includes(c.id));
  const newTotal = calculateTotal(allCommittedCards, player.activeSkills, player.baseStats, state.activeChallenge.challengeCard);

  return {
    ...state,
    activeChallenge: {
      ...state.activeChallenge,
      committedCardIds: committed,
      currentStatTotal: newTotal,
    },
  };
}

export function resolveChallenge(state: GameState): GameState {
  if (!state.activeChallenge) return state;

  const ac = state.activeChallenge;
  const { passThreshold, solveThreshold, solveReward } = ac.challengeCard;
  const total = ac.currentStatTotal;

  let outcome: 'pass' | 'solve' | 'fail';
  if (total >= solveThreshold) {
    outcome = 'solve';
  } else if (total >= passThreshold) {
    outcome = 'pass';
  } else {
    outcome = 'fail';
  }

  const activePlayer = state.players[state.activePlayerIndex];

  // Move committed cards to discard
  const committed = new Set(ac.committedCardIds);
  const spentCards = activePlayer.hand.filter(c => committed.has(c.id));
  const afterHand = activePlayer.hand.filter(c => !committed.has(c.id));
  const afterDiscard = [...activePlayer.discardPile, ...spentCards];

  let newState: GameState = {
    ...state,
    activeChallenge: null,
    players: state.players.map(p =>
      p.id === activePlayer.id
        ? { ...p, hand: afterHand, discardPile: afterDiscard }
        : p
    ),
  };

  if (outcome === 'solve') {
    // Remove challenge permanently from the board
    const newSlots = [...newState.board.mountainSlots];
    const slot = { ...newSlots[ac.mountainSlotIndex] };
    const challengeSlots = [...slot.challengeSlots];
    challengeSlots[ac.challengeSlotIndex] = null;
    slot.challengeSlots = challengeSlots;
    newSlots[ac.mountainSlotIndex] = slot;
    newState = { ...newState, board: { ...newState.board, mountainSlots: newSlots } };

    // Apply solve reward
    let rewardGold = solveReward.gold ?? 0;
    let rewardDraw = solveReward.draw ?? 0;

    if (rewardGold > 0) {
      newState = { ...newState, turnGold: newState.turnGold + rewardGold };
    }

    if (rewardDraw > 0) {
      const solver = newState.players.find(p => p.id === activePlayer.id)!;
      const { drawn, newDeck, newDiscard } = drawCards(solver.deck, solver.discardPile, rewardDraw);
      newState = {
        ...newState,
        players: newState.players.map(p =>
          p.id === activePlayer.id
            ? { ...p, hand: [...p.hand, ...drawn], deck: newDeck, discardPile: newDiscard }
            : p
        ),
      };
    }

    const rewardParts: string[] = [];
    if (rewardGold > 0) rewardParts.push(`${rewardGold} gold`);
    if (rewardDraw > 0) rewardParts.push(`draw ${rewardDraw}`);
    const rewardText = rewardParts.length > 0 ? ` Reward: ${rewardParts.join(', ')}.` : '';

    newState = {
      ...newState,
      log: addLog(newState.log, {
        message: `${activePlayer.name} COMPLETED "${ac.challengeCard.name}"! Removed permanently for all climbers.${rewardText}`,
        type: 'challenge',
        playerName: activePlayer.name,
        playerColor: activePlayer.color,
      }),
    };
  } else if (outcome === 'pass') {
    newState = {
      ...newState,
      log: addLog(newState.log, {
        message: `${activePlayer.name} passed "${ac.challengeCard.name}" (${total}/${passThreshold}).`,
        type: 'challenge',
        playerName: activePlayer.name,
        playerColor: activePlayer.color,
      }),
    };
  } else {
    newState = {
      ...newState,
      log: addLog(newState.log, {
        message: `${activePlayer.name} failed "${ac.challengeCard.name}"! ${ac.challengeCard.failPenalty.description}`,
        type: 'challenge',
        playerName: activePlayer.name,
        playerColor: activePlayer.color,
      }),
    };
    newState = applyFailPenalty(newState, activePlayer.id, ac.challengeCard);
  }

  return newState;
}

export function loseChallenge(state: GameState): GameState {
  if (!state.activeChallenge) return state;
  const ac = state.activeChallenge;
  const activePlayer = state.players[state.activePlayerIndex];

  let newState = {
    ...state,
    activeChallenge: null,
    log: addLog(state.log, {
      message: `${activePlayer.name} gave up on "${ac.challengeCard.name}" — taking the penalty.`,
      type: 'challenge',
      playerName: activePlayer.name,
      playerColor: activePlayer.color,
    }),
  };

  return applyFailPenalty(newState, activePlayer.id, ac.challengeCard);
}

export function retreatFromChallenge(state: GameState): GameState {
  if (!state.activeChallenge) return state;
  const activePlayer = state.players[state.activePlayerIndex];
  const retreatIndex = activePlayer.positionIndex - 1;

  if (retreatIndex < 0) return state;

  const fromIndex = activePlayer.positionIndex;
  const newSlots = state.board.mountainSlots.map((slot, i) => {
    if (i === fromIndex) return { ...slot, occupants: slot.occupants.filter(id => id !== activePlayer.id) };
    if (i === retreatIndex) return { ...slot, occupants: [...slot.occupants, activePlayer.id] };
    return slot;
  });

  let newState: GameState = {
    ...state,
    board: { ...state.board, mountainSlots: newSlots },
    players: state.players.map(p =>
      p.id === activePlayer.id
        ? { ...p, positionIndex: retreatIndex, hasMovedThisTurn: true }
        : p
    ),
    activeChallenge: null,
    log: addLog(state.log, {
      message: `${activePlayer.name} retreated to ${state.board.mountainSlots[retreatIndex].mountainCard.name}.`,
      type: 'action',
      playerName: activePlayer.name,
      playerColor: activePlayer.color,
    }),
  };

  // Trigger first challenge on the retreat destination (can't retreat again)
  const retreatSlot = newState.board.mountainSlots[retreatIndex];
  const firstChIdx = retreatSlot.challengeSlots.findIndex(c => c !== null);
  if (firstChIdx !== -1) {
    newState = openChallenge(newState, retreatIndex, firstChIdx, false);
  }

  return newState;
}

function applyFailPenalty(state: GameState, playerId: string, challenge: ChallengeCardDef): GameState {
  const { type, amount } = challenge.failPenalty;
  const player = state.players.find(p => p.id === playerId)!;

  if (type === 'fall') return playerFall(state, playerId);

  if (type === 'discard') {
    const n = amount ?? 1;
    const toDiscard = player.hand.slice(0, n);
    return {
      ...state,
      players: state.players.map(p =>
        p.id === playerId
          ? { ...p, hand: p.hand.slice(n), discardPile: [...p.discardPile, ...toDiscard] }
          : p
      ),
    };
  }

  if (type === 'skip_turn') {
    return {
      ...state,
      players: state.players.map(p =>
        p.id === playerId ? { ...p, skipNextMove: true } : p
      ),
    };
  }

  if (type === 'lose_card') {
    const n = amount ?? 1;
    return {
      ...state,
      players: state.players.map(p =>
        p.id === playerId ? { ...p, hand: p.hand.slice(n) } : p
      ),
    };
  }

  return state;
}

export function playerFall(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const currentSlot = player.positionIndex;

  let respawnIndex = 0;
  for (let i = currentSlot - 1; i >= 0; i--) {
    if (state.board.mountainSlots[i].camp) {
      respawnIndex = i;
      break;
    }
  }

  const newSlots = state.board.mountainSlots.map((slot, idx) => {
    if (idx === currentSlot) {
      return { ...slot, occupants: slot.occupants.filter(id => id !== playerId) };
    }
    return slot;
  });

  return {
    ...state,
    board: { ...state.board, mountainSlots: newSlots },
    players: state.players.map(p =>
      p.id === playerId
        ? { ...p, respawning: true, respawnTargetIndex: respawnIndex, positionIndex: respawnIndex }
        : p
    ),
    log: addLog(state.log, {
      message: `${player.name} fell! Respawning at ${state.board.mountainSlots[respawnIndex].mountainCard.name}...`,
      type: 'combat',
      playerName: player.name,
      playerColor: player.color,
    }),
  };
}
