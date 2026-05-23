import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BACKGROUNDS } from '../../data/backgrounds';
import type { StatDomain } from '../../types/cards';
import styles from './SetupScreen.module.css';

const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_LABELS = ['Red', 'Blue', 'Green', 'Yellow'];

const STAT_LABELS: Record<StatDomain, string> = {
  strength: 'Str',
  agility: 'Agi',
  warmth: 'Warm',
  survival: 'Surv',
  navigation: 'Nav',
};

function StatPills({ baseStats }: { baseStats: Record<string, number> }) {
  const entries = Object.entries(baseStats).filter(([, v]) => v !== 0);
  const pos = entries.filter(([, v]) => v > 0);
  const neg = entries.filter(([, v]) => v < 0);
  return (
    <div className={styles.statPills}>
      {pos.map(([d, v]) => (
        <span key={d} className={styles.statPos}>+{v} {STAT_LABELS[d as StatDomain]}</span>
      ))}
      {neg.map(([d, v]) => (
        <span key={d} className={styles.statNeg}>{v} {STAT_LABELS[d as StatDomain]}</span>
      ))}
    </div>
  );
}

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
          {Array.from({ length: playerCount }, (_, i) => {
            const selectedBg = BACKGROUNDS.find(b => b.id === backgrounds[i])!;
            return (
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
                        <StatPills baseStats={bg.baseStats as Record<string, number>} />
                        <span className={styles.bgAbilityName}>✦ {bg.abilityName}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Detail panel for selected background */}
                <div className={styles.bgDetail}>
                  <div className={styles.bgDetailRow}>
                    <span className={styles.bgDetailLabel}>Hand</span>
                    <span className={selectedBg.handSizeBonus !== 0 ? (selectedBg.handSizeBonus > 0 ? styles.detailPos : styles.detailNeg) : styles.detailNeutral}>
                      {5 + selectedBg.handSizeBonus} cards
                      {selectedBg.handSizeBonus > 0 ? ` (+${selectedBg.handSizeBonus})` : selectedBg.handSizeBonus < 0 ? ` (${selectedBg.handSizeBonus})` : ''}
                    </span>
                    <span className={styles.bgDetailLabel}>Gold</span>
                    <span className={selectedBg.startingGoldBonus !== 0 ? (selectedBg.startingGoldBonus > 0 ? styles.detailPos : styles.detailNeg) : styles.detailNeutral}>
                      {3 + selectedBg.startingGoldBonus}
                      {selectedBg.startingGoldBonus > 0 ? ` (+${selectedBg.startingGoldBonus})` : selectedBg.startingGoldBonus < 0 ? ` (${selectedBg.startingGoldBonus})` : ''}
                    </span>
                    <span className={styles.bgDetailLabel}>Camps</span>
                    <span className={selectedBg.maxCampsBonus !== 0 ? styles.detailPos : styles.detailNeutral}>
                      {2 + selectedBg.maxCampsBonus}
                      {selectedBg.maxCampsBonus > 0 ? ` (+${selectedBg.maxCampsBonus})` : ''}
                    </span>
                  </div>
                  <div className={styles.bgAbilityDetail}>
                    <span className={styles.bgAbilityDetailName}>✦ {selectedBg.abilityName}:</span>
                    {' '}{selectedBg.abilityDescription}
                  </div>
                </div>
              </div>
            );
          })}
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
