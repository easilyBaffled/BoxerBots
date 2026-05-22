import type { TurnPhase } from '../../types/game';
import styles from './PhaseIndicator.module.css';

const PHASES: { id: TurnPhase; label: string }[] = [
  { id: 'play', label: 'Play Cards' },
  { id: 'move', label: 'Move' },
  { id: 'buy', label: 'Buy' },
  { id: 'end', label: 'End' },
];

const PHASE_LABELS: Record<TurnPhase, string> = {
  play: 'Play Cards',
  move: 'Move',
  buy: 'Buy',
  end: 'End Turn',
};

interface Props {
  currentPhase: TurnPhase;
  playerName: string;
  compact?: boolean;
}

export function PhaseIndicator({ currentPhase, playerName, compact }: Props) {
  const currentIdx = PHASES.findIndex(p => p.id === currentPhase);

  if (compact) {
    return (
      <div className={`${styles.bar} ${styles.compact}`}>
        <span className={styles.player}>{playerName}</span>
        <span className={styles.phasePill}>{PHASE_LABELS[currentPhase]}</span>
        <span className={styles.phaseHint}>
          {currentPhase === 'move' ? 'Challenges auto-fire on entry' : ''}
        </span>
      </div>
    );
  }

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
