import type { GameState } from '../types/game';
import { addLog } from './logHelpers';

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

  // Check space available
  if (targetSlot.occupants.length >= playerSpaces && !targetSlot.occupants.includes(playerId)) {
    // No room — player must jostle; don't move, let UI prompt
    return state;
  }

  // Remove from old slot, add to new slot
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

  // Reveal card if needed
  if (!targetSlot.revealed && delta > 0) {
    newState = revealCard(newState, { slotIndex: targetIndex });
  }

  // Check win
  if (targetIndex === state.board.summitIndex) {
    newState = {
      ...newState,
      gamePhase: 'victory',
      winner: playerId,
      log: addLog(newState.log, {
        message: `🏔️ ${player.name} reached THE SUMMIT! They win!`,
        type: 'system',
        playerName: player.name,
        playerColor: player.color,
      }),
    };
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
    const remainder = campCost - goldFromTurn;
    goldFromTurn = 0;
    goldFromPlayer -= remainder;
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
  const { attackerId, targetId, slotIndex } = state.pendingJostle;

  const attacker = state.players.find(p => p.id === attackerId)!;
  const target = state.players.find(p => p.id === targetId)!;

  // Check if target has Iron Will and enough cards
  const hasIronWill = target.activeSkills.some(s => s.definitionId === 'iron_will');
  if (hasIronWill && target.hand.length >= 2) {
    // Iron Will: target discards 2 cards to resist
    const toDiscard = target.hand.slice(0, 2);
    const newState = {
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
    return newState;
  }

  // Pay jostle cost
  const jostleCost = state.config.jostleCost;
  let goldFromTurn = state.turnGold;
  let attackerGold = attacker.gold;
  if (goldFromTurn >= jostleCost) {
    goldFromTurn -= jostleCost;
  } else {
    const rem = jostleCost - goldFromTurn;
    goldFromTurn = 0;
    attackerGold -= rem;
  }

  // Move target down one slot
  const targetNewIndex = Math.max(0, target.positionIndex - 1);

  // Remove target from current slot, place in new slot
  let newSlots = state.board.mountainSlots.map((slot, i) => {
    if (i === slotIndex) {
      return { ...slot, occupants: slot.occupants.filter(id => id !== targetId) };
    }
    if (i === targetNewIndex) {
      return { ...slot, occupants: [...slot.occupants, targetId] };
    }
    return slot;
  });

  let newState: GameState = {
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

  return newState;
}

export function respawnPlayer(state: GameState, payload: { playerId: string }): GameState {
  const player = state.players.find(p => p.id === payload.playerId)!;
  if (!player.respawning || player.respawnTargetIndex === null) return state;

  const targetIndex = player.respawnTargetIndex;
  const targetSlot = state.board.mountainSlots[targetIndex];

  // Add to respawn slot occupants
  const newSlots = state.board.mountainSlots.map((s, i) => {
    if (i === targetIndex) {
      if (!s.occupants.includes(payload.playerId)) {
        return { ...s, occupants: [...s.occupants, payload.playerId] };
      }
    }
    return s;
  });

  return {
    ...state,
    board: { ...state.board, mountainSlots: newSlots },
    players: state.players.map(p =>
      p.id === payload.playerId
        ? { ...p, respawning: false, respawnTargetIndex: null, positionIndex: targetIndex }
        : p
    ),
    log: addLog(state.log, {
      message: `${player.name} respawned at ${targetSlot.mountainCard.name}.`,
      type: 'info',
      playerName: player.name,
      playerColor: player.color,
    }),
  };
}
