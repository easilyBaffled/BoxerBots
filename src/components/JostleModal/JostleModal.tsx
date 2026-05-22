import { useGame } from '../../context/GameContext';
import { Modal } from '../ui/Modal/Modal';
import { PlayerToken } from '../Board/PlayerToken/PlayerToken';
import styles from './JostleModal.module.css';

export function JostleModal() {
  const { state, dispatch } = useGame();
  const { pendingJostle, players } = state;
  if (!pendingJostle) return null;

  const attacker = players.find(p => p.id === pendingJostle.attackerId)!;
  const target = players.find(p => p.id === pendingJostle.targetId)!;
  const slot = state.board.mountainSlots[pendingJostle.slotIndex];

  const confirm = () => dispatch({ type: 'RESOLVE_JOSTLE' });
  const cancel = () => dispatch({ type: 'DISMISS_MODAL' });

  const targetHasIronWill = target.activeSkills.some(s => s.definitionId === 'iron_will');

  return (
    <Modal title="Jostle!" onClose={cancel}>
      <div className={styles.content}>
        <p className={styles.desc}>
          <strong>{attacker.name}</strong> is jostling <strong>{target.name}</strong> from{' '}
          <strong>{slot?.mountainCard.name}</strong>!
        </p>

        <div className={styles.players}>
          <div className={styles.playerBox}>
            <PlayerToken name={attacker.name} color={attacker.color} isActive />
            <span>{attacker.name}</span>
            <span className={styles.sub}>Attacker</span>
          </div>
          <div className={styles.arrow}>→</div>
          <div className={styles.playerBox}>
            <PlayerToken name={target.name} color={target.color} />
            <span>{target.name}</span>
            <span className={styles.sub}>will be pushed down</span>
          </div>
        </div>

        {targetHasIronWill && (
          <div className={styles.ironWill}>
            ⚠️ {target.name} has <strong>Iron Will</strong> — they may discard 2 cards to resist!
          </div>
        )}

        <div className={styles.cost}>
          Cost: {state.config.jostleCost} gold
        </div>

        <div className={styles.actions}>
          <button className={styles.confirmBtn} onClick={confirm}>
            Confirm Jostle
          </button>
          <button className={styles.cancelBtn} onClick={cancel}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
