import type { MountainCardDef } from '../types/cards';

export const MOUNTAIN_CARDS: MountainCardDef[] = [
  { definitionId: 'mc_00', name: 'Base Camp Alpha', sectionName: 'Base Camp Alpha', elevation: 0, terrain: 'mixed', playerSpaces: 4, challengeSlots: 0, allowsCamp: false, flavorText: 'Everyone starts here.' },
  { definitionId: 'mc_01', name: 'Gravel Flats', sectionName: 'Gravel Flats', elevation: 1, terrain: 'rock', playerSpaces: 4, challengeSlots: 1, allowsCamp: true },
  { definitionId: 'mc_02', name: 'Birch Forest Approach', sectionName: 'Birch Forest Approach', elevation: 2, terrain: 'mixed', playerSpaces: 4, challengeSlots: 1, allowsCamp: true },
  { definitionId: 'mc_03', name: 'Boulder Field', sectionName: 'Boulder Field', elevation: 3, terrain: 'rock', playerSpaces: 4, challengeSlots: 2, allowsCamp: true },
  { definitionId: 'mc_04', name: 'The Scree Slope', sectionName: 'The Scree Slope', elevation: 4, terrain: 'rock', playerSpaces: 4, challengeSlots: 1, allowsCamp: true },
  { definitionId: 'mc_05', name: 'Frozen Creek Crossing', sectionName: 'Frozen Creek Crossing', elevation: 5, terrain: 'ice', playerSpaces: 4, challengeSlots: 2, allowsCamp: true },
  { definitionId: 'mc_06', name: 'Lower Glacier', sectionName: 'Lower Glacier', elevation: 6, terrain: 'ice', playerSpaces: 4, challengeSlots: 1, allowsCamp: true },
  { definitionId: 'mc_07', name: 'Crevasse Field', sectionName: 'Crevasse Field', elevation: 7, terrain: 'crevasse', playerSpaces: 3, challengeSlots: 2, allowsCamp: true },
  { definitionId: 'mc_08', name: 'Ice Wall Base', sectionName: 'Ice Wall Base', elevation: 8, terrain: 'ice', playerSpaces: 3, challengeSlots: 1, allowsCamp: true },
  { definitionId: 'mc_09', name: 'Exposed Ridge', sectionName: 'Exposed Ridge', elevation: 9, terrain: 'rock', playerSpaces: 3, challengeSlots: 2, allowsCamp: true },
  { definitionId: 'mc_10', name: 'The Couloir', sectionName: 'The Couloir', elevation: 10, terrain: 'snow', playerSpaces: 3, challengeSlots: 1, allowsCamp: true },
  { definitionId: 'mc_11', name: 'High Camp Plateau', sectionName: 'High Camp Plateau', elevation: 11, terrain: 'snow', playerSpaces: 3, challengeSlots: 0, allowsCamp: true, flavorText: 'A rare flat spot to rest.' },
  { definitionId: 'mc_12', name: 'Windward Face', sectionName: 'Windward Face', elevation: 12, terrain: 'snow', playerSpaces: 3, challengeSlots: 2, allowsCamp: true },
  { definitionId: 'mc_13', name: 'Cornice Approach', sectionName: 'Cornice Approach', elevation: 13, terrain: 'snow', playerSpaces: 3, challengeSlots: 2, allowsCamp: true },
  { definitionId: 'mc_14', name: 'Death Zone Entry', sectionName: 'Death Zone Entry', elevation: 14, terrain: 'ice', playerSpaces: 2, challengeSlots: 1, allowsCamp: true },
  { definitionId: 'mc_15', name: 'The Seracs', sectionName: 'The Seracs', elevation: 15, terrain: 'ice', playerSpaces: 2, challengeSlots: 2, allowsCamp: true },
  { definitionId: 'mc_16', name: 'Final Ridge', sectionName: 'Final Ridge', elevation: 16, terrain: 'snow', playerSpaces: 2, challengeSlots: 1, allowsCamp: true },
  { definitionId: 'mc_17', name: 'The Headwall', sectionName: 'The Headwall', elevation: 17, terrain: 'rock', playerSpaces: 2, challengeSlots: 2, allowsCamp: true },
  { definitionId: 'mc_18', name: 'Pre-Summit Snowfield', sectionName: 'Pre-Summit Snowfield', elevation: 18, terrain: 'snow', playerSpaces: 2, challengeSlots: 1, allowsCamp: true },
  { definitionId: 'mc_19', name: 'The Summit', sectionName: 'The Summit', elevation: 19, terrain: 'summit', playerSpaces: 1, challengeSlots: 0, allowsCamp: false, flavorText: 'First here wins.' },
];
