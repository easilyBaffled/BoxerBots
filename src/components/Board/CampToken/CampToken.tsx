import type { CampToken as CampTokenType } from '../../../types/game';
import styles from './CampToken.module.css';

interface Props {
  camp: CampTokenType;
}

export function CampToken({ camp }: Props) {
  return (
    <div
      className={styles.camp}
      style={{ borderColor: `var(--color-${camp.ownerColor})` }}
      title={`${camp.ownerName}'s camp`}
    >
      ⛺
    </div>
  );
}
