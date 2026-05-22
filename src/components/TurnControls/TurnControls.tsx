import { useGame } from '../../context/GameContext';
import styles from './TurnControls.module.css';

export function TurnControls() {
  const { state, dispatch } = useGame();
  const { turnPhase, players, activePlayerIndex, board, turnGold, config } = state;
  const activePlayer = players[activePlayerIndex];
  const currentSlot = board.mountainSlots[activePlayer.positionIndex];
  const totalGold = turnGold + activePlayer.gold;

  const canMoveUp = () => {
    const ti = activePlayer.positionIndex + 1;
    if (ti >= board.mountainSlots.length) return false;
    const slot = board.mountainSlots[ti];
    return slot.occupants.length < slot.mountainCard.playerSpaces || slot.occupants.includes(activePlayer.id);
  };

  const canMoveDown = () => activePlayer.positionIndex > 0;

  const targetSlotUp = board.mountainSlots[activePlayer.positionIndex + 1];
  const targetSlotUpFull = targetSlotUp
    ? targetSlotUp.occupants.length >= targetSlotUp.mountainCard.playerSpaces && !targetSlotUp.occupants.includes(activePlayer.id)
    : false;

  const canJostle = targetSlotUpFull && totalGold >= config.jostleCost;

  const canPlaceCamp = () =>
    currentSlot.mountainCard.allowsCamp &&
    !currentSlot.camp &&
    activePlayer.campsPlaced < activePlayer.maxCamps &&
    totalGold >= config.campCost;

  const hasChallenges = currentSlot.challengeSlots.some(c => c !== null);

  const move = (delta: 1 | -1) => {
    dispatch({ type: 'MOVE_PLAYER', payload: { playerId: activePlayer.id, delta } });
  };

  const beginChallenge = () => {
    const firstChallengeIdx = currentSlot.challengeSlots.findIndex(c => c !== null);
    if (firstChallengeIdx === -1) return;
    dispatch({
      type: 'BEGIN_CHALLENGE',
      payload: {
        mountainSlotIndex: activePlayer.positionIndex,
        challengeSlotIndex: firstChallengeIdx,
      },
    });
  };

  const jostleTarget = () => {
    if (!targetSlotUp) return;
    const targets = targetSlotUp.occupants.filter(id => id !== activePlayer.id);
    if (targets.length === 0) return;
    // For simplicity, jostle the first occupant (UI could show a picker)
    dispatch({
      type: 'INITIATE_JOSTLE',
      payload: { attackerId: activePlayer.id, targetId: targets[0], slotIndex: activePlayer.positionIndex + 1 },
    });
  };

  return (
    <div className={styles.controls}>
      <div className={styles.goldDisplay}>
        <span className={styles.goldLabel}>Gold available</span>
        <span className={styles.goldValue}>💰 {totalGold}</span>
        {activePlayer.gold > 0 && <span className={styles.goldBreak}>(bank: {activePlayer.gold})</span>}
      </div>

      {turnPhase === 'play' && (
        <div className={styles.phaseSection}>
          <div className={styles.hint}>Play cards from your hand, then advance.</div>
          <button className={styles.primaryBtn} onClick={() => dispatch({ type: 'ADVANCE_PHASE' })}>
            Done Playing →
          </button>
        </div>
      )}

      {turnPhase === 'move' && (
        <div className={styles.phaseSection}>
          <div className={styles.hint}>Move up or down the mountain.</div>
          <div className={styles.moveButtons}>
            <button
              className={styles.moveBtn}
              onClick={() => move(1)}
              disabled={!canMoveUp() && !targetSlotUpFull}
              title="Move up"
            >
              ↑ Climb
            </button>
            <button
              className={styles.moveBtn}
              onClick={() => move(-1)}
              disabled={!canMoveDown()}
              title="Move down"
            >
              ↓ Retreat
            </button>
          </div>
          {targetSlotUpFull && (
            <div className={styles.jostleInfo}>
              Next space full!
              <button
                className={styles.jostleBtn}
                onClick={jostleTarget}
                disabled={!canJostle}
              >
                Jostle ({config.jostleCost}g)
              </button>
            </div>
          )}
          {activePlayer.hasMovedThisTurn && (
            <button className={styles.primaryBtn} onClick={() => dispatch({ type: 'ADVANCE_PHASE' })}>
              Done Moving →
            </button>
          )}
          {!activePlayer.hasMovedThisTurn && (
            <button className={styles.secondaryBtn} onClick={() => dispatch({ type: 'ADVANCE_PHASE' })}>
              Skip Move →
            </button>
          )}
        </div>
      )}

      {turnPhase === 'challenge' && (
        <div className={styles.phaseSection}>
          {hasChallenges ? (
            <>
              <div className={styles.hint}>You must face the challenges on this card.</div>
              <button className={styles.primaryBtn} onClick={beginChallenge}>
                Face Challenge
              </button>
              <button className={styles.dangerBtn} onClick={() => dispatch({ type: 'SKIP_CHALLENGE' })}>
                Skip (take penalty)
              </button>
            </>
          ) : (
            <>
              <div className={styles.hint}>No challenges here. Safe passage!</div>
              <button className={styles.primaryBtn} onClick={() => dispatch({ type: 'ADVANCE_PHASE' })}>
                Continue →
              </button>
            </>
          )}
        </div>
      )}

      {turnPhase === 'buy' && (
        <div className={styles.phaseSection}>
          <div className={styles.hint}>Spend gold on cards from the shop.</div>
          {canPlaceCamp() && (
            <button
              className={styles.campBtn}
              onClick={() => dispatch({ type: 'PLACE_CAMP', payload: { playerId: activePlayer.id, mountainSlotIndex: activePlayer.positionIndex } })}
            >
              ⛺ Place Camp ({config.campCost}g)
            </button>
          )}
          <button className={styles.primaryBtn} onClick={() => dispatch({ type: 'ADVANCE_PHASE' })}>
            End Turn
          </button>
        </div>
      )}
    </div>
  );
}
