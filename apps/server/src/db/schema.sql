-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  avatar_url TEXT,
  google_id TEXT UNIQUE,
  elo_rating INTEGER DEFAULT 1000,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_cp_spent INTEGER DEFAULT 0,
  best_squad_rating DECIMAL(5,2) DEFAULT 0,
  favorite_formation VARCHAR(16),
  chaos_cards_received INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Completed games
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) NOT NULL,
  edition VARCHAR(32) NOT NULL,
  mode VARCHAR(16) NOT NULL,
  winner_id UUID REFERENCES users(id),
  settings JSONB NOT NULL,
  results JSONB NOT NULL,
  awards JSONB,
  player_count INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game participants
CREATE TABLE IF NOT EXISTS game_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  username VARCHAR(32) NOT NULL,
  final_budget INTEGER NOT NULL,
  squad JSONB NOT NULL,
  formation VARCHAR(16),
  squad_rating DECIMAL(5,2),
  chemistry INTEGER,
  cp_spent INTEGER DEFAULT 0,
  chaos_cards_received INTEGER DEFAULT 0,
  elo_change INTEGER DEFAULT 0,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_winner ON games(winner_id);
CREATE INDEX IF NOT EXISTS idx_games_completed ON games(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_user ON game_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_game ON game_participants(game_id);
CREATE INDEX IF NOT EXISTS idx_users_elo ON users(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
