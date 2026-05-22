import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BACKGROUNDS } from '../../data/backgrounds';
import styles from './SetupScreen.module.css';

const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_LABELS = ['Red', 'Blue', 'Green', 'Yellow'];

export function SetupScreen() {
  const { dispatch } = useGame();
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(['', '', '', '']);
  const [backgrounds, setBackgrounds] = useState([
    BACKGROUNDS[0].id,
    BACKGROUNDS[1].id,
    BACKGROUNDS[2].id,
    BACKGROUNDS[3].id,
  ]);

  const updateName = (i: number, v: string) => {
    const n = [...names];
    n[i] = v;
    setNames(n);
  };

  const updateBackground = (playerIdx: number, bgId: string) => {
    const b = [...backgrounds];
    b[playerIdx] = bgId;
    setBackgrounds(b);
  };

  const start = () => {
    const playerNames = names.slice(0, playerCount).map((n, i) =>
      n.trim() || COLOR_LABELS[i]
    );
    const backgroundIds = backgrounds.slice(0, playerCount);
    dispatch({ type: 'SETUP_START_GAME', payload: { playerNames, backgroundIds } });
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
          <label className={styles.label}>Players & Backgrounds</label>
          {Array.from({ length: playerCount }, (_, i) => (
            <div key={i} className={styles.playerSetup}>
              <div className={styles.nameRow}>
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
              <div className={styles.bgGrid}>
                {BACKGROUNDS.map(bg => {
                  const selected = backgrounds[i] === bg.id;
                  return (
                    <button
                      key={bg.id}
                      className={`${styles.bgCard} ${selected ? styles.bgSelected : ''}`}
                      onClick={() => updateBackground(i, bg.id)}
                    >
                      <span className={styles.bgIcon}>{bg.icon}</span>
                      <span className={styles.bgName}>{bg.name}</span>
                      <span className={styles.bgFlavor}>{bg.flavor}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.rules}>
          <h3>How to Play</h3>
          <ul>
            <li>Move up the mountain — challenges fire the moment you enter a new card</li>
            <li>Use your innate skills + cards to pass or fully complete challenges</li>
            <li>Completing a challenge removes it permanently for everyone</li>
            <li>You can retreat one space to face an easier challenge instead</li>
            <li>Build camps as respawn points; spaces narrow near the summit</li>
            <li>First to The Summit wins!</li>
          </ul>
        </div>

        <button className={styles.startBtn} onClick={start}>
          Begin Expedition
        </button>
      </div>
    </div>
  );
}
