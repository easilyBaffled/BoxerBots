import { useGame } from '../../context/GameContext';
import { PlayerPanel } from './PlayerPanel/PlayerPanel';
import styles from './PlayerRoster.module.css';

export function PlayerRoster() {
  const { state } = useGame();
  const { players, activePlayerIndex, board } = state;

  return (
    <div className={styles.roster}>
      <div className={styles.title}>Players</div>
      <div className={styles.list}>
        {players.map((player, i) => {
          const slot = board.mountainSlots[player.positionIndex];
          return (
            <PlayerPanel
              key={player.id}
              player={player}
              isActive={i === activePlayerIndex}
              position={player.positionIndex}
              locationName={slot?.mountainCard.name ?? 'Unknown'}
            />
          );
        })}
      </div>
    </div>
  );
}
