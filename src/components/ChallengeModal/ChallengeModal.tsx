import { useGame } from '../../context/GameContext';
import { Modal } from '../ui/Modal/Modal';
import { PlayableCard } from '../Hand/PlayableCard/PlayableCard';
import styles from './ChallengeModal.module.css';

const TYPE_ICONS: Record<string, string> = {
  weather: '⛈',
  animal: '🐾',
  terrain: '🗻',
  condition: '💀',
};

export function ChallengeModal() {
  const { state, dispatch } = useGame();
  const { activeChallenge, players, activePlayerIndex } = state;
  if (!activeChallenge) return null;

  const activePlayer = players[activePlayerIndex];
  const { challengeCard, committedCardIds, currentStatTotal } = activeChallenge;

  const committedSet = new Set(committedCardIds);
  const handCards = activePlayer.hand;

  const commit = (cardId: string) => {
    if (committedSet.has(cardId)) {
      dispatch({ type: 'UNCOMMIT_CARD_FROM_CHALLENGE', payload: { playerId: activePlayer.id, cardId } });
    } else {
      dispatch({ type: 'COMMIT_CARD_TO_CHALLENGE', payload: { playerId: activePlayer.id, cardId } });
    }
  };

  const resolve = () => dispatch({ type: 'RESOLVE_CHALLENGE' });
  const skip = () => dispatch({ type: 'SKIP_CHALLENGE' });

  const passProgress = Math.min(1, currentStatTotal / challengeCard.passThreshold);
  const solveProgress = Math.min(1, currentStatTotal / challengeCard.solveThreshold);
  const willSolve = currentStatTotal >= challengeCard.solveThreshold;
  const willPass = currentStatTotal >= challengeCard.passThreshold;

  return (
    <Modal title={`Challenge: ${challengeCard.name}`} wide>
      <div className={styles.content}>
        <div className={styles.challengeHeader}>
          <span className={styles.typeIcon}>{TYPE_ICONS[challengeCard.challengeType]}</span>
          <div>
            <div className={styles.typeBadge}>{challengeCard.challengeType}</div>
            <p className={styles.description}>{challengeCard.description}</p>
            <p className={styles.domains}>
              Relevant stats: <strong>{challengeCard.requiredDomains.join(', ')}</strong>
            </p>
          </div>
        </div>

        <div className={styles.thresholds}>
          <div className={`${styles.threshold} ${willPass ? styles.met : ''}`}>
            <span>Pass: {challengeCard.passThreshold}</span>
            <div className={styles.progressBar}>
              <div className={styles.passBar} style={{ width: `${passProgress * 100}%` }} />
            </div>
          </div>
          <div className={`${styles.threshold} ${willSolve ? styles.metSolve : ''}`}>
            <span>Solve: {challengeCard.solveThreshold}</span>
            <div className={styles.progressBar}>
              <div className={styles.solveBar} style={{ width: `${solveProgress * 100}%` }} />
            </div>
          </div>
          <div className={styles.total}>
            Current total: <strong>{currentStatTotal}</strong>
            {willSolve && <span className={styles.outcomeLabel} style={{ color: '#16a34a' }}> → SOLVE!</span>}
            {willPass && !willSolve && <span className={styles.outcomeLabel} style={{ color: '#ca8a04' }}> → Pass</span>}
            {!willPass && <span className={styles.outcomeLabel} style={{ color: '#dc2626' }}> → Fail ({challengeCard.failPenalty.description})</span>}
          </div>
        </div>

        <div className={styles.handSection}>
          <div className={styles.sectionLabel}>
            Your hand — click to commit/uncommit
            {committedCardIds.length > 0 && ` (${committedCardIds.length} committed)`}
          </div>
          <div className={styles.cards}>
            {handCards.map(card => (
              <PlayableCard
                key={card.id}
                card={card}
                onClick={() => commit(card.id)}
                committed={committedSet.has(card.id)}
              />
            ))}
            {handCards.length === 0 && <p className={styles.empty}>No cards in hand</p>}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.resolveBtn} onClick={resolve}>
            {willSolve ? 'Solve Challenge! ✓' : willPass ? 'Pass Challenge →' : 'Attempt (will fail)'}
          </button>
          <button className={styles.skipBtn} onClick={skip}>
            Skip (take penalty)
          </button>
        </div>

        <div className={styles.penalty}>
          <strong>Fail penalty:</strong> {challengeCard.failPenalty.description}
        </div>
      </div>
    </Modal>
  );
}
