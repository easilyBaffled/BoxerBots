import type { UtilityCard } from '../types/cards';

let _id = 0;
const uid = (def: string) => `util_def_${def}_${_id++}`;

export function makeUtilityCards(): UtilityCard[] {
  return [
    { id: uid('food'), definitionId: 'food_rations', category: 'utility', name: 'Food Rations', cost: 1, stats: { survival: 1 }, consumable: true, tags: ['nutrition'], description: 'High-calorie mountain food.', effect: 'On play: draw 1 card.' },
    { id: uid('first_aid'), definitionId: 'first_aid', category: 'utility', name: 'First Aid Kit', cost: 2, stats: { survival: 2 }, consumable: true, tags: ['healing'], description: 'Wound dressings, splints, and meds.', effect: 'On play: immediately remove your respawning status if active.' },
    { id: uid('energy'), definitionId: 'energy_drink', category: 'utility', name: 'Energy Drink', cost: 1, stats: { agility: 1, strength: 1 }, consumable: true, tags: ['nutrition'], description: 'Liquid caffeine and electrolytes.', effect: 'On play: gain 1 extra action this turn.' },
    { id: uid('thermos'), definitionId: 'thermos', category: 'utility', name: 'Thermos', cost: 1, stats: { warmth: 2 }, consumable: false, tags: ['warmth'], description: 'Hot tea all day long.' },
    { id: uid('bivouac'), definitionId: 'emergency_bivouac', category: 'utility', name: 'Emergency Bivouac', cost: 3, stats: { warmth: 2, survival: 2 }, consumable: true, tags: ['emergency'], description: 'Space blanket and emergency shelter.', effect: 'On play: prevent the next fall you would take this game.' },
    { id: uid('protein'), definitionId: 'protein_bar', category: 'utility', name: 'Protein Bar', cost: 1, stats: { strength: 1 }, consumable: true, tags: ['nutrition'], description: 'Dense calorie brick.', effect: 'On play: gain 1 gold.' },
    { id: uid('altitude'), definitionId: 'altitude_pills', category: 'utility', name: 'Altitude Pills', cost: 2, stats: { survival: 2 }, consumable: true, tags: ['healing'], description: 'Acclimatisation medication.', effect: 'On play: ignore elevation-related condition challenges this turn.' },
    { id: uid('flare'), definitionId: 'flare', category: 'utility', name: 'Signal Flare', cost: 2, stats: { survival: 1 }, consumable: true, tags: ['emergency'], description: 'Brilliant red emergency signal.', effect: 'On challenge: +3 survival against animal challenges only.' },
    { id: uid('rope_repair'), definitionId: 'rope_repair', category: 'utility', name: 'Rope Repair Kit', cost: 2, stats: {}, consumable: true, tags: ['support'], description: 'Tape, splices, and cord.', effect: 'On play: restore a spent-durability tool card.' },
    { id: uid('mirror'), definitionId: 'signal_mirror', category: 'utility', name: 'Signal Mirror', cost: 1, stats: { navigation: 1 }, consumable: false, tags: ['navigation'], description: 'Glass mirror for long-range signaling.', effect: 'On play: reveal the next unrevealed mountain card.' },
  ];
}
