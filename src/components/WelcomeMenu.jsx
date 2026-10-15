import React, { useState, useEffect } from 'react';
import { findOrCreatePlayerByEmail, getStoredPlayers } from '../lib/db-store.js';

export function WelcomeMenu({ onStartGame }) {
  const [emailInput, setEmailInput] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [registeredPlayer, setRegisteredPlayer] = useState(null);
  const [numPlayers, setNumPlayers] = useState(2);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  useEffect(() => {
    // Default to first player or placeholder
    const players = getStoredPlayers();
    if (players.length > 0) {
      setEmailInput(players[0].email);
      setRegisteredPlayer(players[0]);
    }
  }, []);

  const handleLookupOrCreate = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const player = findOrCreatePlayerByEmail(emailInput, nicknameInput);
    setRegisteredPlayer(player);
  };

  const handleStart = () => {
    const finalPlayers = [];

    // Add registered/logged-in main human player
    if (registeredPlayer) {
      finalPlayers.push({
        id: registeredPlayer.id,
        name: registeredPlayer.nickname,
        isAi: false,
        email: registeredPlayer.email,
      });
    } else {
      finalPlayers.push({
        id: 'human-1',
        name: nicknameInput.trim() || 'Spiller 1',
        isAi: false,
        email: emailInput.trim() || 'spiller1@yatzy.no',
      });
    }

    // Fill remaining spots up to numPlayers with AI or secondary human players
    for (let i = finalPlayers.length + 1; i <= numPlayers; i++) {
      finalPlayers.push({
        id: `ai-${i}`,
        name: `AI Spiller ${i}`,
        isAi: true,
      });
    }

    onStartGame(finalPlayers);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '0.5rem' }}>🎲 Velkommen til Yatzy!</h1>
      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
        Fyll ut skjemaet med 15 terningkombinasjoner for å oppnå flest mulig poeng!
      </p>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0, color: '#334155' }}>1. Spiller-innlogging & registrering</h3>
        <form onSubmit={handleLookupOrCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#475569' }}>
              E-postadresse:
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="f.eks. ola@example.com"
              required
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.3rem', color: '#475569' }}>
              Kallenavn / Navn (for nye spillere):
            </label>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Tast inn kallenavn"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <button
            type="submit"
            style={{ padding: '0.6rem 1.2rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Hent / Registrer Kallenavn
          </button>
        </form>

        {registeredPlayer && (
          <div style={{ marginTop: '1rem', padding: '0.8rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', fontWeight: 'bold' }}>
            Velkommen tilbake, {registeredPlayer.nickname}! ({registeredPlayer.email})
          </div>
        )}
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0, color: '#334155' }}>2. Velg antall spillere (1 - 6)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 'bold', color: '#475569' }}>Antall spillere totalt:</label>
          <select
            value={numPlayers}
            onChange={(e) => setNumPlayers(Number(e.target.value))}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 'bold' }}
          >
            <option value={1}>1 Spiller (Solo)</option>
            <option value={2}>2 Spillere (Deg + 1 AI)</option>
            <option value={3}>3 Spillere (Deg + 2 AI)</option>
            <option value={4}>4 Spillere (Deg + 3 AI)</option>
            <option value={5}>5 Spillere (Deg + 4 AI)</option>
            <option value={6}>6 Spillere (Deg + 5 AI)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleStart}
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: '#16a34a',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        Start Spillet 🎲
      </button>
    </div>
  );
}
