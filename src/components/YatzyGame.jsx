import React, { useState, useEffect } from 'react';
import { Scoreboard } from './Scoreboard.jsx';
import { DiceRoller } from './DiceRoller.jsx';
import { CATEGORIES, calculateCategoryScore, calculateScorecardTotals } from '../lib/yatzy-scoring.js';
import { getDiceToHold, chooseBestCategory } from '../lib/yatzy-ai.js';

export function YatzyGame({ players, onNewGame }) {
  const [currentRound, setCurrentRound] = useState(1); // 1 to 15
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [dice, setDice] = useState([1, 1, 1, 1, 1]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [scorecards, setScorecards] = useState(() => {
    const initial = {};
    players.forEach((p) => {
      initial[p.id] = {};
    });
    return initial;
  });
  const [gameFinished, setGameFinished] = useState(false);
  const [logMessages, setLogMessages] = useState([]);

  const activePlayer = players[activePlayerIndex];

  const addLog = (msg) => {
    setLogMessages((prev) => [msg, ...prev.slice(0, 19)]);
  };

  // Helper to get open categories for a player
  const getOpenCategories = (playerId) => {
    const pScorecard = scorecards[playerId] || {};
    return CATEGORIES.map((c) => c.id).filter((catId) => pScorecard[catId] === undefined);
  };

  // Roll dice action
  const handleRoll = () => {
    if (rollsLeft <= 0) return;

    const newDice = dice.map((val, idx) => {
      if (held[idx] && rollsLeft < 3) {
        return val;
      }
      return Math.floor(Math.random() * 6) + 1;
    });

    setDice(newDice);
    const newRollsLeft = rollsLeft - 1;
    setRollsLeft(newRollsLeft);

    addLog(`${activePlayer.name} kastet terningene: [${newDice.join(', ')}] (Kast igjenn: ${newRollsLeft})`);
  };

  // Toggle hold single die
  const handleToggleHold = (idx) => {
    if (rollsLeft === 3 || rollsLeft === 0) return;
    setHeld((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  // Record category score for active player
  const handleSelectCategory = (categoryId) => {
    if (rollsLeft === 3) return; // Must have rolled at least once

    const score = calculateCategoryScore(categoryId, dice);

    setScorecards((prev) => ({
      ...prev,
      [activePlayer.id]: {
        ...prev[activePlayer.id],
        [categoryId]: score,
      },
    }));

    const catObj = CATEGORIES.find((c) => c.id === categoryId);
    addLog(`${activePlayer.name} forte inn ${score} poeng for '${catObj?.name || categoryId}'`);

    advanceTurn();
  };

  // Advance turn to next player or next round
  const advanceTurn = () => {
    setDice([1, 1, 1, 1, 1]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);

    const nextPlayerIndex = (activePlayerIndex + 1) % players.length;

    if (nextPlayerIndex === 0) {
      // Completed a round for all players
      const nextRound = currentRound + 1;
      if (nextRound > 15) {
        setGameFinished(true);
        addLog('🏆 Spillet er fullført for alle 15 rundene!');
        return;
      }
      setCurrentRound(nextRound);
    }

    setActivePlayerIndex(nextPlayerIndex);
  };

  // Handle AI turn automation
  useEffect(() => {
    if (gameFinished) return;

    if (activePlayer && activePlayer.isAi) {
      let isSubscribed = true;

      const runAiTurn = async () => {
        addLog(`🤖 ${activePlayer.name} sin tur startes...`);

        // Roll 1
        let currentRolls = 3;
        let currentDiceState = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ];
        currentRolls--;

        if (!isSubscribed) return;
        setDice(currentDiceState);
        setRollsLeft(currentRolls);
        addLog(`🤖 ${activePlayer.name} kast 1: [${currentDiceState.join(', ')}]`);

        // Wait brief delay for UX
        await new Promise((res) => setTimeout(res, 600));

        const openCats = getOpenCategories(activePlayer.id);

        // Roll 2 if needed
        let holdDecision = getDiceToHold(currentDiceState, openCats);
        setHeld(holdDecision);
        await new Promise((res) => setTimeout(res, 400));

        currentDiceState = currentDiceState.map((val, idx) => (holdDecision[idx] ? val : Math.floor(Math.random() * 6) + 1));
        currentRolls--;

        if (!isSubscribed) return;
        setDice(currentDiceState);
        setRollsLeft(currentRolls);
        addLog(`🤖 ${activePlayer.name} kast 2: [${currentDiceState.join(', ')}]`);

        await new Promise((res) => setTimeout(res, 600));

        // Roll 3 if needed
        holdDecision = getDiceToHold(currentDiceState, openCats);
        setHeld(holdDecision);
        await new Promise((res) => setTimeout(res, 400));

        currentDiceState = currentDiceState.map((val, idx) => (holdDecision[idx] ? val : Math.floor(Math.random() * 6) + 1));
        currentRolls--;

        if (!isSubscribed) return;
        setDice(currentDiceState);
        setRollsLeft(currentRolls);
        addLog(`🤖 ${activePlayer.name} kast 3: [${currentDiceState.join(', ')}]`);

        await new Promise((res) => setTimeout(res, 600));

        // Select best category
        const bestCatId = chooseBestCategory(currentDiceState, openCats, scorecards[activePlayer.id]);
        const score = calculateCategoryScore(bestCatId, currentDiceState);

        if (!isSubscribed) return;
        setScorecards((prev) => ({
          ...prev,
          [activePlayer.id]: {
            ...prev[activePlayer.id],
            [bestCatId]: score,
          },
        }));

        const catObj = CATEGORIES.find((c) => c.id === bestCatId);
        addLog(`🤖 ${activePlayer.name} valgte '${catObj?.name}' for ${score} poeng.`);

        advanceTurn();
      };

      const timer = setTimeout(() => {
        runAiTurn();
      }, 500);

      return () => {
        isSubscribed = false;
        clearTimeout(timer);
      };
    }
  }, [activePlayerIndex, currentRound, gameFinished]);

  // Determine Leader/Winner
  const rankings = players.map((p) => {
    const totals = calculateScorecardTotals(scorecards[p.id]);
    return {
      player: p,
      total: totals.grandTotal,
      upper: totals.upperSum,
      bonus: totals.bonus,
    };
  });
  rankings.sort((a, b) => b.total - a.total);

  const winner = rankings[0];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem', fontFamily: 'sans-serif' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>🎲 Yatzy Spillbrett</h2>
          <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            Runde <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{Math.min(currentRound, 15)}</span> av 15
          </div>
        </div>

        <div>
          <button
            onClick={onNewGame}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Nytt Spill / Menystart
          </button>
        </div>
      </div>

      {/* Game Finished Screen */}
      {gameFinished ? (
        <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '12px', padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#15803d', marginTop: 0 }}>🎉 Spillet er fullført! 🎉</h1>
          <h2>Vinner: {winner.player.name} med {winner.total} poeng!</h2>

          <div style={{ maxWidth: '400px', margin: '1.5rem auto 2rem auto', textAlign: 'left', background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <h4 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Sluttstilling:</h4>
            <ol style={{ paddingLeft: '1.2rem' }}>
              {rankings.map((r, i) => (
                <li key={r.player.id} style={{ marginBottom: '0.4rem', fontWeight: i === 0 ? 'bold' : 'normal' }}>
                  {r.player.name}: {r.total} poeng {r.bonus > 0 ? '(Inkl. 50p bonus)' : ''}
                </li>
              ))}
            </ol>
          </div>

          <button
            onClick={onNewGame}
            style={{ padding: '0.8rem 2rem', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Spill Igjen 🎲
          </button>
        </div>
      ) : (
        <>
          {/* Active Turn Banner */}
          <div style={{ backgroundColor: activePlayer?.isAi ? '#eff6ff' : '#f0fdf4', borderLeft: `6px solid ${activePlayer?.isAi ? '#2563eb' : '#16a34a'}`, padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Aktiv Spiller:</span>
              <h3 style={{ margin: '2px 0 0 0', color: '#0f172a' }}>
                {activePlayer?.name} {activePlayer?.isAi ? '🤖 (AI)' : '👤'}
              </h3>
            </div>
            {activePlayer?.isAi && <div style={{ fontSize: '0.9rem', color: '#2563eb', fontWeight: 'bold' }}>AI tenker og kaster...</div>}
          </div>

          {/* Dice Roller */}
          <DiceRoller
            dice={dice}
            held={held}
            rollsLeft={rollsLeft}
            onRoll={handleRoll}
            onToggleHold={handleToggleHold}
            disabled={gameFinished || activePlayer?.isAi}
            isAi={activePlayer?.isAi}
          />

          {/* Scoreboard */}
          <Scoreboard
            players={players}
            activePlayerIndex={activePlayerIndex}
            currentDice={dice}
            rollsLeft={rollsLeft}
            scorecards={scorecards}
            onSelectCategory={handleSelectCategory}
            isTurnFinished={false}
          />

          {/* Action log */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>Spillogg</h4>
            <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '0.85rem', color: '#334155' }}>
              {logMessages.map((log, idx) => (
                <div key={idx} style={{ padding: '2px 0' }}>
                  • {log}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
