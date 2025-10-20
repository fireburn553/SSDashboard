const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";
const connectionString = process.env.DATABASE_URL;

console.log(`[DB INIT] Production mode: ${isProduction}`);
if (!connectionString) {
  console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('[DB INIT] Successfully connected to the database.');
});

pool.on('error', (err) => {
  console.error('[DB INIT] Database pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
