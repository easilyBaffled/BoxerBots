import type { GameState } from '../types/game';
import { addLog } from './logHelpers';
import { openChallenge } from './challengeLogic';
import { respawnPlayer } from './respawnLogic';

export { respawnPlayer };

export function movePlayer(
  state: GameState,
  payload: { playerId: string; delta: 1 | -1 },
): GameState {
  const { playerId, delta } = payload;
  const player = state.players.find(p => p.id === playerId)!;
  const targetIndex = player.positionIndex + delta;

  if (targetIndex < 0 || targetIndex >= state.board.mountainSlots.length) return state;

  const targetSlot = state.board.mountainSlots[targetIndex];
  const { playerSpaces, name } = targetSlot.mountainCard;

  if (targetSlot.occupants.length >= playerSpaces && !targetSlot.occupants.includes(playerId)) {
    return state;
  }

  const newSlots = state.board.mountainSlots.map((slot, idx) => {
    if (idx === player.positionIndex) {
      return { ...slot, occupants: slot.occupants.filter(id => id !== playerId) };
    }
    if (idx === targetIndex) {
      return { ...slot, occupants: [...slot.occupants, playerId] };
    }
    return slot;
  });

  let newState: GameState = {
    ...state,
    board: { ...state.board, mountainSlots: newSlots },
    players: state.players.map(p =>
      p.id === playerId ? { ...p, positionIndex: targetIndex, hasMovedThisTurn: true } : p
    ),
    log: addLog(state.log, {
      message: `${player.name} moved ${delta > 0 ? 'up' : 'down'} to ${name}.`,
      type: 'action',
      playerName: player.name,
      playerColor: player.color,
    }),
  };

  if (!targetSlot.revealed && delta > 0) {
    newState = revealCard(newState, { slotIndex: targetIndex });
  }

  if (targetIndex === state.board.summitIndex) {
    return {
      ...newState,
      gamePhase: 'victory',
      winner: playerId,
      log: addLog(newState.log, {
        message: `${player.name} reached THE SUMMIT! They win!`,
        type: 'system',
        playerName: player.name,
        playerColor: player.color,
      }),
    };
  }

  // Trigger challenges on entry
  const updatedTargetSlot = newState.board.mountainSlots[targetIndex];
  const firstChallengeIdx = updatedTargetSlot.challengeSlots.findIndex(c => c !== null);
  if (firstChallengeIdx !== -1) {
    // canRetreat: only when moving up (retreating downward from a challenge makes sense)
    const canRetreat = delta > 0 && targetIndex > 0;
    newState = openChallenge(newState, targetIndex, firstChallengeIdx, canRetreat);
  }

  return newState;
}

export function revealCard(
  state: GameState,
  payload: { slotIndex: number },
): GameState {
  const slot = state.board.mountainSlots[payload.slotIndex];
  if (slot.revealed) return state;

  const newSlots = state.board.mountainSlots.map((s, i) =>
    i === payload.slotIndex ? { ...s, revealed: true } : s
  );

  return {
    ...state,
    board: { ...state.board, mountainSlots: newSlots },
    log: addLog(state.log, {
      message: `The mountain reveals: ${slot.mountainCard.name}!`,
      type: 'info',
    }),
  };
}

export function placeCamp(
  state: GameState,
  payload: { playerId: string; mountainSlotIndex: number },
): GameState {
  const { playerId, mountainSlotIndex } = payload;
  const player = state.players.find(p => p.id === playerId)!;
  const slot = state.board.mountainSlots[mountainSlotIndex];

  if (!slot.mountainCard.allowsCamp) return state;
  if (slot.camp) return state;
  if (player.campsPlaced >= player.maxCamps) return state;

  const totalGold = state.turnGold + player.gold;
  if (totalGold < state.config.campCost) return state;

  const campCost = state.config.campCost;
  let goldFromTurn = state.turnGold;
  let goldFromPlayer = player.gold;
  if (goldFromTurn >= campCost) {
    goldFromTurn -= campCost;
  } else {
    goldFromPlayer -= campCost - goldFromTurn;
    goldFromTurn = 0;
  }

  const camp = {
    id: `camp_${playerId}_${mountainSlotIndex}`,
    ownerId: playerId,
    ownerName: player.name,
    ownerColor: player.color,
  };

  const newSlots = state.board.mountainSlots.map((s, i) =>
    i === mountainSlotIndex ? { ...s, camp } : s
  );

  return {
    ...state,
    board: { ...state.board, mountainSlots: newSlots },
    players: state.players.map(p =>
      p.id === playerId
        ? { ...p, campsPlaced: p.campsPlaced + 1, gold: goldFromPlayer }
        : p
    ),
    turnGold: goldFromTurn,
    log: addLog(state.log, {
      message: `${player.name} placed a camp at ${slot.mountainCard.name}!`,
      type: 'action',
      playerName: player.name,
      playerColor: player.color,
    }),
  };
}

export function initiateJostle(
  state: GameState,
  payload: { attackerId: string; targetId: string; slotIndex: number },
): GameState {
  const attacker = state.players.find(p => p.id === payload.attackerId)!;
  const target = state.players.find(p => p.id === payload.targetId)!;

  const totalGold = state.turnGold + attacker.gold;
  if (totalGold < state.config.jostleCost) return state;

  return {
    ...state,
    pendingJostle: payload,
    log: addLog(state.log, {
      message: `${attacker.name} initiates a jostle against ${target.name}!`,
      type: 'combat',
      playerName: attacker.name,
      playerColor: attacker.color,
    }),
  };
}

export function resolveJostle(state: GameState): GameState {
  if (!state.pendingJostle) return state;
  const { attackerId, targetId } = state.pendingJostle;

  const attacker = state.players.find(p => p.id === attackerId)!;
  const target = state.players.find(p => p.id === targetId)!;

  const hasIronWill = target.activeSkills.some(s => s.definitionId === 'iron_will');
  if (hasIronWill && target.hand.length >= 2) {
    const toDiscard = target.hand.slice(0, 2);
    return {
      ...state,
      pendingJostle: null,
      players: state.players.map(p =>
        p.id === targetId
          ? { ...p, hand: p.hand.slice(2), discardPile: [...p.discardPile, ...toDiscard] }
          : p
      ),
      log: addLog(state.log, {
        message: `${target.name} uses Iron Will to resist the jostle! (discards 2 cards)`,
        type: 'combat',
        playerName: target.name,
        playerColor: target.color,
      }),
    };
  }

  const jostleCost = state.config.jostleCost;
  let goldFromTurn = state.turnGold;
  let attackerGold = attacker.gold;
  if (goldFromTurn >= jostleCost) {
    goldFromTurn -= jostleCost;
  } else {
    attackerGold -= jostleCost - goldFromTurn;
    goldFromTurn = 0;
  }

  const targetNewIndex = Math.max(0, target.positionIndex - 1);

  const newSlots = state.board.mountainSlots.map((slot, i) => {
    if (i === target.positionIndex) {
      return { ...slot, occupants: slot.occupants.filter(id => id !== targetId) };
    }
    if (i === targetNewIndex) {
      return { ...slot, occupants: [...slot.occupants, targetId] };
    }
    return slot;
  });

  return {
    ...state,
    board: { ...state.board, mountainSlots: newSlots },
    pendingJostle: null,
    turnGold: goldFromTurn,
    players: state.players.map(p => {
      if (p.id === targetId) return { ...p, positionIndex: targetNewIndex };
      if (p.id === attackerId) return { ...p, gold: attackerGold };
      return p;
    }),
    log: addLog(state.log, {
      message: `${attacker.name} jostled ${target.name} down to ${state.board.mountainSlots[targetNewIndex].mountainCard.name}!`,
      type: 'combat',
      playerName: attacker.name,
      playerColor: attacker.color,
    }),
  };
}
