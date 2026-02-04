import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import {
  createWishSchema,
  wishesQuerySchema,
  uidParamSchema,
  wishIdParamSchema,
} from "./schemas.js";

// Create main app and API sub-app
const app = new Hono();
const api = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Database connection helper
// In Cloudflare Workers, use Hyperdrive binding (c.env.DB)
// In Node.js, use the pool from db/index.js
async function getDbClient(c) {
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

// API routes are defined below
// Note: Non-API routes will be handled by Cloudflare Workers Assets (serves from /dist)

// ============ Invitation API ============

// Get invitation by UID with all related data
api.get("/invitation/:uid", zValidator("param", uidParamSchema), async (c) => {
  const { uid } = c.req.valid("param");
  try {
    const pool = await getDbClient(c);

    // Get invitation details
    const invitationResult = await pool.query(
      "SELECT * FROM invitations WHERE uid = $1",
      [uid],
    );
    if (invitationResult.rows.length === 0) {
      return c.json({ success: false, error: "Invitation not found" }, 404);
    }

    const invitation = invitationResult.rows[0];

    // Get agenda items
    const agendaResult = await pool.query(
      "SELECT id, title, date, start_time, end_time, location, address FROM agenda WHERE invitation_uid = $1 ORDER BY order_index, date",
      [uid],
    );

    // Get bank accounts
    const banksResult = await pool.query(
      "SELECT id, bank, account_number, account_name FROM banks WHERE invitation_uid = $1 ORDER BY order_index",
      [uid],
    );

    // Format the response to match frontend config structure
    const data = {
      title: invitation.title,
      description: invitation.description,
      groomName: invitation.groom_name,
      brideName: invitation.bride_name,
      parentGroom: invitation.parent_groom,
      parentBride: invitation.parent_bride,
      date: invitation.wedding_date,
      time: invitation.time,
      location: invitation.location,
      address: invitation.address,
      maps_url: invitation.maps_url,
      maps_embed: invitation.maps_embed,
      ogImage: invitation.og_image,
      favicon: invitation.favicon,
      audio: invitation.audio,
      agenda: agendaResult.rows.map((a) => ({
        title: a.title,
        date: a.date,
        startTime: a.start_time,
        endTime: a.end_time,
        location: a.location,
        address: a.address,
      })),
      banks: banksResult.rows.map((b) => ({
        bank: b.bank,
        accountNumber: b.account_number,
        accountName: b.account_name,
      })),
    };

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// ============ Wishes API ============

// Get all wishes for an invitation
api.get(
  "/:uid/wishes",
  zValidator("param", uidParamSchema),
  zValidator("query", wishesQuerySchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const { limit, offset } = c.req.valid("query");

    try {
      const pool = await getDbClient(c);

      // Verify invitation exists
      const invitation = await pool.query(
        "SELECT uid FROM invitations WHERE uid = $1",
        [uid],
      );
      if (invitation.rows.length === 0) {
        return c.json({ success: false, error: "Invitation not found" }, 404);
      }

      // Get wishes
      const result = await pool.query(
        `SELECT id, name, message, attendance,
                created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as created_at
         FROM wishes
         WHERE invitation_uid = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [uid, limit, offset],
      );

      // Get total count
      const countResult = await pool.query(
        "SELECT COUNT(*) FROM wishes WHERE invitation_uid = $1",
        [uid],
      );

      return c.json({
        success: true,
        data: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          limit,
          offset,
        },
      });
    } catch (error) {
      console.error("Error fetching wishes:", error);
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  },
);

// Create a new wish
api.post(
  "/:uid/wishes",
  zValidator("param", uidParamSchema),
  zValidator("json", createWishSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const { name, message, attendance } = c.req.valid("json");

    try {
      const pool = await getDbClient(c);

      // Verify invitation exists
      const invitation = await pool.query(
        "SELECT uid FROM invitations WHERE uid = $1",
        [uid],
      );
      if (invitation.rows.length === 0) {
        return c.json({ success: false, error: "Invitation not found" }, 404);
      }

      // Check if guest has already submitted a wish
      const existingWish = await pool.query(
        "SELECT id FROM wishes WHERE invitation_uid = $1 AND name = $2",
        [uid, name],
      );

      if (existingWish.rows.length > 0) {
        return c.json(
          {
            success: false,
            error:
              "You have already submitted a wish. Each guest can only send one wish.",
            code: "DUPLICATE_WISH",
          },
          409, // Conflict status code
        );
      }

      // Insert wish (name and message already trimmed by Zod)
      const result = await pool.query(
        `INSERT INTO wishes (invitation_uid, name, message, attendance, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')
         RETURNING id, name, message, attendance,
                   created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' as created_at`,
        [uid, name, message, attendance],
      );

      return c.json({ success: true, data: result.rows[0] }, 201);
    } catch (error) {
      console.error("Error creating wish:", error);

      // Handle database unique constraint violation (fallback)
      if (error.code === "23505") {
        // PostgreSQL unique violation error code
        return c.json(
          {
            success: false,
            error:
              "You have already submitted a wish. Each guest can only send one wish.",
            code: "DUPLICATE_WISH",
          },
          409,
        );
      }

      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  },
);

// Delete a wish (optional - for admin)
api.delete(
  "/:uid/wishes/:id",
  zValidator("param", wishIdParamSchema),
  async (c) => {
    const { uid, id } = c.req.valid("param");

    try {
      const pool = await getDbClient(c);
      const result = await pool.query(
        "DELETE FROM wishes WHERE id = $1 AND invitation_uid = $2 RETURNING id",
        [id, uid],
      );

      if (result.rows.length === 0) {
        return c.json({ success: false, error: "Wish not found" }, 404);
      }

      return c.json({ success: true, message: "Wish deleted" });
    } catch (error) {
      console.error("Error deleting wish:", error);
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  },
);

// Get attendance stats
api.get("/:uid/stats", zValidator("param", uidParamSchema), async (c) => {
  const { uid } = c.req.valid("param");

  try {
    const pool = await getDbClient(c);
    const result = await pool.query(
      `SELECT
          COUNT(*) FILTER (WHERE attendance = 'ATTENDING') as attending,
          COUNT(*) FILTER (WHERE attendance = 'NOT_ATTENDING') as not_attending,
          COUNT(*) FILTER (WHERE attendance = 'MAYBE') as maybe,
          COUNT(*) as total
         FROM wishes
         WHERE invitation_uid = $1`,
      [uid],
    );

    return c.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Mount API routes under /api prefix
app.route("/api", api);

// Export for Cloudflare Workers
export default app;
