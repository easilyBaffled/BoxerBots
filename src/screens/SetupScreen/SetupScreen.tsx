import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import styles from './SetupScreen.module.css';

const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_LABELS = ['Red', 'Blue', 'Green', 'Yellow'];

export function SetupScreen() {
  const { dispatch } = useGame();
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(['', '', '', '']);

  const updateName = (i: number, v: string) => {
    const n = [...names];
    n[i] = v;
    setNames(n);
  };

  const start = () => {
    const playerNames = names.slice(0, playerCount).map((n, i) =>
      n.trim() || COLOR_LABELS[i]
    );
    dispatch({ type: 'SETUP_START_GAME', payload: { playerNames } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.mountain}>🏔</div>
        <h1 className={styles.title}>Summit</h1>
        <p className={styles.subtitle}>A deck-building mountain climbing game</p>

        <div className={styles.section}>
          <label className={styles.label}>Number of Players</label>
          <div className={styles.countRow}>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                className={`${styles.countBtn} ${playerCount === n ? styles.active : ''}`}
                onClick={() => setPlayerCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Player Names</label>
          {Array.from({ length: playerCount }, (_, i) => (
            <div key={i} className={styles.nameRow}>
              <span
                className={styles.colorDot}
                style={{ background: `var(--color-${PLAYER_COLORS[i]})` }}
              />
              <input
                className={styles.input}
                placeholder={COLOR_LABELS[i]}
                value={names[i]}
                onChange={e => updateName(i, e.target.value)}
                maxLength={20}
              />
            </div>
          ))}
        </div>

        <div className={styles.rules}>
          <h3>How to Play</h3>
          <ul>
            <li>Take turns climbing the mountain, revealing cards as you go</li>
            <li>Play tool, utility, and skill cards to overcome challenges</li>
            <li>Pass a challenge to get through; solve it to remove it for everyone</li>
            <li>Build camps as respawn points — any player can use them</li>
            <li>Fewer spaces near the top mean competition gets brutal</li>
            <li>First player to reach The Summit wins!</li>
          </ul>
        </div>

        <button className={styles.startBtn} onClick={start}>
          Begin Expedition
        </button>
      </div>
    </div>
  );
}
