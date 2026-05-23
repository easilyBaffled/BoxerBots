import { useGame } from '../../context/GameContext';
import { BACKGROUNDS } from '../../data/backgrounds';
import styles from './TurnControls.module.css';

export function TurnControls() {
  const { state, dispatch } = useGame();
  const { turnPhase, players, activePlayerIndex, board, turnGold, config } = state;
  const activePlayer = players[activePlayerIndex];
  const currentSlot = board.mountainSlots[activePlayer.positionIndex];
  const totalGold = turnGold + activePlayer.gold;
  const bg = BACKGROUNDS.find(b => b.id === activePlayer.backgroundId);

  const targetSlotUp = board.mountainSlots[activePlayer.positionIndex + 1];
  const targetSlotUpFull = targetSlotUp
    ? targetSlotUp.occupants.length >= targetSlotUp.mountainCard.playerSpaces &&
      !targetSlotUp.occupants.includes(activePlayer.id)
    : false;

  const canMoveUp = targetSlotUp
    ? targetSlotUp.occupants.length < targetSlotUp.mountainCard.playerSpaces ||
      targetSlotUp.occupants.includes(activePlayer.id)
    : false;

  const canMoveDown = activePlayer.positionIndex > 0;
  const canJostle = targetSlotUpFull && totalGold >= config.jostleCost;

  const canPlaceCamp =
    currentSlot.mountainCard.allowsCamp &&
    !currentSlot.camp &&
    activePlayer.campsPlaced < activePlayer.maxCamps &&
    totalGold >= config.campCost;

  const move = (delta: 1 | -1) =>
    dispatch({ type: 'MOVE_PLAYER', payload: { playerId: activePlayer.id, delta } });

  const jostle = () => {
    if (!targetSlotUp) return;
    const targets = targetSlotUp.occupants.filter(id => id !== activePlayer.id);
    if (targets.length === 0) return;
    dispatch({
      type: 'INITIATE_JOSTLE',
      payload: { attackerId: activePlayer.id, targetId: targets[0], slotIndex: activePlayer.positionIndex + 1 },
    });
  };

  return (
    <div className={styles.controls}>
      {/* Player identity */}
      {bg && (
        <div className={styles.bgBadge}>
          <span className={styles.bgIcon}>{bg.icon}</span>
          <span className={styles.bgName}>{bg.name}</span>
          <span className={styles.bgFlavor}>{bg.flavor}</span>
        </div>
      )}

      <div className={styles.goldDisplay}>
        <span className={styles.goldLabel}>Gold</span>
        <span className={styles.goldValue}>💰 {totalGold}</span>
        {activePlayer.gold > 0 && <span className={styles.goldBreak}>({activePlayer.gold} banked)</span>}
      </div>

      {turnPhase === 'play' && (
        <div className={styles.phaseSection}>
          <div className={styles.hint}>Playing a card <strong>discards it</strong>. Use cards for their effects (draw, gold, permanent skills) — or skip and save them for a challenge.</div>
          <button className={styles.primaryBtn} onClick={() => dispatch({ type: 'ADVANCE_PHASE' })}>
            Done Playing →
          </button>
        </div>
      )}

      {turnPhase === 'move' && (
        <div className={styles.phaseSection}>
          <div className={styles.hint}>
            Move up the mountain. Challenges fire automatically on entry.
          </div>
          {(canMoveUp || canMoveDown) && (
            <div className={styles.moveButtons}>
              {canMoveUp && (
                <button className={styles.moveBtn} onClick={() => move(1)}>
                  ↑ Climb
                </button>
              )}
              {canMoveDown && (
                <button className={styles.moveBtn} onClick={() => move(-1)}>
                  ↓ Descend
                </button>
              )}
            </div>
          )}
          {canJostle && (
            <div className={styles.jostleInfo}>
              Space above is full!
              <button className={styles.jostleBtn} onClick={jostle}>
                Jostle ({config.jostleCost}g)
              </button>
            </div>
          )}
          {activePlayer.hasMovedThisTurn ? (
            <button className={styles.primaryBtn} onClick={() => dispatch({ type: 'ADVANCE_PHASE' })}>
              Done Moving →
            </button>
          ) : (
            <button className={styles.secondaryBtn} onClick={() => dispatch({ type: 'ADVANCE_PHASE' })}>
              Skip Move →
            </button>
          )}
        </div>
      )}

      {turnPhase === 'buy' && (
        <div className={styles.phaseSection}>
          <div className={styles.hint}>Spend gold on cards from the shop.</div>

          {currentSlot.camp && (
            <div className={styles.stashSection}>
              <div className={styles.stashHeader}>⛺ Camp Stash</div>

              {currentSlot.camp.stash.length === 0 && (
                <p className={styles.stashEmpty}>Empty — stash cards here for safekeeping.</p>
              )}

              {currentSlot.camp.stash.map(({ card, ownerId }) => {
                const isOwn = ownerId === activePlayer.id;
                const depositor = state.players.find(p => p.id === ownerId);
                const canTake = isOwn || !activePlayer.hasLootedStashThisTurn;
                return (
                  <div key={card.id} className={styles.stashRow}>
                    <span className={styles.stashCardName}>
                      {card.name}
                      {!isOwn && <span className={styles.stashOwner}> ({depositor?.name})</span>}
                    </span>
                    <button
                      className={styles.stashTakeBtn}
                      onClick={() => dispatch({ type: 'TAKE_STASH_CARD', payload: { playerId: activePlayer.id, cardId: card.id } })}
                      disabled={!canTake}
                      title={!canTake ? 'Already looted once this turn' : isOwn ? 'Retrieve your card' : 'Take this card'}
                    >
                      {isOwn ? 'Retrieve' : 'Take'}
                    </button>
                  </div>
                );
              })}

              {activePlayer.hand.length > 0 && (
                <>
                  <div className={styles.stashDivider}>Your hand — stash a card:</div>
                  {activePlayer.hand.map(card => (
                    <div key={card.id} className={styles.stashRow}>
                      <span className={styles.stashCardName}>{card.name}</span>
                      <button
                        className={styles.stashDepositBtn}
                        onClick={() => dispatch({ type: 'STASH_CARD', payload: { playerId: activePlayer.id, cardId: card.id } })}
                      >
                        Stash
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {canPlaceCamp && (
            <button
              className={styles.campBtn}
              onClick={() => dispatch({
                type: 'PLACE_CAMP',
                payload: { playerId: activePlayer.id, mountainSlotIndex: activePlayer.positionIndex },
              })}
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
