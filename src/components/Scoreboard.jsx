import React from 'react';
import { CATEGORIES, calculateCategoryScore, calculateScorecardTotals } from '../lib/yatzy-scoring.js';

export function Scoreboard({ players, activePlayerIndex, currentDice, rollsLeft, scorecards, onSelectCategory, isTurnFinished }) {
  const activePlayer = players[activePlayerIndex];
  const activeScorecard = scorecards[activePlayer?.id] || {};

  return (
    <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
            <th style={{ padding: '0.8rem', textAlign: 'left', minWidth: '160px', borderRight: '1px solid #334155' }}>Kombinasjon</th>
            {players.map((p, idx) => {
              const isActive = idx === activePlayerIndex;
              return (
                <th
                  key={p.id}
                  style={{
                    padding: '0.8rem',
                    textAlign: 'center',
                    minWidth: '100px',
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    borderRight: '1px solid #334155',
                  }}
                >
                  <div>{p.name}</div>
                  {p.isAi && <span style={{ fontSize: '0.7rem', backgroundColor: '#3b82f6', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>AI</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Upper Section Header */}
          <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
            <td colSpan={players.length + 1} style={{ padding: '0.5rem 0.8rem', color: '#475569' }}>
              ØVRE DEL
            </td>
          </tr>

          {/* Upper Categories */}
          {CATEGORIES.filter((c) => c.section === 'upper').map((category) => (
            <tr key={category.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.6rem 0.8rem', fontWeight: '500', borderRight: '1px solid #e2e8f0' }}>{category.name}</td>
              {players.map((p, idx) => {
                const isActive = idx === activePlayerIndex;
                const pScorecard = scorecards[p.id] || {};
                const scoreValue = pScorecard[category.id];
                const isRecorded = scoreValue !== undefined && scoreValue !== null;

                let previewScore = null;
                let canSelect = false;

                if (isActive && !isRecorded && rollsLeft < 3 && !activePlayer.isAi && !isTurnFinished) {
                  previewScore = calculateCategoryScore(category.id, currentDice);
                  canSelect = true;
                }

                return (
                  <td
                    key={p.id}
                    onClick={() => canSelect && onSelectCategory(category.id)}
                    style={{
                      textAlign: 'center',
                      padding: '0.6rem 0.8rem',
                      backgroundColor: isActive ? (canSelect ? '#eff6ff' : '#f8fafc') : 'transparent',
                      cursor: canSelect ? 'pointer' : 'default',
                      fontWeight: isRecorded ? 'bold' : 'normal',
                      color: isRecorded ? '#0f172a' : canSelect ? '#2563eb' : '#94a3b8',
                      borderRight: '1px solid #e2e8f0',
                      transition: 'background-color 0.15s ease',
                    }}
                    title={canSelect ? `Velg ${category.name} (${previewScore} p)` : undefined}
                  >
                    {isRecorded ? (
                      scoreValue
                    ) : canSelect ? (
                      <span style={{ opacity: 0.7, fontStyle: 'italic', textDecoration: previewScore === 0 ? 'line-through' : 'none' }}>
                        ({previewScore})
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Upper Sum & Bonus */}
          <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
            <td style={{ padding: '0.6rem 0.8rem', color: '#1e293b', borderRight: '1px solid #e2e8f0' }}>Sum Øvre Del</td>
            {players.map((p) => {
              const totals = calculateScorecardTotals(scorecards[p.id]);
              return (
                <td key={p.id} style={{ textAlign: 'center', padding: '0.6rem 0.8rem', borderRight: '1px solid #e2e8f0' }}>
                  {totals.upperSum}
                </td>
              );
            })}
          </tr>

          <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
            <td style={{ padding: '0.6rem 0.8rem', color: '#166534', borderRight: '1px solid #e2e8f0' }}>Bonus (50 p ved ≥ 63)</td>
            {players.map((p) => {
              const totals = calculateScorecardTotals(scorecards[p.id]);
              return (
                <td key={p.id} style={{ textAlign: 'center', padding: '0.6rem 0.8rem', color: totals.bonus > 0 ? '#166534' : '#94a3b8', borderRight: '1px solid #e2e8f0' }}>
                  {totals.bonus > 0 ? `+${totals.bonus}` : '0'}
                </td>
              );
            })}
          </tr>

          {/* Lower Section Header */}
          <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
            <td colSpan={players.length + 1} style={{ padding: '0.5rem 0.8rem', color: '#475569' }}>
              NEDRE DEL
            </td>
          </tr>

          {/* Lower Categories */}
          {CATEGORIES.filter((c) => c.section === 'lower').map((category) => (
            <tr key={category.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.6rem 0.8rem', fontWeight: '500', borderRight: '1px solid #e2e8f0' }}>{category.name}</td>
              {players.map((p, idx) => {
                const isActive = idx === activePlayerIndex;
                const pScorecard = scorecards[p.id] || {};
                const scoreValue = pScorecard[category.id];
                const isRecorded = scoreValue !== undefined && scoreValue !== null;

                let previewScore = null;
                let canSelect = false;

                if (isActive && !isRecorded && rollsLeft < 3 && !activePlayer.isAi && !isTurnFinished) {
                  previewScore = calculateCategoryScore(category.id, currentDice);
                  canSelect = true;
                }

                return (
                  <td
                    key={p.id}
                    onClick={() => canSelect && onSelectCategory(category.id)}
                    style={{
                      textAlign: 'center',
                      padding: '0.6rem 0.8rem',
                      backgroundColor: isActive ? (canSelect ? '#eff6ff' : '#f8fafc') : 'transparent',
                      cursor: canSelect ? 'pointer' : 'default',
                      fontWeight: isRecorded ? 'bold' : 'normal',
                      color: isRecorded ? '#0f172a' : canSelect ? '#2563eb' : '#94a3b8',
                      borderRight: '1px solid #e2e8f0',
                      transition: 'background-color 0.15s ease',
                    }}
                    title={canSelect ? `Velg ${category.name} (${previewScore} p)` : undefined}
                  >
                    {isRecorded ? (
                      scoreValue
                    ) : canSelect ? (
                      <span style={{ opacity: 0.7, fontStyle: 'italic', textDecoration: previewScore === 0 ? 'line-through' : 'none' }}>
                        ({previewScore})
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Grand Total */}
          <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold', fontSize: '1rem' }}>
            <td style={{ padding: '0.8rem', borderRight: '1px solid #334155' }}>TOTALT</td>
            {players.map((p) => {
              const totals = calculateScorecardTotals(scorecards[p.id]);
              return (
                <td key={p.id} style={{ textAlign: 'center', padding: '0.8rem', color: '#facc15', borderRight: '1px solid #334155' }}>
                  {totals.grandTotal}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
