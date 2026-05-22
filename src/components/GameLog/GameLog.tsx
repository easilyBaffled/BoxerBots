import { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import styles from './GameLog.module.css';

const TYPE_ICONS: Record<string, string> = {
  info: 'ℹ',
  action: '▶',
  challenge: '⚔',
  combat: '💥',
  system: '★',
};

export function GameLog() {
  const { state } = useGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.log.length]);

  return (
    <div className={styles.log}>
      <div className={styles.title}>Log</div>
      <div className={styles.entries}>
        {state.log.map(entry => (
          <div key={entry.id} className={`${styles.entry} ${styles[entry.type]}`}>
            <span className={styles.icon}>{TYPE_ICONS[entry.type]}</span>
            {entry.playerName && (
              <span
                className={styles.player}
                style={{ color: `var(--color-${entry.playerColor})` }}
              >
                {entry.playerName}:
              </span>
            )}
            <span className={styles.message}>{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
