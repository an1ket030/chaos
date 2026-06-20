import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

export async function connectRedis(): Promise<void> {
  await redis.connect();
}

// Room key helpers — 6-hour TTL
const ROOM_TTL = 6 * 60 * 60; // 6 hours in seconds

export async function setRoomState(code: string, state: unknown): Promise<void> {
  await redis.setex(`room:${code}`, ROOM_TTL, JSON.stringify(state));
}

export async function getRoomState<T = unknown>(code: string): Promise<T | null> {
  const data = await redis.get(`room:${code}`);
  return data ? JSON.parse(data) as T : null;
}

export async function deleteRoomState(code: string): Promise<void> {
  await redis.del(`room:${code}`);
}

export async function refreshRoomTTL(code: string): Promise<void> {
  await redis.expire(`room:${code}`, ROOM_TTL);
}
