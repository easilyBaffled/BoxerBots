import { useState } from 'react';
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
import { useIsMobile } from '../../hooks/useIsMobile';
import styles from './GameScreen.module.css';

type MobileTab = 'board' | 'hand' | 'players' | 'shop';

const TABS: { id: MobileTab; icon: string; label: string }[] = [
  { id: 'board', icon: '🏔', label: 'Mountain' },
  { id: 'hand', icon: '🃏', label: 'Hand' },
  { id: 'players', icon: '👥', label: 'Players' },
  { id: 'shop', icon: '🛒', label: 'Shop' },
];

export function GameScreen() {
  const { state } = useGame();
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<MobileTab>('board');
  const activePlayer = state.players[state.activePlayerIndex];

  if (isMobile) {
    return (
      <div className={styles.mobileLayout}>
        <PhaseIndicator
          currentPhase={state.turnPhase}
          playerName={activePlayer.name}
          compact
        />

        <div className={styles.mobileContent}>
          {mobileTab === 'board' && (
            <div className={styles.mobileBoardPanel}>
              <Board />
            </div>
          )}
          {mobileTab === 'hand' && (
            <div className={styles.mobileHandPanel}>
              <TurnControls />
              <Hand />
            </div>
          )}
          {mobileTab === 'players' && (
            <div className={styles.mobilePlayersPanel}>
              <PlayerRoster />
              <GameLog />
            </div>
          )}
          {mobileTab === 'shop' && (
            <div className={styles.mobileShopPanel}>
              <CardShop />
            </div>
          )}
        </div>

        <nav className={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${mobileTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setMobileTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </nav>

        <ChallengeModal />
        <JostleModal />
      </div>
    );
  }

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
