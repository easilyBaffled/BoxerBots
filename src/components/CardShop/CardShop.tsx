import { useGame } from '../../context/GameContext';
import { PlayableCard } from '../Hand/PlayableCard/PlayableCard';
import styles from './CardShop.module.css';

export function CardShop() {
  const { state, dispatch } = useGame();
  const { shop, players, activePlayerIndex, turnPhase, turnGold } = state;
  const activePlayer = players[activePlayerIndex];
  const totalGold = turnGold + activePlayer.gold;
  const isBuyPhase = turnPhase === 'buy';

  const buy = (cardId: string) => {
    if (!isBuyPhase) return;
    dispatch({ type: 'BUY_CARD', payload: { playerId: activePlayer.id, shopCardId: cardId } });
  };

  return (
    <div className={styles.shop}>
      <div className={styles.header}>
        <span className={styles.title}>Shop</span>
        <span className={styles.remaining}>{shop.drawPile.length} remaining</span>
      </div>
      <div className={styles.cards}>
        {shop.available.map(card => {
          const canAfford = totalGold >= card.cost;
          return (
            <div key={card.id} className={styles.cardWrapper}>
              <PlayableCard
                card={card}
                onClick={isBuyPhase && canAfford ? () => buy(card.id) : undefined}
                dimmed={!isBuyPhase || !canAfford}
                showCost
              />
              {!canAfford && isBuyPhase && (
                <div className={styles.cantAfford}>Need {card.cost - totalGold}g more</div>
              )}
            </div>
          );
        })}
        {shop.available.length === 0 && (
          <p className={styles.empty}>Shop is empty</p>
        )}
      </div>
    </div>
  );
}
