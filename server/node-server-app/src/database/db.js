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

pool.connect().then(() => {
    console.log("Connected to the database successfully.");
}).catch((err) => {
    console.error("Failed to connect to the database:", err);
});

export async function closeDb() {
  try {
    await pool.end();
    console.log("Connection pool closed successfully.");
  } catch (err) {
    console.error("Error while closing pool:", err);
  }
}

export { pool };
