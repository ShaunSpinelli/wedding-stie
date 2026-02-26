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
import { uidParamSchema } from "./schemas.js";
import { getDbClient } from "./lib/db-client.js";

// Create main app
const app = new Hono();

// ============ Middleware ============

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
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
  },
);

// Mount features
app.route("/api/invitation", invitationRoutes);
app.route("/api/:uid/wishes", wishesRoutes);
app.route("/api/:uid/guests", guestsRoutes);

export default app;
