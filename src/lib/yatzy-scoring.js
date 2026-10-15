/**
 * Yatzy Scoring Rules and Utilities
 *
 * 15 categories:
 * Upper Section:
 * - ones: Enere
 * - twos: Toere
 * - threes: Treere
 * - fours: Firere
 * - fives: Femmere
 * - sixes: Seksere
 *
 * Lower Section:
 * - one_pair: 1 par (sum of highest pair)
 * - two_pairs: 2 par (sum of both pairs)
 * - three_of_a_kind: 3 like (sum of 3 matching)
 * - four_of_a_kind: 4 like (sum of 4 matching)
 * - small_straight: Liten straight (1-2-3-4-5 => 15 pts)
 * - large_straight: Stor straight (2-3-4-5-6 => 20 pts)
 * - full_house: Hus (3 of a kind + 1 pair of different value => sum of 5 dice)
 * - chance: Sjanse (sum of all 5 dice)
 * - yatzy: Yatzy (5 of a kind => 50 pts)
 */

export const CATEGORIES = [
  { id: 'ones', name: 'Enere', section: 'upper', value: 1 },
  { id: 'twos', name: 'Toere', section: 'upper', value: 2 },
  { id: 'threes', name: 'Treere', section: 'upper', value: 3 },
  { id: 'fours', name: 'Firere', section: 'upper', value: 4 },
  { id: 'fives', name: 'Femmere', section: 'upper', value: 5 },
  { id: 'sixes', name: 'Seksere', section: 'upper', value: 6 },
  { id: 'one_pair', name: '1 par', section: 'lower' },
  { id: 'two_pairs', name: '2 par', section: 'lower' },
  { id: 'three_of_a_kind', name: '3 like', section: 'lower' },
  { id: 'four_of_a_kind', name: '4 like', section: 'lower' },
  { id: 'small_straight', name: 'Liten straight', section: 'lower' },
  { id: 'large_straight', name: 'Stor straight', section: 'lower' },
  { id: 'full_house', name: 'Hus', section: 'lower' },
  { id: 'chance', name: 'Sjanse', section: 'lower' },
  { id: 'yatzy', name: 'Yatzy', section: 'lower' },
];

/**
 * Counts frequencies of dice values (1-6) in a 5-dice array.
 */
export function getFrequencies(dice) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  dice.forEach((val) => {
    if (counts[val] !== undefined) {
      counts[val]++;
    }
  });
  return counts;
}

/**
 * Calculates possible score for a given category and dice roll.
 */
export function calculateCategoryScore(categoryId, dice) {
  if (!dice || dice.length !== 5) return 0;
  const counts = getFrequencies(dice);

  switch (categoryId) {
    case 'ones':
      return counts[1] * 1;
    case 'twos':
      return counts[2] * 2;
    case 'threes':
      return counts[3] * 3;
    case 'fours':
      return counts[4] * 4;
    case 'fives':
      return counts[5] * 5;
    case 'sixes':
      return counts[6] * 6;

    case 'one_pair': {
      for (let val = 6; val >= 1; val--) {
        if (counts[val] >= 2) {
          return val * 2;
        }
      }
      return 0;
    }

    case 'two_pairs': {
      const pairs = [];
      for (let val = 6; val >= 1; val--) {
        if (counts[val] >= 2) {
          pairs.push(val);
        }
      }
      if (pairs.length >= 2) {
        return pairs[0] * 2 + pairs[1] * 2;
      }
      return 0;
    }

    case 'three_of_a_kind': {
      for (let val = 6; val >= 1; val--) {
        if (counts[val] >= 3) {
          return val * 3;
        }
      }
      return 0;
    }

    case 'four_of_a_kind': {
      for (let val = 6; val >= 1; val--) {
        if (counts[val] >= 4) {
          return val * 4;
        }
      }
      return 0;
    }

    case 'small_straight': {
      if (counts[1] >= 1 && counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1) {
        return 15;
      }
      return 0;
    }

    case 'large_straight': {
      if (counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1 && counts[6] >= 1) {
        return 20;
      }
      return 0;
    }

    case 'full_house': {
      let threeVal = 0;
      let pairVal = 0;

      for (let val = 6; val >= 1; val--) {
        if (counts[val] >= 3 && threeVal === 0) {
          threeVal = val;
        }
      }

      if (threeVal > 0) {
        for (let val = 6; val >= 1; val--) {
          if (val !== threeVal && counts[val] >= 2) {
            pairVal = val;
            break;
          }
        }
      }

      if (threeVal > 0 && pairVal > 0) {
        return threeVal * 3 + pairVal * 2;
      }
      return 0;
    }

    case 'chance': {
      return dice.reduce((acc, val) => acc + val, 0);
    }

    case 'yatzy': {
      for (let val = 1; val <= 6; val++) {
        if (counts[val] === 5) {
          return 50;
        }
      }
      return 0;
    }

    default:
      return 0;
  }
}

/**
 * Calculates totals and bonus for a player's scorecard.
 * scorecard is an object mapping categoryId -> number | null
 */
export function calculateScorecardTotals(scorecard = {}) {
  let upperSum = 0;
  const upperCategories = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
  upperCategories.forEach((catId) => {
    if (typeof scorecard[catId] === 'number') {
      upperSum += scorecard[catId];
    }
  });

  const bonus = upperSum >= 63 ? 50 : 0;

  let lowerSum = 0;
  const lowerCategories = [
    'one_pair',
    'two_pairs',
    'three_of_a_kind',
    'four_of_a_kind',
    'small_straight',
    'large_straight',
    'full_house',
    'chance',
    'yatzy',
  ];

  lowerCategories.forEach((catId) => {
    if (typeof scorecard[catId] === 'number') {
      lowerSum += scorecard[catId];
    }
  });

  const grandTotal = upperSum + bonus + lowerSum;

  return {
    upperSum,
    bonus,
    lowerSum,
    grandTotal,
  };
}
