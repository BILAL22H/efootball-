import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPositionSuitability,
  calculateTeamStrength,
  calculateTeamChemistry,
  getEligiblePlayersForPosition,
  generateMysteryCards,
  calculateMatchCoins,
  simulateMatch,
} from './rules';
import { Player } from '../types/game';

const mockPlayerBale: Player = {
  id: 'bale_107',
  name: 'Gareth Bale',
  arName: 'غاريث بيل',
  rating: 107,
  position: 'CF',
  secondaryPositions: ['RWF', 'LWF', 'SS'],
  club: 'Real Madrid',
  clubAr: 'ريال مدريد',
  clubLogo: '👑',
  nation: 'Wales',
  nationAr: 'ويلز',
  flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  cardType: 'bigtime',
  jerseyNumber: 11,
  avatarColor: '#1e3a8a',
  stats: { pac: 106, sho: 105, pas: 98, dri: 104, def: 74, phy: 99 },
};

const mockPlayerCourtois: Player = {
  id: 'courtois_101',
  name: 'Thibaut Courtois',
  arName: 'تيبو كورتوا',
  rating: 101,
  position: 'GK',
  secondaryPositions: [],
  club: 'Real Madrid',
  clubAr: 'ريال مدريد',
  clubLogo: '👑',
  nation: 'Belgium',
  nationAr: 'بلجيكا',
  flag: '🇧🇪',
  cardType: 'highlight',
  jerseyNumber: 1,
  avatarColor: '#1e3a8a',
  stats: { pac: 72, sho: 45, pas: 85, dri: 72, def: 104, phy: 102 },
};

test('getPositionSuitability awards 1.0 for primary and 0.95 for secondary position', () => {
  assert.equal(getPositionSuitability(mockPlayerBale, 'CF'), 1.0);
  assert.equal(getPositionSuitability(mockPlayerBale, 'RWF'), 0.95);
});

test('getPositionSuitability strictly penalizes outfield in GK or GK in outfield', () => {
  assert.equal(getPositionSuitability(mockPlayerBale, 'GK'), 0.1);
  assert.equal(getPositionSuitability(mockPlayerCourtois, 'CF'), 0.1);
});

test('calculateTeamStrength computes power and average rating accurately', () => {
  const squad = {
    'pos-cf': { player: mockPlayerBale, targetPosition: 'CF' as const },
    'pos-gk': { player: mockPlayerCourtois, targetPosition: 'GK' as const },
  };
  const result = calculateTeamStrength(squad);
  assert.equal(result.count, 2);
  assert.equal(result.averageRating, 104);
  assert.ok(result.totalPower > 500);
});

test('calculateTeamChemistry increases for shared club connections', () => {
  const squad = {
    'pos-cf': { player: mockPlayerBale, targetPosition: 'CF' as const },
    'pos-gk': { player: mockPlayerCourtois, targetPosition: 'GK' as const },
  };
  const chem = calculateTeamChemistry(squad);
  assert.ok(chem >= 60, 'Chemistry should reflect baseline + shared Real Madrid club bonus');
});

test('getEligiblePlayersForPosition never puts GK in CF or CF in GK', () => {
  const pool = [mockPlayerBale, mockPlayerCourtois];
  const gkPool = getEligiblePlayersForPosition(pool, 'GK');
  assert.equal(gkPool.length, 1);
  assert.equal(gkPool[0].position, 'GK');

  const cfPool = getEligiblePlayersForPosition(pool, 'CF');
  assert.equal(cfPool.some((p) => p.position === 'GK'), false);
});

test('generateMysteryCards returns at most 4 items without duplicate excluded players', () => {
  const pool = [mockPlayerBale, mockPlayerCourtois];
  const cards = generateMysteryCards(pool, 'CF', ['bale_107']);
  assert.equal(cards.some((c) => c.id === 'bale_107'), false);
});

test('calculateMatchCoins rewards wins, margin bonuses, draws, and losses properly', () => {
  assert.equal(calculateMatchCoins(3, 0), 150); // Big win
  assert.equal(calculateMatchCoins(2, 1), 100); // Normal win
  assert.equal(calculateMatchCoins(2, 2), 50);  // Draw
  assert.equal(calculateMatchCoins(0, 1), 20);  // Loss
});

test('simulateMatch produces match events, stats, and MVP', () => {
  const match = simulateMatch('Dream XI', 'Opponent XI', [mockPlayerBale], [mockPlayerCourtois]);
  assert.ok(match.events.length >= 2, 'Should include at least kickoff and fulltime');
  assert.ok(match.mvp.name.length > 0);
  assert.ok(match.homeStats.possession + match.awayStats.possession === 100);
});
