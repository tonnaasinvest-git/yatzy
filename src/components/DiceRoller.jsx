import React from 'react';

const DIE_FACES = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅',
};

export function DiceRoller({ dice, held, rollsLeft, onRoll, onToggleHold, disabled, isAi }) {
  return (
    <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', margin: '1.5rem 0', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {dice.map((value, index) => {
          const isHeld = held[index];
          return (
            <button
              key={index}
              onClick={() => !disabled && rollsLeft < 3 && rollsLeft > 0 && onToggleHold(index)}
              disabled={disabled || rollsLeft === 3 || rollsLeft === 0 || isAi}
              style={{
                width: '64px',
                height: '64px',
                fontSize: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isHeld ? '#bbf7d0' : '#ffffff',
                border: isHeld ? '3px solid #16a34a' : '2px solid #cbd5e1',
                borderRadius: '12px',
                cursor: !disabled && rollsLeft < 3 && rollsLeft > 0 && !isAi ? 'pointer' : 'default',
                boxShadow: isHeld ? '0 0 8px rgba(22, 163, 74, 0.4)' : '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease-in-out',
                color: isHeld ? '#15803d' : '#1e293b',
              }}
              title={isHeld ? 'Beholdt (Klikk for å låse opp)' : 'Klikk for å beholde'}
            >
              {value ? DIE_FACES[value] || value : '🎲'}
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold', color: '#475569' }}>
        Kast igjen for denne turen: <span style={{ color: rollsLeft > 0 ? '#2563eb' : '#dc2626', fontSize: '1.2rem' }}>{rollsLeft}</span> / 3
      </div>

      <button
        onClick={onRoll}
        disabled={disabled || rollsLeft <= 0}
        style={{
          padding: '0.8rem 2rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: '#ffffff',
          backgroundColor: disabled || rollsLeft <= 0 ? '#94a3b8' : '#2563eb',
          border: 'none',
          borderRadius: '8px',
          cursor: disabled || rollsLeft <= 0 ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {rollsLeft === 3 ? 'Kast terninger 🎲' : rollsLeft > 0 ? 'Kast unntatt beholdte 🎲' : 'Ingen kast igjen'}
      </button>

      {rollsLeft < 3 && rollsLeft > 0 && !isAi && (
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
          💡 Klikk på terningene du ønsker å beholde før du kaster på nytt!
        </p>
      )}
    </div>
  );
}
