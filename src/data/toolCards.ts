import type { ToolCard } from '../types/cards';

let _id = 0;
const tid = (def: string) => `tool_def_${def}_${_id++}`;

export function makeToolCards(): ToolCard[] {
  return [
    { id: tid('rope'), definitionId: 'rope', category: 'tool', name: 'Rope', cost: 2, stats: { strength: 2 }, durability: 3, tags: ['climbing'], description: 'Thick braided rope.', effect: 'When you fall, you may discard this card to cancel the fall once.' },
    { id: tid('ice_axe'), definitionId: 'ice_axe', category: 'tool', name: 'Ice Axe', cost: 3, stats: { strength: 3, agility: 1 }, durability: null, tags: ['climbing'], description: 'Essential on icy terrain.', effect: '+1 strength on ice or crevasse cards.' },
    { id: tid('crampons'), definitionId: 'crampons', category: 'tool', name: 'Crampons', cost: 2, stats: { agility: 2 }, durability: null, tags: ['climbing'], description: 'Metal spikes for your boots.', effect: 'Passive: you never fall from ice terrain challenges.' },
    { id: tid('carabiners'), definitionId: 'carabiners', category: 'tool', name: 'Carabiner Set', cost: 2, stats: { strength: 1, agility: 1 }, durability: 2, tags: ['climbing', 'protection'], description: 'Quick-link gear clips.', effect: 'Another player on your card may use this card\'s stats this turn.' },
    { id: tid('helmet'), definitionId: 'helmet', category: 'tool', name: 'Helmet', cost: 2, stats: { survival: 2 }, durability: null, tags: ['protection'], description: 'Hard shell protection.', effect: 'Passive: discard only 1 card instead of 2 on discard penalties.' },
    { id: tid('trekking_poles'), definitionId: 'trekking_poles', category: 'tool', name: 'Trekking Poles', cost: 1, stats: { agility: 1, navigation: 1 }, durability: null, tags: ['navigation'], description: 'Lightweight adjustable poles.' },
    { id: tid('piton_set'), definitionId: 'piton_set', category: 'tool', name: 'Piton Set', cost: 3, stats: { strength: 2 }, durability: 4, tags: ['climbing', 'protection'], description: 'Steel spikes driven into rock.', effect: 'Your solve counts toward the solve threshold for all players on this card.' },
    { id: tid('snow_shovel'), definitionId: 'snow_shovel', category: 'tool', name: 'Snow Shovel', cost: 2, stats: { strength: 1 }, durability: null, tags: ['climbing'], description: 'Compact folding shovel.', effect: 'On play: remove a weather challenge card from your current card.' },
    { id: tid('headlamp'), definitionId: 'headlamp', category: 'tool', name: 'Headlamp', cost: 1, stats: { navigation: 2 }, durability: null, tags: ['navigation'], description: 'Bright LED beam.' },
    { id: tid('map_compass'), definitionId: 'map_compass', category: 'tool', name: 'Map & Compass', cost: 2, stats: { navigation: 3 }, durability: null, tags: ['navigation'], description: 'Topo map and sighting compass.', effect: 'On play: peek at the next 2 unrevealed mountain cards.' },
    { id: tid('fixed_line'), definitionId: 'fixed_line', category: 'tool', name: 'Fixed Line', cost: 4, stats: { strength: 2, agility: 2 }, durability: null, tags: ['climbing'], description: 'Anchored rope for the whole party.', effect: 'All players on your card get +1 agility this turn.' },
    { id: tid('tent'), definitionId: 'tent', category: 'tool', name: 'Tent', cost: 3, stats: { warmth: 2, survival: 1 }, durability: null, tags: ['warmth'], description: 'Four-season expedition tent.', effect: 'On play: draw 1 extra card at the start of your next turn.' },
    { id: tid('snow_goggles'), definitionId: 'snow_goggles', category: 'tool', name: 'Snow Goggles', cost: 2, stats: { warmth: 1, agility: 1 }, durability: null, tags: ['warmth', 'navigation'], description: 'Anti-UV glacier goggles.', effect: 'Passive: weather challenge thresholds are reduced by 1 for you.' },
    { id: tid('avalanche_beacon'), definitionId: 'avalanche_beacon', category: 'tool', name: 'Avalanche Beacon', cost: 3, stats: { survival: 3 }, durability: null, tags: ['protection', 'survival'], description: 'Rescue transponder.', effect: 'When you fall, respawn 1 slot higher than the nearest camp.' },
    { id: tid('portaledge'), definitionId: 'portaledge', category: 'tool', name: 'Portaledge', cost: 4, stats: { survival: 2, warmth: 1 }, durability: null, tags: ['warmth', 'survival'], description: 'Hanging tent for vertical faces.', effect: 'On play: gain 2 gold.' },
  ];
}
