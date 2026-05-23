import { useGame } from '../../context/GameContext';
import { Modal } from '../ui/Modal/Modal';
import { PlayableCard } from '../Hand/PlayableCard/PlayableCard';
import { BACKGROUNDS } from '../../data/backgrounds';
import type { StatDomain, StatBlock } from '../../types/cards';
import styles from './ChallengeModal.module.css';

const TYPE_ICONS: Record<string, string> = {
  weather: '⛈',
  animal: '🐾',
  terrain: '🗻',
  condition: '💀',
};

function statLabel(domain: StatDomain): string {
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

function InnateStats({ baseStats, domains }: { baseStats: StatBlock; domains: StatDomain[] }) {
  const relevant = domains.filter(d => ((baseStats as Record<StatDomain, number>)[d] ?? 0) > 0);
  if (relevant.length === 0) return <span className={styles.innateZero}>0 (no innate match)</span>;
  return (
    <span className={styles.innateBreakdown}>
      {relevant.map(d => (
        <span key={d} className={styles.inateStat}>
          +{(baseStats as Record<StatDomain, number>)[d]} {statLabel(d)}
        </span>
      ))}
    </span>
  );
}

export function ChallengeModal() {
  const { state, dispatch } = useGame();
  const { activeChallenge, players, activePlayerIndex } = state;
  if (!activeChallenge) return null;

  const activePlayer = players[activePlayerIndex];
  const bg = BACKGROUNDS.find(b => b.id === activePlayer.backgroundId);
  const { challengeCard, committedCardIds, currentStatTotal, innateTotal, canRetreat } = activeChallenge;

  const committedSet = new Set(committedCardIds);
  const cardTotal = currentStatTotal - innateTotal;

  const commit = (cardId: string) => {
    if (committedSet.has(cardId)) {
      dispatch({ type: 'UNCOMMIT_CARD_FROM_CHALLENGE', payload: { playerId: activePlayer.id, cardId } });
    } else {
      dispatch({ type: 'COMMIT_CARD_TO_CHALLENGE', payload: { playerId: activePlayer.id, cardId } });
    }
  };

  const willSolve = currentStatTotal >= challengeCard.solveThreshold;
  const willPass = currentStatTotal >= challengeCard.passThreshold;

  const passProgress = Math.min(1, currentStatTotal / challengeCard.passThreshold);
  const solveProgress = Math.min(1, currentStatTotal / challengeCard.solveThreshold);

  const rewardParts: string[] = [];
  if (challengeCard.solveReward.gold) rewardParts.push(`${challengeCard.solveReward.gold}💰`);
  if (challengeCard.solveReward.draw) rewardParts.push(`draw ${challengeCard.solveReward.draw}`);
  const rewardText = rewardParts.join(' + ');

  let resolveLabel = 'Attempt (will fail)';
  let resolveClass = styles.failBtn;
  if (willSolve) {
    resolveLabel = `Complete ✓  +${rewardText}`;
    resolveClass = styles.solveBtn;
  } else if (willPass) {
    resolveLabel = 'Pass Challenge →';
    resolveClass = styles.passBtn;
  }

  return (
    <Modal title={`Challenge: ${challengeCard.name}`} wide>
      <div className={styles.content}>

        {/* Challenge info */}
        <div className={styles.challengeHeader}>
          <span className={styles.typeIcon}>{TYPE_ICONS[challengeCard.challengeType]}</span>
          <div>
            <div className={styles.typeBadge}>{challengeCard.challengeType}</div>
            <p className={styles.description}>{challengeCard.description}</p>
            <p className={styles.domains}>
              Requires: <strong>{challengeCard.requiredDomains.map(statLabel).join(' + ')}</strong>
            </p>
          </div>
        </div>

        {/* Threshold bars */}
        <div className={styles.thresholds}>
          <div className={`${styles.threshold} ${willPass ? styles.met : ''}`}>
            <span className={styles.threshLabel}>Pass: {challengeCard.passThreshold}</span>
            <div className={styles.progressBar}>
              <div className={styles.passBar} style={{ width: `${passProgress * 100}%` }} />
            </div>
          </div>
          <div className={`${styles.threshold} ${willSolve ? styles.metSolve : ''}`}>
            <span className={styles.threshLabel}>Complete: {challengeCard.solveThreshold}</span>
            <div className={styles.progressBar}>
              <div className={styles.solveBar} style={{ width: `${solveProgress * 100}%` }} />
            </div>
            <span className={styles.rewardBadge}>+{rewardText}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total: <strong>{currentStatTotal}</strong></span>
            <span className={styles.totalBreak}>
              {bg?.icon} innate {innateTotal}
              {cardTotal > 0 && ` + cards ${cardTotal}`}
            </span>
            {willSolve && <span className={styles.outcome} style={{ color: '#16a34a' }}>→ Complete!</span>}
            {willPass && !willSolve && <span className={styles.outcome} style={{ color: '#ca8a04' }}>→ Pass</span>}
            {!willPass && <span className={styles.outcome} style={{ color: '#dc2626' }}>→ Fail</span>}
          </div>
        </div>

        {/* Innate skillset */}
        <div className={styles.innateSection}>
          <span className={styles.innateLabel}>
            {bg?.icon} {bg?.name ?? 'Your'} innate contribution:
          </span>
          <InnateStats baseStats={activePlayer.baseStats} domains={challengeCard.requiredDomains} />
        </div>

        {/* Hand cards */}
        <div className={styles.handSection}>
          <div className={styles.sectionLabel}>
            Your hand — click cards to commit{committedCardIds.length > 0 ? ` (${committedCardIds.length} committed)` : ''}
          </div>
          <div className={styles.cards}>
            {activePlayer.hand.map(card => (
              <PlayableCard
                key={card.id}
                card={card}
                onClick={() => commit(card.id)}
                committed={committedSet.has(card.id)}
              />
            ))}
            {activePlayer.hand.length === 0 && (
              <p className={styles.empty}>No cards in hand — only your innate skills apply.</p>
            )}
          </div>
        </div>

        {/* Four action buttons */}
        <div className={styles.actions}>
          <button
            className={styles.retreatBtn}
            onClick={() => dispatch({ type: 'RETREAT_FROM_CHALLENGE' })}
            disabled={!canRetreat}
            title={!canRetreat ? 'Cannot retreat from here' : 'Move back one space (face that card\'s challenge)'}
          >
            ← Retreat
          </button>
          <button
            className={styles.loseBtn}
            onClick={() => dispatch({ type: 'LOSE_CHALLENGE' })}
            title="Accept the penalty without attempting"
          >
            Lose (take penalty)
          </button>
          <button
            className={resolveClass}
            onClick={() => dispatch({ type: 'RESOLVE_CHALLENGE' })}
          >
            {resolveLabel}
          </button>
        </div>

        {/* Penalty reminder */}
        <div className={styles.penalty}>
          <strong>Fail / Lose penalty:</strong> {challengeCard.failPenalty.description}
        </div>
      </div>
    </Modal>
  );
}
