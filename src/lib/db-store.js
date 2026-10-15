/**
 * In-memory / localStorage DB store with Prisma fallback emulation
 */

const STORAGE_KEY = 'yatzy_players_db';

const DEFAULT_PLAYERS = [
  { id: 'p-1', email: 'spiller1@example.com', nickname: 'Kari Nordmann' },
  { id: 'p-2', email: 'spiller2@example.com', nickname: 'Ola Nordmann' },
  { id: 'p-3', email: 'spiller3@example.com', nickname: 'Terne Terning' },
];

export function getStoredPlayers() {
  if (typeof window === 'undefined') return DEFAULT_PLAYERS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLAYERS));
    return DEFAULT_PLAYERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_PLAYERS;
  }
}

export function saveStoredPlayers(players) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  }
}

export function findOrCreatePlayerByEmail(email, nicknameInput = '') {
  const players = getStoredPlayers();
  const normalizedEmail = email.trim().toLowerCase();

  let existing = players.find((p) => p.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return existing;
  }

  const nickname = nicknameInput.trim() || normalizedEmail.split('@')[0];
  const newPlayer = {
    id: 'p-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    email: normalizedEmail,
    nickname,
    created_at: new Date().toISOString(),
  };

  players.push(newPlayer);
  saveStoredPlayers(players);
  return newPlayer;
}
