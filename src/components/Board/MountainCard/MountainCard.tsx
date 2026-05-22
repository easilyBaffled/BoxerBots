import type { MountainSlot, Player } from '../../../types/game';
import { PlayerToken } from '../PlayerToken/PlayerToken';
import { CampToken } from '../CampToken/CampToken';
import { ChallengeSlot } from '../ChallengeSlot/ChallengeSlot';
import styles from './MountainCard.module.css';

const TERRAIN_ICONS: Record<string, string> = {
  snow: '❄️',
  ice: '🧊',
  rock: '🪨',
  mixed: '🌲',
  crevasse: '⚠️',
  summit: '🏔',
};

interface Props {
  slot: MountainSlot;
  players: Player[];
  activePlayerId: string;
  isCurrentPlayerHere: boolean;
  slotIndex: number;
}

export function MountainCard({ slot, players, activePlayerId, isCurrentPlayerHere, slotIndex }: Props) {
  const { mountainCard: card, challengeSlots, occupants, camp, revealed } = slot;

  const occupantPlayers = occupants
    .map(id => players.find(p => p.id === id))
    .filter(Boolean) as Player[];

  const emptySpaces = card.playerSpaces - occupants.length;

  if (!revealed) {
    return (
      <div className={`${styles.card} ${styles.hidden}`} data-index={slotIndex}>
        <div className={styles.elevation}>↑ {card.elevation}</div>
        <div className={styles.unknownIcon}>?</div>
        <div className={styles.hiddenLabel}>Unexplored</div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.card} ${styles[card.terrain]} ${isCurrentPlayerHere ? styles.current : ''}`}
      data-index={slotIndex}
      id={`mountain-slot-${slotIndex}`}
    >
      <div className={styles.topRow}>
        <span className={styles.name}>{card.name}</span>
        <span className={styles.terrain}>{TERRAIN_ICONS[card.terrain]}</span>
      </div>

      <div className={styles.middleRow}>
        <div className={styles.challenges}>
          {challengeSlots.length === 0 && (
            <span className={styles.safe}>Safe passage</span>
          )}
          {challengeSlots.map((ch, i) => (
            <ChallengeSlot key={i} challenge={ch} solved={ch === null && slot.mountainCard.challengeSlots > 0} />
          ))}
        </div>
        {camp && <CampToken camp={camp} />}
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.spaces}>
          {occupantPlayers.map(p => (
            <PlayerToken
              key={p.id}
              name={p.name}
              color={p.color}
              isActive={p.id === activePlayerId}
            />
          ))}
          {Array.from({ length: Math.max(0, emptySpaces) }, (_, i) => (
            <div key={`empty-${i}`} className={styles.emptySpace} />
          ))}
        </div>
        <span className={styles.elevation}>#{card.elevation}</span>
      </div>
    </div>
  );
}
