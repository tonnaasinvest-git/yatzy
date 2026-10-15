import { CATEGORIES, calculateCategoryScore, getFrequencies } from './yatzy-scoring.js';

/**
 * Determines which dice to hold for an AI turn given current dice and open categories.
 * Returns an array of booleans of length 5 (true = hold, false = reroll).
 */
export function getDiceToHold(dice, openCategoryIds) {
  if (!dice || dice.length !== 5) {
    return [false, false, false, false, false];
  }

  const counts = getFrequencies(dice);

  // 1. If Yatzy is available and we have 5 of a kind: hold all
  if (openCategoryIds.includes('yatzy')) {
    for (let val = 1; val <= 6; val++) {
      if (counts[val] === 5) {
        return [true, true, true, true, true];
      }
    }
  }

  // 2. If Large Straight is open and we have 2-3-4-5-6: hold all
  if (openCategoryIds.includes('large_straight')) {
    if (counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1 && counts[6] >= 1) {
      return [true, true, true, true, true];
    }
  }

  // 3. If Small Straight is open and we have 1-2-3-4-5: hold all
  if (openCategoryIds.includes('small_straight')) {
    if (counts[1] >= 1 && counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1) {
      return [true, true, true, true, true];
    }
  }

  // 4. Look for multiples (4 of a kind, 3 of a kind, pairs)
  let maxFreq = 0;
  let maxFreqVal = 0;
  for (let val = 6; val >= 1; val--) {
    if (counts[val] > maxFreq) {
      maxFreq = counts[val];
      maxFreqVal = val;
    }
  }

  // If 3+ of a kind found: hold all dice matching maxFreqVal
  if (maxFreq >= 3) {
    // If full house is open and we also have a pair of another value, hold those too
    let secondPairVal = 0;
    for (let val = 6; val >= 1; val--) {
      if (val !== maxFreqVal && counts[val] >= 2) {
        secondPairVal = val;
        break;
      }
    }

    return dice.map((d) => d === maxFreqVal || (secondPairVal > 0 && d === secondPairVal));
  }

  // 5. Look for pairs or high single dice
  if (maxFreq === 2) {
    // Find if there is a second pair
    let secondPairVal = 0;
    for (let val = 6; val >= 1; val--) {
      if (val !== maxFreqVal && counts[val] >= 2) {
        secondPairVal = val;
        break;
      }
    }

    if (secondPairVal > 0 && (openCategoryIds.includes('two_pairs') || openCategoryIds.includes('full_house'))) {
      return dice.map((d) => d === maxFreqVal || d === secondPairVal);
    }

    // Otherwise hold the highest pair (especially if high value or matching open upper category)
    return dice.map((d) => d === maxFreqVal);
  }

  // 6. Straight building potential (e.g., 4 sequential values)
  if (openCategoryIds.includes('small_straight') || openCategoryIds.includes('large_straight')) {
    const uniqueVals = Array.from(new Set(dice)).sort((a, b) => a - b);
    // Check for 4 sequential (e.g. 1-2-3-4 or 2-3-4-5 or 3-4-5-6)
    const straights4 = [
      [1, 2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6],
    ];

    for (const seq of straights4) {
      if (seq.every((val) => uniqueVals.includes(val))) {
        // Hold one of each from seq
        const held = [false, false, false, false, false];
        const used = new Set();
        dice.forEach((val, idx) => {
          if (seq.includes(val) && !used.has(val)) {
            held[idx] = true;
            used.add(val);
          }
        });
        return held;
      }
    }
  }

  // 7. Otherwise, hold dice matching open upper section categories with value >= 4
  const highUpperCats = ['sixes', 'fives', 'fours'].filter((catId) => openCategoryIds.includes(catId));
  const targetVal = highUpperCats.length > 0 ? (highUpperCats.includes('sixes') ? 6 : highUpperCats.includes('fives') ? 5 : 4) : 6;

  const holdArray = dice.map((d) => d >= targetVal);
  if (holdArray.some(Boolean)) {
    return holdArray;
  }

  // If nothing else, hold highest single die
  const maxDie = Math.max(...dice);
  let heldOne = false;
  return dice.map((d) => {
    if (d === maxDie && !heldOne) {
      heldOne = true;
      return true;
    }
    return false;
  });
}

/**
 * Chooses the best available category for an AI turn.
 * Returns the category id.
 */
export function chooseBestCategory(dice, openCategoryIds, currentScorecard = {}) {
  if (!openCategoryIds || openCategoryIds.length === 0) return null;

  const candidates = openCategoryIds.map((catId) => {
    const score = calculateCategoryScore(catId, dice);
    return { id: catId, score };
  });

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Check if Yatzy, Hus, Straights, or high scores exist
  const bestCandidate = candidates[0];

  if (bestCandidate.score > 0) {
    // If Yatzy was scored (50), take it!
    if (bestCandidate.id === 'yatzy' && bestCandidate.score === 50) {
      return 'yatzy';
    }

    // Prioritize high-scoring lower categories if score is solid
    for (const cand of candidates) {
      if (['full_house', 'small_straight', 'large_straight', 'four_of_a_kind', 'three_of_a_kind', 'two_pairs', 'one_pair'].includes(cand.id) && cand.score > 0) {
        // Prefer taking positive score in lower categories if good
        if (cand.score >= 12 || ['small_straight', 'large_straight', 'full_house'].includes(cand.id)) {
          return cand.id;
        }
      }
    }

    // Prefer upper section to help reach 63 bonus threshold
    const upperCandidates = candidates.filter((c) => ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].includes(c.id) && c.score > 0);
    if (upperCandidates.length > 0) {
      // If we got 3 or more of that number (e.g. 3 x 4 = 12, 3 x 5 = 15, 3 x 6 = 18), put it in upper
      const strongUpper = upperCandidates.find((c) => {
        const valueMap = { ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6 };
        return c.score >= valueMap[c.id] * 3;
      });
      if (strongUpper) {
        return strongUpper.id;
      }
    }

    return bestCandidate.id;
  }

  // If all open categories yield 0 points for this roll, choose the least penalizing category to strike out (put 0 points).
  // Priority for striking out: ones, twos, yatzy (if low chance left), threes, four_of_a_kind.
  const strikeOutPriority = ['ones', 'twos', 'yatzy', 'threes', 'four_of_a_kind', 'three_of_a_kind', 'one_pair', 'two_pairs', 'full_house', 'small_straight', 'large_straight', 'fours', 'fives', 'sixes', 'chance'];

  for (const catId of strikeOutPriority) {
    if (openCategoryIds.includes(catId)) {
      return catId;
    }
  }

  return openCategoryIds[0];
}
