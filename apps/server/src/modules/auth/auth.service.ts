import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../../config/db';
import { env } from '../../config/env';

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  elo_rating: number;
  games_played: number;
  games_won: number;
  total_cp_spent: number;
  best_squad_rating: number;
  favorite_formation: string | null;
  chaos_cards_received: number;
  created_at: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<{ user: UserRecord; tokens: TokenPair }> {
  // Check existing
  const existing = await queryOne<UserRecord>(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username],
  );
  if (existing) throw new Error('Username or email already in use');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await queryOne<UserRecord>(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, avatar_url, elo_rating, games_played, games_won,
               total_cp_spent, best_squad_rating, favorite_formation, chaos_cards_received, created_at`,
    [username, email, passwordHash],
  );
  if (!user) throw new Error('Failed to create user');
  const tokens = await generateTokens(user.id);
  return { user, tokens };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: UserRecord; tokens: TokenPair }> {
  const row = await queryOne<UserRecord & { password_hash: string }>(
    `SELECT id, username, email, password_hash, avatar_url, elo_rating, games_played, games_won,
            total_cp_spent, best_squad_rating, favorite_formation, chaos_cards_received, created_at
     FROM users WHERE email = $1`,
    [email],
  );
  if (!row) throw new Error('Invalid credentials');
  if (!row.password_hash) throw new Error('Use Google login for this account');

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  const tokens = await generateTokens(row.id);
  const { password_hash: _, ...user } = row as UserRecord & { password_hash: string };
  return { user: user as UserRecord, tokens };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    throw new Error('Invalid refresh token');
  }

  const stored = await queryOne(
    'SELECT id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
    [refreshToken],
  );
  if (!stored) throw new Error('Refresh token not found or expired');

  // Rotate: delete old, issue new
  await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  return generateTokens(payload.userId);
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  return queryOne<UserRecord>(
    `SELECT id, username, email, avatar_url, elo_rating, games_played, games_won,
            total_cp_spent, best_squad_rating, favorite_formation, chaos_cards_received, created_at
     FROM users WHERE id = $1`,
    [id],
  );
}

async function generateTokens(userId: string): Promise<TokenPair> {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, refreshToken, expiresAt.toISOString()],
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): { userId: string } {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string };
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
}
