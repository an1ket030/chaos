import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env';
import { pool } from './config/db';
import { connectRedis } from './config/redis';
import { authRouter } from './modules/auth/auth.router';
import { lobbyRouter } from './routes/lobby.router';
import { roomRouter } from './routes/room.router';
import { profileRouter } from './routes/profile.router';
import { setupSocketGateway } from './gateway/socket.gateway';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@chaos/shared';

async function main() {
  // Connect to services
  try {
    await pool.connect();
    console.log('✅ PostgreSQL connected');
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err);
    console.log('⚠️  Running without database — auth features disabled');
  }

  try {
    await connectRedis();
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    process.exit(1);
  }

  const app = express();
  const httpServer = createServer(app);

  // Socket.IO
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:5173'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: [env.CLIENT_URL, 'http://localhost:5173'], credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true }));

  // Routes
  app.use('/auth', authRouter);
  app.use('/lobby', lobbyRouter);
  app.use('/rooms', roomRouter);
  app.use('/profile', profileRouter);

  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // Socket.IO gateway
  setupSocketGateway(io);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Chaos Club server running on http://localhost:${env.PORT}`);
    console.log(`📡 Socket.IO ready`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
  });
}

main().catch(console.error);
