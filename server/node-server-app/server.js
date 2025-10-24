import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config({ path: '../../database/.env' }); 

const app = express();
const port = 9006;

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test DB connection
pool.connect()
  .then(() => console.log('Connected to DB successfully'))
  .catch(err => console.error('DB connection error:', err));

// Test route
app.get('/', (req, res) => {
  res.send('Server is working!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
