import { Router } from 'express';
import { query } from '../config/db';

export const lobbyRouter = Router();

// GET /lobby/leaderboard
lobbyRouter.get('/leaderboard', async (_req, res) => {
  try {
    const users = await query(
      `SELECT id, username, elo_rating, games_played, games_won, avatar_url
       FROM users
       ORDER BY elo_rating DESC
       LIMIT 20`
    );
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /lobby/games/recent
lobbyRouter.get('/games/recent', async (_req, res) => {
  try {
    const games = await query(
      `SELECT g.id, g.room_code, g.edition, g.mode, g.completed_at,
              u.username as winner_username, u.avatar_url as winner_avatar,
              g.player_count
       FROM games g
       LEFT JOIN users u ON g.winner_id = u.id
       ORDER BY g.completed_at DESC
       LIMIT 10`
    );
    res.json(games);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
