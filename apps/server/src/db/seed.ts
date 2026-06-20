import bcrypt from 'bcryptjs';
import { pool } from '../config/db';

async function seed(): Promise<void> {
  console.log('🌱 Seeding database with test users...');

  const hash = await bcrypt.hash('password123', 12);

  await pool.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES
       ('TestPlayer1', 'player1@test.com', $1),
       ('TestPlayer2', 'player2@test.com', $1)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [hash],
  );

  console.log('✅ Seed complete! Login with player1@test.com / password123');
  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
