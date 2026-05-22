import type { PlayerColor } from '../../../types/game';
import styles from './PlayerToken.module.css';

interface Props {
  name: string;
  color: PlayerColor;
  isActive?: boolean;
}

export function PlayerToken({ name, color, isActive }: Props) {
  return (
    <div
      className={`${styles.token} ${isActive ? styles.active : ''}`}
      style={{ background: `var(--color-${color})` }}
      title={name}
    >
      {name[0].toUpperCase()}
    </div>
  );
}
