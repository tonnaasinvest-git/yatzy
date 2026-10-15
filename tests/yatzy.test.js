import { describe, it, expect } from 'vitest';
import { CATEGORIES, calculateCategoryScore, calculateScorecardTotals, getFrequencies } from '../src/lib/yatzy-scoring.js';
import { getDiceToHold, chooseBestCategory } from '../src/lib/yatzy-ai.js';
import { findOrCreatePlayerByEmail, getStoredPlayers } from '../src/lib/db-store.js';

describe('Yatzy Scoring Rules', () => {
  it('calculates upper section categories correctly', () => {
    const dice = [1, 2, 2, 5, 5];
    expect(calculateCategoryScore('ones', dice)).toBe(1);
    expect(calculateCategoryScore('twos', dice)).toBe(4);
    expect(calculateCategoryScore('threes', dice)).toBe(0);
    expect(calculateCategoryScore('fours', dice)).toBe(0);
    expect(calculateCategoryScore('fives', dice)).toBe(10);
    expect(calculateCategoryScore('sixes', dice)).toBe(0);
  });

  it('calculates 1 pair correctly', () => {
    expect(calculateCategoryScore('one_pair', [2, 2, 4, 5, 6])).toBe(4);
    expect(calculateCategoryScore('one_pair', [6, 6, 4, 4, 1])).toBe(12); // Highest pair
    expect(calculateCategoryScore('one_pair', [1, 2, 3, 4, 5])).toBe(0);
  });

  it('calculates 2 pairs correctly', () => {
    expect(calculateCategoryScore('two_pairs', [3, 3, 5, 5, 1])).toBe(16);
    expect(calculateCategoryScore('two_pairs', [6, 6, 6, 2, 2])).toBe(16); // 6s pair + 2s pair
    expect(calculateCategoryScore('two_pairs', [3, 3, 3, 3, 1])).toBe(0); // Needs 2 distinct pairs
  });

  it('calculates 3 of a kind and 4 of a kind correctly', () => {
    expect(calculateCategoryScore('three_of_a_kind', [4, 4, 4, 1, 2])).toBe(12);
    expect(calculateCategoryScore('three_of_a_kind', [2, 2, 3, 4, 5])).toBe(0);

    expect(calculateCategoryScore('four_of_a_kind', [5, 5, 5, 5, 2])).toBe(20);
    expect(calculateCategoryScore('four_of_a_kind', [5, 5, 5, 1, 2])).toBe(0);
  });

  it('calculates straights correctly', () => {
    expect(calculateCategoryScore('small_straight', [1, 2, 3, 4, 5])).toBe(15);
    expect(calculateCategoryScore('small_straight', [2, 3, 4, 5, 6])).toBe(0);

    expect(calculateCategoryScore('large_straight', [2, 3, 4, 5, 6])).toBe(20);
    expect(calculateCategoryScore('large_straight', [1, 2, 3, 4, 5])).toBe(0);
  });

  it('calculates full house, chance, and yatzy correctly', () => {
    expect(calculateCategoryScore('full_house', [3, 3, 3, 6, 6])).toBe(21);
    expect(calculateCategoryScore('full_house', [3, 3, 3, 3, 3])).toBe(0); // Needs separate pair

    expect(calculateCategoryScore('chance', [1, 2, 3, 4, 6])).toBe(16);

    expect(calculateCategoryScore('yatzy', [6, 6, 6, 6, 6])).toBe(50);
    expect(calculateCategoryScore('yatzy', [6, 6, 6, 6, 5])).toBe(0);
  });

  it('calculates bonus correctly when upper section sum >= 63', () => {
    const scorecardBelow63 = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 17, // total = 62
    };
    expect(calculateScorecardTotals(scorecardBelow63).bonus).toBe(0);

    const scorecard63OrMore = {
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 18, // total = 63
    };
    expect(calculateScorecardTotals(scorecard63OrMore).bonus).toBe(50);
  });
});

describe('AI Player Decisions', () => {
  it('holds matching dice for Yatzy if 5 matching', () => {
    const dice = [6, 6, 6, 6, 6];
    const openCats = ['yatzy', 'sixes', 'chance'];
    expect(getDiceToHold(dice, openCats)).toEqual([true, true, true, true, true]);
  });

  it('chooses Yatzy category when 5 matching dice rolled', () => {
    const dice = [5, 5, 5, 5, 5];
    const openCats = ['yatzy', 'fives', 'chance'];
    expect(chooseBestCategory(dice, openCats)).toBe('yatzy');
  });

  it('strikes out lowest value category if 0 points available', () => {
    const dice = [1, 2, 4, 5, 6]; // No pairs, no straight, no multiples
    const openCats = ['three_of_a_kind', 'four_of_a_kind', 'ones'];
    const chosen = chooseBestCategory(dice, openCats);
    expect(openCats).toContain(chosen);
  });
});

describe('Player Database & Store', () => {
  it('finds or creates player by email', () => {
    const player = findOrCreatePlayerByEmail('testplayer@yatzy.no', 'TestSpiller');
    expect(player).toBeDefined();
    expect(player.email).toBe('testplayer@yatzy.no');
    expect(player.nickname).toBe('TestSpiller');
  });
});
