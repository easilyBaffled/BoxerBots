import { Board } from '../../components/Board/Board';
import { Hand } from '../../components/Hand/Hand';
import { TurnControls } from '../../components/TurnControls/TurnControls';
import { PhaseIndicator } from '../../components/PhaseIndicator/PhaseIndicator';
import { PlayerRoster } from '../../components/PlayerRoster/PlayerRoster';
import { CardShop } from '../../components/CardShop/CardShop';
import { GameLog } from '../../components/GameLog/GameLog';
import { ChallengeModal } from '../../components/ChallengeModal/ChallengeModal';
import { JostleModal } from '../../components/JostleModal/JostleModal';
import { useGame } from '../../context/GameContext';
import styles from './GameScreen.module.css';

export function GameScreen() {
  const { state } = useGame();
  const activePlayer = state.players[state.activePlayerIndex];

  return (
    <div className={styles.layout}>
      <PhaseIndicator
        currentPhase={state.turnPhase}
        playerName={activePlayer.name}
      />
      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <PlayerRoster />
          <div className={styles.controlsArea}>
            <TurnControls />
          </div>
          <GameLog />
        </aside>
        <div className={styles.boardArea}>
          <Board />
        </div>
        <aside className={styles.rightPanel}>
          <CardShop />
        </aside>
      </div>
      <div className={styles.handArea}>
        <Hand />
      </div>
      <ChallengeModal />
      <JostleModal />
    </div>
  );
}
