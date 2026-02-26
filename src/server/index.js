/**
 * Sakeenah API Server
 * Hono-based REST API for wedding invitations
 *
 * Features:
 * - Invitation: Fetch invitation data with agenda
 * - Wishes: Guest wishes/RSVP management
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";

// Feature routes
import { invitationRoutes } from "./features/invitation/index.js";
import { wishesRoutes } from "./features/wishes/index.js";
import { guestsRoutes } from "./features/guests/index.js";
import { uidParamSchema } from "./schemas.js";
import { getDbClient } from "./lib/db-client.js";

// Create main app and API sub-app
const app = new Hono();
const api = new Hono();

// ============ Middleware ============

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// ============ Mount Feature Routes ============

// Invitation routes: /api/invitation/:uid
api.route("/invitation", invitationRoutes);

// Wishes routes: /api/:uid/wishes/*
api.route("/:uid/wishes", wishesRoutes);

// Guests routes: /api/:uid/guests/*
api.route("/:uid/guests", guestsRoutes);

// Stats route (related to wishes but at /:uid level)
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

// ============ Mount API Routes ============

app.route("/api", api);

// ============ Export ============

export default app;
