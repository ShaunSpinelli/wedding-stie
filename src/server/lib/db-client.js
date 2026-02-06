/**
 * Database connection helper
 * Supports both Cloudflare Workers (Hyperdrive) and Node.js/Bun environments
 */

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

  // Check if we have DATABASE_URL in env (for Wrangler dev with .env)
  if (c.env?.DATABASE_URL) {
    // In Wrangler dev mode, use node-postgres via dynamic import
    try {
      const pg = await import("pg");
      const { Pool } = pg.default || pg;

      // Create a connection pool using DATABASE_URL from env
      const pool = new Pool({
        connectionString: c.env.DATABASE_URL,
      });

      return pool;
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
