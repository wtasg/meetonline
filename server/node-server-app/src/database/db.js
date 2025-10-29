import { config as dotenvConfig } from 'dotenv';
import { dirname, resolve } from 'path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envRel = process.env.NODE_ENV === 'production' ? '../../.env' : '../../local.env';
const envPath = resolve(__dirname, envRel);

// console.log({ envPath });

if (!existsSync(envPath)) {
    throw new Error(`Environment file not found at path: ${envPath}`);
}

dotenvConfig({ path: envPath });

const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const pool = new Pool(config);

// console.log({ pool });

pool.connect()
  .then((client) => {
    console.log("Connected to the database successfully.");
    client.release();
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
  });


export async function dbClose() {
  console.log('[DB] Closing PostgreSQL pool...');

  try {
    console.log(`[DB] Active: ${pool.totalCount},
        Idle: ${pool.idleCount},
        Waiting: ${pool.waitingCount}`);

    await pool.end();
    console.log('[DB] PostgreSQL pool closed successfully.');
  } catch (err) {
    console.error('[DB] Error closing pool:', err);
    throw err;
  }
}

export { pool };
