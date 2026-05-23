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
      title={`${camp.ownerName}'s camp${camp.stash.length > 0 ? ` · ${camp.stash.length} card${camp.stash.length !== 1 ? 's' : ''} stashed` : ''}`}
    >
      ⛺
      {camp.stash.length > 0 && (
        <span className={styles.stashBadge}>{camp.stash.length}</span>
      )}
    </div>
  );
}
