import { useGame } from '../../context/GameContext';
import styles from './VictoryScreen.module.css';

export function VictoryScreen() {
  const { state, dispatch } = useGame();
  const winner = state.players.find(p => p.id === state.winner);

  const restart = () => {
    dispatch({ type: 'DISMISS_MODAL' });
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.summit}>🏔</div>
        <h1 className={styles.title}>Summit Reached!</h1>
        {winner && (
          <div className={styles.winner}>
            <div
              className={styles.winnerDot}
              style={{ background: `var(--color-${winner.color})` }}
            />
            <span className={styles.winnerName}>{winner.name}</span>
            <span className={styles.winnerSub}>conquered the mountain</span>
          </div>
        )}

        <div className={styles.stats}>
          <h3>Final Standings</h3>
          {[...state.players]
            .sort((a, b) => b.positionIndex - a.positionIndex)
            .map((player, i) => (
              <div key={player.id} className={styles.standing}>
                <span className={styles.rank}>#{i + 1}</span>
                <span
                  className={styles.playerDot}
                  style={{ background: `var(--color-${player.color})` }}
                />
                <span className={styles.playerName}>{player.name}</span>
                <span className={styles.elevation}>
                  Elevation {state.board.mountainSlots[player.positionIndex]?.mountainCard.elevation ?? 0}
                </span>
              </div>
            ))}
        </div>

        <button className={styles.restartBtn} onClick={restart}>
          New Expedition
        </button>
      </div>
    </div>
  );
}
