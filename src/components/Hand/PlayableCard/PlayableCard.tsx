import type { PlayerCard } from '../../../types/cards';
import styles from './PlayableCard.module.css';

const CATEGORY_ICONS: Record<string, string> = {
  tool: '🔧',
  utility: '🎒',
  skill: '⭐',
};

const CATEGORY_LABELS: Record<string, string> = {
  tool: 'Tool',
  utility: 'Utility',
  skill: 'Skill',
};

interface Props {
  card: PlayerCard;
  onClick?: () => void;
  selected?: boolean;
  committed?: boolean;
  dimmed?: boolean;
  showCost?: boolean;
  showDiscardHint?: boolean;
}

export function PlayableCard({ card, onClick, selected, committed, dimmed, showCost, showDiscardHint }: Props) {
  const statEntries = Object.entries(card.stats).filter(([, v]) => (v ?? 0) > 0);

  return (
    <div
      className={`${styles.card} ${styles[card.category] ?? ''} ${selected ? styles.selected : ''} ${committed ? styles.committed : ''} ${dimmed ? styles.dimmed : ''} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      <div className={styles.header}>
        <div className={styles.categoryLine}>
          <span className={styles.categoryIcon}>{CATEGORY_ICONS[card.category]}</span>
          <span className={styles.categoryLabel}>{CATEGORY_LABELS[card.category]}</span>
        </div>
        {showCost && <span className={styles.cost}>{card.cost}g</span>}
      </div>
      <div className={styles.name}>{card.name}</div>
      {statEntries.length > 0 && (
        <div className={styles.stats}>
          {statEntries.map(([domain, val]) => (
            <span key={domain} className={styles.stat}>
              +{val} {domain.slice(0, 3)}
            </span>
          ))}
        </div>
      )}
      {card.effect && (
        <div className={styles.effect}>{card.effect}</div>
      )}
      {showDiscardHint && (
        <div className={styles.discardHint}>→ discard</div>
      )}
    </div>
  );
}
