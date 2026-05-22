import type { GameState } from '../types/game';
import { addLog } from './logHelpers';

export function respawnPlayer(state: GameState, payload: { playerId: string }): GameState {
  const player = state.players.find(p => p.id === payload.playerId)!;
  if (!player.respawning || player.respawnTargetIndex === null) return state;

  const targetIndex = player.respawnTargetIndex;
  const targetSlot = state.board.mountainSlots[targetIndex];

  const newSlots = state.board.mountainSlots.map((s, i) => {
    if (i === targetIndex && !s.occupants.includes(payload.playerId)) {
      return { ...s, occupants: [...s.occupants, payload.playerId] };
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
