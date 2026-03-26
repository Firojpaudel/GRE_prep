import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  if (!process.env.NEON_DATABASE_URL) {
    console.log("No NEON_DATABASE_URL found, skipping DB migration.");
    return;
  }
  const sql = neon(process.env.NEON_DATABASE_URL);
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_data JSONB DEFAULT '{}'::jsonb;`;
    console.log("Migration successful: added user_data JSONB column.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}
run();
