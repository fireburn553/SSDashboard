const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

let pool;

if (isProduction) {
  // 🟢 Production (Render)
  pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  console.log("📦 Connected to PRODUCTION database");
} else {
  // 💻 Development (local)
  pool = new Pool({
    connectionString: process.env.DB_URL,
        ssl: {
      rejectUnauthorized: false,
    },
  });
  console.log("📦 Connected to DEVELOPMENT database");
}

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (error) {
      console.error("❌ Database query error:", { text, error });
      throw error;
    }
  },
};
