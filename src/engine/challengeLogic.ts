import type { GameState, ActiveChallenge, MountainSlot } from '../types/game';
import type { PlayerCard, SkillCard, StatDomain, ChallengeCardDef } from '../types/cards';
import { addLog } from './logHelpers';

export function calculateTotal(
  committedCards: PlayerCard[],
  activeSkills: SkillCard[],
  challenge: ChallengeCardDef,
): number {
  let total = 0;
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

export function beginChallenge(
  state: GameState,
  payload: { mountainSlotIndex: number; challengeSlotIndex: number },
): GameState {
  const slot = state.board.mountainSlots[payload.mountainSlotIndex];
  const challenge = slot?.challengeSlots[payload.challengeSlotIndex];
  if (!challenge) return state;

  const activePlayer = state.players[state.activePlayerIndex];

  // Collect other pending challenge slots on the same mountain card
  const pendingSlots: number[] = [];
  slot.challengeSlots.forEach((c, i) => {
    if (c !== null && i !== payload.challengeSlotIndex) {
      pendingSlots.push(i);
    }
  });

  const ac: ActiveChallenge = {
    mountainSlotIndex: payload.mountainSlotIndex,
    challengeSlotIndex: payload.challengeSlotIndex,
    challengeCard: challenge,
    committedCardIds: [],
    currentStatTotal: calculateTotal([], activePlayer.activeSkills, challenge),
    outcome: null,
    pendingSlots,
  };

  return {
    ...state,
    activeChallenge: ac,
    log: addLog(state.log, {
      message: `${activePlayer.name} faces: ${challenge.name} (need ${challenge.passThreshold} to pass, ${challenge.solveThreshold} to solve)`,
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

  const committed = [
    ...state.activeChallenge.committedCardIds,
    payload.cardId,
  ];
  const allCommittedCards = player.hand.filter(c => committed.includes(c.id));
  const newTotal = calculateTotal(allCommittedCards, player.activeSkills, state.activeChallenge.challengeCard);

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
  const newTotal = calculateTotal(allCommittedCards, player.activeSkills, state.activeChallenge.challengeCard);

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
  const { passThreshold, solveThreshold } = ac.challengeCard;
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
  let newState: GameState = { ...state, activeChallenge: { ...ac, outcome } };

  // Move committed cards to discard
  const committed = new Set(ac.committedCardIds);
  const newHand = activePlayer.hand.filter(c => !committed.has(c.id));
  const spentCards = activePlayer.hand.filter(c => committed.has(c.id));

  let newDiscard = [...activePlayer.discardPile, ...spentCards];

  // Apply outcome
  if (outcome === 'solve') {
    // Remove challenge from slot permanently
    const newSlots = [...newState.board.mountainSlots];
    const slot = { ...newSlots[ac.mountainSlotIndex] };
    const challengeSlots = [...slot.challengeSlots];
    challengeSlots[ac.challengeSlotIndex] = null;
    slot.challengeSlots = challengeSlots;
    newSlots[ac.mountainSlotIndex] = slot;

    newState = {
      ...newState,
      board: { ...newState.board, mountainSlots: newSlots },
      log: addLog(newState.log, {
        message: `${activePlayer.name} SOLVED "${ac.challengeCard.name}"! Removed permanently for all climbers.`,
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
    // fail
    newState = {
      ...newState,
      log: addLog(newState.log, {
        message: `${activePlayer.name} FAILED "${ac.challengeCard.name}"! Penalty: ${ac.challengeCard.failPenalty.description}`,
        type: 'challenge',
        playerName: activePlayer.name,
        playerColor: activePlayer.color,
      }),
    };
    newState = applyFailPenalty(newState, activePlayer.id, ac.challengeCard);
    // Re-read player after penalty
    const updatedPlayer = newState.players.find(p => p.id === activePlayer.id)!;
    newHand.length = 0;
    newHand.push(...updatedPlayer.hand);
    newDiscard = [...updatedPlayer.discardPile, ...spentCards];
  }

  // Update player hand/discard
  newState = {
    ...newState,
    players: newState.players.map(p =>
      p.id === activePlayer.id
        ? { ...p, hand: newHand, discardPile: newDiscard }
        : p
    ),
    activeChallenge: null,
  };

  // Check if there are more pending challenge slots to show
  if (ac.pendingSlots.length > 0) {
    const nextSlot = ac.pendingSlots[0];
    const remaining = ac.pendingSlots.slice(1);
    const slot: MountainSlot = newState.board.mountainSlots[ac.mountainSlotIndex];
    const nextChallenge = slot?.challengeSlots[nextSlot];
    if (nextChallenge) {
      const updPlayer = newState.players.find(p => p.id === activePlayer.id)!;
      newState = {
        ...newState,
        activeChallenge: {
          mountainSlotIndex: ac.mountainSlotIndex,
          challengeSlotIndex: nextSlot,
          challengeCard: nextChallenge,
          committedCardIds: [],
          currentStatTotal: calculateTotal([], updPlayer.activeSkills, nextChallenge),
          outcome: null,
          pendingSlots: remaining,
        },
      };
    }
  }

  return newState;
}

export function skipChallenge(state: GameState): GameState {
  if (!state.activeChallenge) return state;
  const ac = state.activeChallenge;
  const activePlayer = state.players[state.activePlayerIndex];

  let newState = {
    ...state,
    log: addLog(state.log, {
      message: `${activePlayer.name} skipped "${ac.challengeCard.name}" — taking the penalty.`,
      type: 'challenge',
      playerName: activePlayer.name,
      playerColor: activePlayer.color,
    }),
  };

  newState = applyFailPenalty(newState, activePlayer.id, ac.challengeCard);
  newState = { ...newState, activeChallenge: null };

  // Check pending
  if (ac.pendingSlots.length > 0) {
    const nextSlot = ac.pendingSlots[0];
    const remaining = ac.pendingSlots.slice(1);
    const slot: MountainSlot = newState.board.mountainSlots[ac.mountainSlotIndex];
    const nextChallenge = slot?.challengeSlots[nextSlot];
    if (nextChallenge) {
      const updPlayer = newState.players.find(p => p.id === activePlayer.id)!;
      newState = {
        ...newState,
        activeChallenge: {
          mountainSlotIndex: ac.mountainSlotIndex,
          challengeSlotIndex: nextSlot,
          challengeCard: nextChallenge,
          committedCardIds: [],
          currentStatTotal: calculateTotal([], updPlayer.activeSkills, nextChallenge),
          outcome: null,
          pendingSlots: remaining,
        },
      };
    }
  }

  return newState;
}

function applyFailPenalty(state: GameState, playerId: string, challenge: ChallengeCardDef): GameState {
  const { type, amount } = challenge.failPenalty;
  const player = state.players.find(p => p.id === playerId)!;

  if (type === 'fall') {
    return playerFall(state, playerId);
  }

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
    // Exile n cards from hand (just remove them, no discard)
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

  // Find highest camp at or below current position (any player's camp)
  let respawnIndex = 0;
  for (let i = currentSlot - 1; i >= 0; i--) {
    if (state.board.mountainSlots[i].camp) {
      respawnIndex = i;
      break;
    }
  }

  // Remove from current slot
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
