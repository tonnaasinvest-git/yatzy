import React, { useState } from 'react';
import { WelcomeMenu } from './components/WelcomeMenu.jsx';
import { YatzyGame } from './components/YatzyGame.jsx';

export function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing'
  const [gamePlayers, setGamePlayers] = useState([]);

  const handleStartGame = (players) => {
    setGamePlayers(players);
    setGameState('playing');
  };

  const handleNewGame = () => {
    setGameState('menu');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '1rem' }}>
      {gameState === 'menu' ? (
        <WelcomeMenu onStartGame={handleStartGame} />
      ) : (
        <YatzyGame players={gamePlayers} onNewGame={handleNewGame} />
      )}
    </div>
  );
}

export default App;
