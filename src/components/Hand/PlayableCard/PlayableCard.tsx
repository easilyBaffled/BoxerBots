import type { PlayerCard } from '../../../types/cards';
import styles from './PlayableCard.module.css';

const CATEGORY_COLORS = {
  tool: '#dbeafe',
  utility: '#dcfce7',
  skill: '#f3e8ff',
};

const CATEGORY_ICONS = {
  tool: '🔧',
  utility: '🎒',
  skill: '⭐',
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
      className={`${styles.card} ${selected ? styles.selected : ''} ${committed ? styles.committed : ''} ${dimmed ? styles.dimmed : ''} ${onClick ? styles.clickable : ''}`}
      style={{ background: CATEGORY_COLORS[card.category] }}
      onClick={onClick}
    >
      <div className={styles.header}>
        <span className={styles.category}>{CATEGORY_ICONS[card.category]}</span>
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
