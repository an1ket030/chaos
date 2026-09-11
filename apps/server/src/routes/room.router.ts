import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../modules/auth/auth.middleware';
import { z } from 'zod';
import { getUserById } from '../modules/auth/auth.service';

export const roomRouter = Router();

const roomSettingsSchema = z.object({
  edition: z.enum(['world-cup', 'champions-league', 'premier-league', 'la-liga', 'bundesliga', 'all-time-legends', 'custom']),
  startingBudget: z.number().min(80).max(200).default(120),
  maxPlayers: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(4),
  mode: z.enum(['ffa', 'team']).default('ffa'),
  chaosCardsEnabled: z.boolean().default(true),
  financeCardsEnabled: z.boolean().default(true),
  bidTimer: z.union([z.literal(8), z.literal(10), z.literal(15)]).default(10),
  visibility: z.enum(['public', 'private']).default('public'),
});

// POST /rooms — create room
roomRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const settings = roomSettingsSchema.parse(req.body);
    const user = await getUserById(req.userId!);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    // Import io from app — passed via middleware
    const { createRoom } = await import('../modules/room/room.service');
    const room = await createRoom(req.userId!, user.username, user.avatar_url || '', settings);
    res.status(201).json({ room });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create room';
    res.status(400).json({ error: message });
  }
});

// GET /rooms/:code — get room state
roomRouter.get('/:code', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { getRoom } = await import('../modules/room/room.service');
    const room = await getRoom((req.params.code as string).toUpperCase());
    if (!room) { res.status(404).json({ error: 'Room not found' }); return; }
    res.json(room);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /rooms/:code/results — get results for a completed room
roomRouter.get('/:code/results', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { getRoom } = await import('../modules/room/room.service');
    const room = await getRoom((req.params.code as string).toUpperCase());
    if (!room) { res.status(404).json({ error: 'Room not found' }); return; }

    // Build results from the room state
    const startBudget = room.settings.startingBudget;
    const standings = [...room.players]
      .sort((a, b) => {
        const rA = a.squad.reduce((sum, s) => sum + (s.player?.rating ?? 0), 0);
        const rB = b.squad.reduce((sum, s) => sum + (s.player?.rating ?? 0), 0);
        return rB - rA;
      })
      .map((p, idx) => {
        const filledSlots = p.squad.filter(s => s.player).length;
        const totalRating = p.squad.reduce((sum, s) => sum + (s.player?.rating ?? 0), 0);
        const avgRating = filledSlots > 0 ? Math.round(totalRating / filledSlots) : 0;
        const eloDeltas = [18, 6, -8, -16];
        return {
          userId: p.userId,
          username: p.username,
          avatarUrl: p.avatarUrl,
          placement: idx + 1,
          overallRating: avgRating,
          budget: p.budget,
          totalSpent: startBudget - p.budget,
          filledSlots,
          chaosCardsReceived: p.chaosCardsReceived,
          squad: p.squad,
          eloChange: eloDeltas[idx] >= 0 ? `+${eloDeltas[idx]}` : `${eloDeltas[idx] ?? -16}`,
        };
      });

    res.json({
      code: room.code,
      edition: room.settings.edition,
      standings,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
