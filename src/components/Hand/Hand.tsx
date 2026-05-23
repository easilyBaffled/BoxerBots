import { useGame } from '../../context/GameContext';
import { PlayableCard } from './PlayableCard/PlayableCard';
import styles from './Hand.module.css';

export function Hand() {
  const { state, dispatch } = useGame();
  const activePlayer = state.players[state.activePlayerIndex];
  const isPlayPhase = state.turnPhase === 'play';

  const playCard = (cardId: string) => {
    if (!isPlayPhase) return;
    dispatch({ type: 'PLAY_CARD', payload: { playerId: activePlayer.id, cardId } });
  };

  if (activePlayer.hand.length === 0) {
    return (
      <div className={styles.hand}>
        <p className={styles.empty}>No cards in hand</p>
      </div>
    );
  }

  return (
    <div className={styles.hand}>
      <div className={styles.label}>
        Hand ({activePlayer.hand.length}) {isPlayPhase ? '— click to use & discard' : ''}
      </div>
      <div className={styles.cards}>
        {activePlayer.hand.map(card => (
          <PlayableCard
            key={card.id}
            card={card}
            onClick={isPlayPhase ? () => playCard(card.id) : undefined}
            dimmed={!isPlayPhase}
            showDiscardHint={isPlayPhase}
          />
        ))}
      </div>
    </div>
  );
}
