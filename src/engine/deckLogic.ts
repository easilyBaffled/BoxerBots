import type { PlayerCard } from '../types/cards';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawCards(
  deck: PlayerCard[],
  discardPile: PlayerCard[],
  count: number,
): { drawn: PlayerCard[]; newDeck: PlayerCard[]; newDiscard: PlayerCard[] } {
  let working = [...deck];
  let discard = [...discardPile];

  if (working.length < count && discard.length > 0) {
    working = [...working, ...shuffle(discard)];
    discard = [];
  }

  const drawn = working.splice(0, count);
  return { drawn, newDeck: working, newDiscard: discard };
}

export function uniqueCardId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function cloneCardWithNewId(card: PlayerCard): PlayerCard {
  return { ...card, id: uniqueCardId(card.definitionId) };
}
