/**
 * Database connection helper
 * Supports both Cloudflare Workers (Hyperdrive) and Node.js/Bun environments
 */

let _pool = null;

/**
 * Get database client based on environment
 * @param {import('hono').Context} c - Hono context
 * @returns {Promise<import('pg').Pool>} Database pool
 */
export async function getDbClient(c) {
  // Check if running in Cloudflare Workers with Hyperdrive
  if (c.env?.DB) {
    return c.env.DB;
  }

  if (_pool) return _pool;

  // Check if we have DATABASE_URL in env (for Wrangler dev or local node/bun)
  const databaseUrl = c.env?.DATABASE_URL || process.env.DATABASE_URL;

  if (databaseUrl) {
    // In local mode, use node-postgres via dynamic import
    try {
      const pg = await import("pg");
      const { Pool } = pg.default || pg;

      // Create a connection pool using DATABASE_URL
      // Enable SSL for Neon in production
      const isLocal =
        databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

      _pool = new Pool({
        connectionString: databaseUrl,
        ssl: isLocal ? false : { rejectUnauthorized: false },
      });

      return _pool;
    } catch (error) {
      console.error("Failed to create database connection:", error);
      throw new Error(
        "Database connection not available. Please configure Hyperdrive binding or DATABASE_URL.",
      );
    }
  }

  // Throw error if no database connection is available
  throw new Error(
    "No database connection available. Running in Wrangler dev requires DATABASE_URL in .env or Hyperdrive binding.",
  );
}
