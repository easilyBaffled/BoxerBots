import type { TurnPhase } from '../../types/game';
import styles from './PhaseIndicator.module.css';

const PHASES: { id: TurnPhase; label: string }[] = [
  { id: 'play', label: 'Play Cards' },
  { id: 'move', label: 'Move (challenges auto-fire)' },
  { id: 'buy', label: 'Buy' },
  { id: 'end', label: 'End' },
];

interface Props {
  currentPhase: TurnPhase;
  playerName: string;
}

export function PhaseIndicator({ currentPhase, playerName }: Props) {
  const currentIdx = PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div className={styles.bar}>
      <span className={styles.player}>{playerName}'s turn</span>
      <div className={styles.phases}>
        {PHASES.map((phase, i) => (
          <div
            key={phase.id}
            className={`${styles.phase} ${i === currentIdx ? styles.active : ''} ${i < currentIdx ? styles.done : ''}`}
          >
            {i < currentIdx ? '✓' : phase.label}
          </div>
        ))}
      </div>
    </div>
  );
}
