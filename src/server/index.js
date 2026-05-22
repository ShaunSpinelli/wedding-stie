/**
 * Sakeenah API Server
 * Hono-based REST API for wedding invitations
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import { adminAuth } from "./lib/auth.js";

// Feature routes
import { invitationRoutes } from "./features/invitation/index.js";
import { wishesRoutes } from "./features/wishes/index.js";
import { guestsRoutes } from "./features/guests/index.js";
import spotifyRoutes from "./features/spotify/routes.js";
import { uidParamSchema } from "./schemas.js";
import { getDbClient } from "./lib/db-client.js";

// Create main app
const app = new Hono();

// ============ Middleware ============

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://shaunspinelli.github.io",
      "https://thespinelliwedding.love",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// ============ Routes ============

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Admin verification (directly on app to avoid sub-app issues)
app.get("/api/admin/verify", adminAuth, (c) => c.json({ success: true }));

// Stats route (protected)
app.get(
  "/api/:uid/stats",
  adminAuth,
  zValidator("param", uidParamSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    try {
      const pool = await getDbClient(c);

      // Calculate real headcount from guests table
      const headCountResult = await pool.query(
        `SELECT 
          COUNT(*) FILTER (WHERE attending = 'ATTENDING') as primary_attending,
          SUM(jsonb_array_length(plus_guests)) FILTER (WHERE attending = 'ATTENDING') as plus_guests_attending,
          SUM(children_count) FILTER (WHERE attending = 'ATTENDING') as children_attending,
          COUNT(*) as total_records
         FROM guests 
         WHERE invitation_uid = $1`,
        [uid],
      );

      const stats = headCountResult.rows[0];
      const totalAttending =
        (parseInt(stats.primary_attending) || 0) +
        (parseInt(stats.plus_guests_attending) || 0) +
        (parseInt(stats.children_attending) || 0);

      // Keep compatible with frontend expectations
      return c.json({
        success: true,
        data: {
          attending: totalAttending,
          not_attending:
            headCountResult.rows[0].total_records -
            headCountResult.rows[0].primary_attending, // Approximate
          total: headCountResult.rows[0].total_records,
          breakdown: {
            guests: parseInt(stats.primary_attending) || 0,
            plus_ones: parseInt(stats.plus_guests_attending) || 0,
            children: parseInt(stats.children_attending) || 0,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  },
);

// Mount features
app.route("/api/invitation", invitationRoutes);
app.route("/api/spotify", spotifyRoutes);
app.route("/api/:uid/wishes", wishesRoutes);
app.route("/api/:uid/guests", guestsRoutes);

export default app;
