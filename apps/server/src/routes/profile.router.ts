import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../modules/auth/auth.middleware';
import { query, queryOne } from '../config/db';

export const profileRouter = Router();

// GET /profile/:id
profileRouter.get('/:id', async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT id, username, avatar_url, elo_rating, games_played, games_won,
              total_cp_spent, best_squad_rating, favorite_formation, chaos_cards_received, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /profile/me
profileRouter.patch('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { avatarUrl } = req.body as { avatarUrl?: string };
    if (!avatarUrl) { res.status(400).json({ error: 'avatarUrl required' }); return; }
    await query('UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2', [avatarUrl, req.userId]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /profile/:id/games
profileRouter.get('/:id/games', async (req, res) => {
  try {
    const games = await query(
      `SELECT g.id, g.room_code, g.edition, g.mode, g.completed_at,
              gp.formation, gp.squad_rating, gp.chemistry, gp.cp_spent,
              gp.chaos_cards_received, gp.elo_change, gp.position,
              u.username as winner_username
       FROM game_participants gp
       JOIN games g ON gp.game_id = g.id
       LEFT JOIN users u ON g.winner_id = u.id
       WHERE gp.user_id = $1
       ORDER BY g.completed_at DESC
       LIMIT 20`,
      [req.params.id]
    );
    res.json(games);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
