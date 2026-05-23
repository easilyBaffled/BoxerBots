import type { GameState } from '../types/game';
import type { GameAction } from '../types/actions';
import { buildInitialState } from './setupLogic';
import { advancePhase, endTurn, playCard, buyCard } from './turnLogic';
import { movePlayer, revealCard, placeCamp, stashCard, takeStashCard, initiateJostle, resolveJostle } from './boardLogic';
import { commitCard, uncommitCard, resolveChallenge, loseChallenge, retreatFromChallenge, playerFall } from './challengeLogic';
import { respawnPlayer } from './respawnLogic';
import { addLog } from './logHelpers';

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SETUP_START_GAME':
      return buildInitialState(action.payload.playerNames, action.payload.backgroundIds);

    case 'ADVANCE_PHASE':
      return advancePhase(state);

    case 'END_TURN':
      return endTurn(state);

    case 'PLAY_CARD':
      return playCard(state, action.payload);

    case 'MOVE_PLAYER':
      return movePlayer(state, action.payload);

    case 'REVEAL_MOUNTAIN_CARD':
      return revealCard(state, action.payload);

    case 'COMMIT_CARD_TO_CHALLENGE':
      return commitCard(state, action.payload);

    case 'UNCOMMIT_CARD_FROM_CHALLENGE':
      return uncommitCard(state, action.payload);

    case 'RESOLVE_CHALLENGE':
      return resolveChallenge(state);

    case 'LOSE_CHALLENGE':
      return loseChallenge(state);

    case 'RETREAT_FROM_CHALLENGE':
      return retreatFromChallenge(state);

    case 'BUY_CARD':
      return buyCard(state, action.payload);

    case 'PLACE_CAMP':
      return placeCamp(state, action.payload);

    case 'STASH_CARD':
      return stashCard(state, action.payload);

    case 'TAKE_STASH_CARD':
      return takeStashCard(state, action.payload);

    case 'INITIATE_JOSTLE':
      return initiateJostle(state, action.payload);

    case 'RESOLVE_JOSTLE':
      return resolveJostle(state);

    case 'PLAYER_FALL':
      return playerFall(state, action.payload.playerId);

    case 'RESPAWN_PLAYER':
      return respawnPlayer(state, action.payload);

    case 'SELECT_CARD':
      return { ...state, selectedCardId: action.payload.cardId };

    case 'DISMISS_MODAL':
      return { ...state, activeChallenge: null, pendingJostle: null, selectedCardId: null };

    case 'DECLARE_VICTORY':
      return {
        ...state,
        gamePhase: 'victory',
        winner: action.payload.playerId,
        log: addLog(state.log, { message: 'Victory declared!', type: 'system' }),
      };

    default:
      return state;
  }
}
