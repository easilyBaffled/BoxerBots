import type { Player } from '../../../types/game';
import styles from './PlayerPanel.module.css';

interface Props {
  player: Player;
  isActive: boolean;
  position: number;
  locationName: string;
}

export function PlayerPanel({ player, isActive, locationName }: Props) {
  return (
    <div className={`${styles.panel} ${isActive ? styles.active : ''}`}>
      <div
        className={styles.colorBar}
        style={{ background: `var(--color-${player.color})` }}
      />
      <div className={styles.info}>
        <div className={styles.name}>
          {player.name}
          {player.respawning && <span className={styles.badge}>Respawning</span>}
          {isActive && <span className={styles.activeBadge}>▶</span>}
        </div>
        <div className={styles.location}>📍 {locationName}</div>
        <div className={styles.stats}>
          <span title="Gold">💰 {player.gold + 'g (bank)'}</span>
          <span title="Hand size">🃏 {player.hand.length}</span>
          <span title="Camps">⛺ {player.campsPlaced}/{player.maxCamps}</span>
        </div>
        {player.activeSkills.length > 0 && (
          <div className={styles.skills}>
            {player.activeSkills.map(s => (
              <span key={s.id} className={styles.skill}>⭐ {s.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
