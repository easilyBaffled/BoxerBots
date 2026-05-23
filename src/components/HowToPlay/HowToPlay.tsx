import { Modal } from '../ui/Modal/Modal';
import styles from './HowToPlay.module.css';

interface Props {
  onClose: () => void;
}

export function HowToPlay({ onClose }: Props) {
  return (
    <Modal title="How to Play" onClose={onClose} wide>
      <div className={styles.content}>

        <div className={styles.phaseBar}>
          <span className={styles.chip}>Play Cards</span>
          <span className={styles.arrow}>→</span>
          <span className={styles.chip}>Move</span>
          <span className={styles.arrow}>→</span>
          <span className={styles.chip}>Buy</span>
          <span className={styles.arrow}>→</span>
          <span className={styles.chip}>End Turn</span>
        </div>

        <section className={styles.section}>
          <h3 className={styles.heading}>🃏 Play Cards</h3>
          <p className={styles.body}>
            Playing a card <strong>discards it</strong>. Use this phase for cards with immediate effects
            (draw more cards, generate gold) or to activate permanent skills. If a card only has stats,
            save it — you'll commit it during a challenge instead.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>🏔 Move</h3>
          <p className={styles.body}>
            Move one tile up or down. If the tile above is full, you can
            <strong> Jostle</strong> (costs gold) to shove someone back down. You can only move once
            per turn, but you can skip to hold your position. Challenges fire automatically when you
            step onto a new tile.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>⚡ Challenges (automatic)</h3>
          <p className={styles.body}>When you enter a tile with a challenge, pick one:</p>
          <ul className={styles.list}>
            <li>
              <strong>Retreat</strong> — Step back to the tile below. You'll face its challenge
              (if any), and can't retreat again from there.
            </li>
            <li>
              <strong>Lose</strong> — Take the penalty immediately, no cards spent.
            </li>
            <li>
              <strong>Pass</strong> — Commit cards from your hand. Meeting the lower threshold
              gets you through; the challenge stays for others.
            </li>
            <li>
              <strong>Complete</strong> — Meet the higher threshold to <em>permanently remove</em> the
              challenge for everyone — and earn a reward (gold or cards).
            </li>
          </ul>
          <p className={styles.body}>
            Your background's innate stats always contribute. Permanent skills add passive bonuses on
            top of committed cards.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>🛒 Buy</h3>
          <p className={styles.body}>
            Spend gold on cards from the shop — acquired cards go to your discard pile. You can also
            place a <strong>Camp</strong> (costs gold) on eligible tiles. Any player can respawn at any
            camp, so camps are a cooperative investment even in a competitive game.
          </p>
          <p className={styles.body}>
            While standing on a camp, you can <strong>stash cards</strong> from your hand into it for
            safekeeping — useful before a dangerous section. Any player passing through can take
            one card from someone else's stash per turn, so choose what you leave wisely.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>🏆 Winning</h3>
          <p className={styles.body}>
            The first player to reach the Summit wins. The summit holds only one player — if it's
            occupied, you must jostle them off first.
          </p>
        </section>

      </div>
    </Modal>
  );
}
