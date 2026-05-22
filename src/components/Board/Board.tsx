import { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { MountainCard } from './MountainCard/MountainCard';
import styles from './Board.module.css';

export function Board() {
  const { state } = useGame();
  const { board, players, activePlayerIndex } = state;
  const activePlayer = players[activePlayerIndex];
  const boardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active player's current card
  useEffect(() => {
    if (!boardRef.current) return;
    const el = document.getElementById(`mountain-slot-${activePlayer.positionIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activePlayer.positionIndex]);

  // Render summit first, base camp last (top of scroll = summit)
  const slotsTopToBottom = [...board.mountainSlots].reverse();

  return (
    <div className={styles.wrapper} ref={boardRef}>
      <div className={styles.boardColumn}>
        {slotsTopToBottom.map((slot, reverseIdx) => {
          const slotIndex = board.mountainSlots.length - 1 - reverseIdx;
          const isCurrentPlayerHere = slot.occupants.includes(activePlayer.id);
          return (
            <MountainCard
              key={slot.mountainCard.definitionId}
              slot={slot}
              players={players}
              activePlayerId={activePlayer.id}
              isCurrentPlayerHere={isCurrentPlayerHere}
              slotIndex={slotIndex}
            />
          );
        })}
      </div>
    </div>
  );
}
