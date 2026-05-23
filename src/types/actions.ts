export type GameAction =
  | { type: 'SETUP_START_GAME'; payload: { playerNames: string[]; backgroundIds: string[] } }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'END_TURN' }
  | { type: 'DRAW_CARDS'; payload: { playerId: string; count: number } }
  | { type: 'PLAY_CARD'; payload: { playerId: string; cardId: string } }
  | { type: 'MOVE_PLAYER'; payload: { playerId: string; delta: 1 | -1 } }
  | { type: 'REVEAL_MOUNTAIN_CARD'; payload: { slotIndex: number } }
  | { type: 'COMMIT_CARD_TO_CHALLENGE'; payload: { playerId: string; cardId: string } }
  | { type: 'UNCOMMIT_CARD_FROM_CHALLENGE'; payload: { playerId: string; cardId: string } }
  | { type: 'RESOLVE_CHALLENGE' }
  | { type: 'LOSE_CHALLENGE' }
  | { type: 'RETREAT_FROM_CHALLENGE' }
  | { type: 'BUY_CARD'; payload: { playerId: string; shopCardId: string } }
  | { type: 'REFILL_SHOP' }
  | { type: 'PLACE_CAMP'; payload: { playerId: string; mountainSlotIndex: number } }
  | { type: 'STASH_CARD'; payload: { playerId: string; cardId: string } }
  | { type: 'TAKE_STASH_CARD'; payload: { playerId: string; cardId: string } }
  | { type: 'INITIATE_JOSTLE'; payload: { attackerId: string; targetId: string; slotIndex: number } }
  | { type: 'RESOLVE_JOSTLE' }
  | { type: 'PLAYER_FALL'; payload: { playerId: string } }
  | { type: 'RESPAWN_PLAYER'; payload: { playerId: string } }
  | { type: 'SELECT_CARD'; payload: { cardId: string | null } }
  | { type: 'DISMISS_MODAL' }
  | { type: 'DECLARE_VICTORY'; payload: { playerId: string } };
