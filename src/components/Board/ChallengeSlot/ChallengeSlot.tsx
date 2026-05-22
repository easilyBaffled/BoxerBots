import type { ChallengeCardDef } from '../../../types/cards';
import styles from './ChallengeSlot.module.css';

const TYPE_ICONS: Record<string, string> = {
  weather: '⛈',
  animal: '🐾',
  terrain: '🗻',
  condition: '💀',
};

interface Props {
  challenge: ChallengeCardDef | null;
  solved?: boolean;
}

export function ChallengeSlot({ challenge, solved }: Props) {
  if (solved || !challenge) {
    return <div className={`${styles.slot} ${styles.empty}`}>✓</div>;
  }

  return (
    <div
      className={`${styles.slot} ${styles[challenge.challengeType]}`}
      title={`${challenge.name}: pass ${challenge.passThreshold}, solve ${challenge.solveThreshold}`}
    >
      <span className={styles.icon}>{TYPE_ICONS[challenge.challengeType]}</span>
      <span className={styles.name}>{challenge.name.split(' ')[0]}</span>
      <span className={styles.threshold}>{challenge.passThreshold}/{challenge.solveThreshold}</span>
    </div>
  );
}
