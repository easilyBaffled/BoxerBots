import type { SkillCard } from '../types/cards';

let _id = 0;
const sid = (def: string) => `skill_def_${def}_${_id++}`;

export function makeSkillCards(): SkillCard[] {
  return [
    { id: sid('exp_climber'), definitionId: 'experienced_climber', category: 'skill', name: 'Experienced Climber', cost: 4, stats: { agility: 1, strength: 1 }, permanent: true, tags: ['passive'], description: 'Years of mountain experience.', effect: 'Passive: +1 to all your challenge stat totals.', passiveBonus: { agility: 1, strength: 1 } },
    { id: sid('ice_craft'), definitionId: 'ice_craft', category: 'skill', name: 'Ice Craft', cost: 3, stats: { agility: 2 }, permanent: true, tags: ['passive'], description: 'Mastery of frozen terrain.', effect: 'Passive: +2 agility on ice, snow, and crevasse cards.', passiveBonus: { agility: 2 } },
    { id: sid('summit_fever'), definitionId: 'summit_fever', category: 'skill', name: 'Summit Fever', cost: 3, stats: { strength: 2 }, permanent: false, tags: ['active'], description: 'Reckless drive to reach the top.', effect: 'On play: move 1 additional card, but you must move up.' },
    { id: sid('route_finding'), definitionId: 'route_finding', category: 'skill', name: 'Route Finding', cost: 3, stats: { navigation: 2 }, permanent: true, tags: ['passive'], description: 'Natural sense of the terrain.', effect: 'Passive: automatically pass all navigation challenges.', passiveBonus: { navigation: 2 } },
    { id: sid('risk_assessment'), definitionId: 'risk_assessment', category: 'skill', name: 'Risk Assessment', cost: 4, stats: { survival: 2 }, permanent: true, tags: ['passive'], description: 'Cool-headed danger evaluation.', effect: 'Passive: see the challenge card before deciding to attempt or skip.' },
    { id: sid('endurance'), definitionId: 'endurance_training', category: 'skill', name: 'Endurance Training', cost: 3, stats: { strength: 1, survival: 1 }, permanent: true, tags: ['passive'], description: 'Months of conditioning.', effect: 'Passive: your hand size is increased by 1.', passiveBonus: { strength: 1, survival: 1 } },
    { id: sid('cold_adapt'), definitionId: 'cold_adaptation', category: 'skill', name: 'Cold Adaptation', cost: 3, stats: { warmth: 2 }, permanent: true, tags: ['passive'], description: 'Your blood runs cold.', effect: 'Passive: weather challenge thresholds cost 2 less for you.', passiveBonus: { warmth: 2 } },
    { id: sid('tech_climber'), definitionId: 'technical_climber', category: 'skill', name: 'Technical Climber', cost: 4, stats: { strength: 2, agility: 2 }, permanent: false, tags: ['active'], description: 'Expert in technical rock and ice.', effect: 'On play: auto-pass any one non-weather challenge this turn.' },
    { id: sid('mtn_sense'), definitionId: 'mountain_sense', category: 'skill', name: 'Mountain Sense', cost: 3, stats: { navigation: 1, survival: 1 }, permanent: true, tags: ['passive'], description: 'Intuitive read of mountain conditions.', effect: 'Passive: reveal the next unrevealed mountain card at the start of each of your turns.', passiveBonus: { navigation: 1, survival: 1 } },
    { id: sid('iron_will'), definitionId: 'iron_will', category: 'skill', name: 'Iron Will', cost: 5, stats: { survival: 3 }, permanent: true, tags: ['passive', 'reaction'], description: 'Unbreakable resolve.', effect: 'Passive: when jostled, you may discard 2 cards to resist and stay in place.', passiveBonus: { survival: 3 } },
  ];
}
