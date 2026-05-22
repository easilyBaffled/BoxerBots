import type { PlayerCard, ToolCard, UtilityCard } from '../types/cards';

let _instanceId = 0;
const iid = () => `starter_${_instanceId++}`;

export function makeStarterDeck(): PlayerCard[] {
  const footwork = (): ToolCard => ({
    id: iid(),
    definitionId: 'basic_footwork',
    category: 'tool',
    name: 'Basic Footwork',
    cost: 0,
    stats: { agility: 1 },
    durability: null,
    tags: ['climbing'],
    description: 'The foundation of all mountain movement.',
  });

  const rations = (): UtilityCard => ({
    id: iid(),
    definitionId: 'food_rations',
    category: 'utility',
    name: 'Food Rations',
    cost: 1,
    stats: { survival: 1 },
    consumable: true,
    tags: ['nutrition'],
    description: 'High-calorie mountain food.',
    effect: 'On play: draw 1 card.',
  });

  return [
    footwork(), footwork(), footwork(), footwork(), footwork(), footwork(), footwork(),
    rations(), rations(), rations(),
  ];
}
