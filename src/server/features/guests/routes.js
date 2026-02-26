/**
 * Guests Feature - API Routes
 * CRUD operations for managing invited guests
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  uidParamSchema,
  createGuestSchema,
  updateGuestSchema,
  guestIdParamSchema,
} from "../../schemas.js";
import { getDbClient } from "../../lib/db-client.js";

const guestsRoutes = new Hono();

/**
 * GET /api/:uid/guests/search
 * Find a guest by name or email
 */
guestsRoutes.get("/search", zValidator("param", uidParamSchema), async (c) => {
  const { uid } = c.req.valid("param");
  const name = c.req.query("name");
  const email = c.req.query("email");

  if (!name && !email) {
    return c.json({ success: false, error: "Name or email required" }, 400);
  }

  try {
    const pool = await getDbClient(c);
    let query = "SELECT * FROM guests WHERE invitation_uid = $1 AND (";
    const params = [uid];

    if (name && email) {
      query += "LOWER(name) = LOWER($2) OR LOWER(email) = LOWER($3)";
      params.push(name, email);
    } else if (name) {
      query += "LOWER(name) = LOWER($2)";
      params.push(name);
    } else {
      query += "LOWER(email) = LOWER($2)";
      params.push(email);
    }
    query += ")";

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return c.json({ success: false, error: "Guest not found" }, 404);
    }

    return c.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error searching guest:", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/:uid/guests
 * List all guests for a specific invitation
 */
guestsRoutes.get("/", zValidator("param", uidParamSchema), async (c) => {
  const { uid } = c.req.valid("param");

  try {
    const pool = await getDbClient(c);
    const result = await pool.query(
      "SELECT * FROM guests WHERE invitation_uid = $1 ORDER BY created_at DESC",
      [uid],
    );

    return c.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

/**
 * POST /api/:uid/guests
 * Add a new guest
 */
guestsRoutes.post(
  "/",
  zValidator("param", uidParamSchema),
  zValidator("json", createGuestSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const guestData = c.req.valid("json");

    try {
      const pool = await getDbClient(c);
      const result = await pool.query(
        `INSERT INTO guests (invitation_uid, name, email, attending, country, features)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          uid,
          guestData.name,
          guestData.email || null,
          guestData.attending,
          guestData.country || null,
          guestData.features || [],
        ],
      );

      return c.json({ success: true, data: result.rows[0] }, 201);
    } catch (error) {
      console.error("Error creating guest:", error);
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  },
);

/**
 * GET /api/:uid/guests/:id
 * Get a single guest
 */
guestsRoutes.get("/:id", zValidator("param", guestIdParamSchema), async (c) => {
  const { uid, id } = c.req.valid("param");

  try {
    const pool = await getDbClient(c);
    const result = await pool.query(
      "SELECT * FROM guests WHERE invitation_uid = $1 AND id = $2",
      [uid, id],
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, error: "Guest not found" }, 404);
    }

    return c.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching guest:", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

/**
 * PATCH /api/:uid/guests/:id
 * Update a guest
 */
guestsRoutes.patch(
  "/:id",
  zValidator("param", guestIdParamSchema),
  zValidator("json", updateGuestSchema),
  async (c) => {
    const { uid, id } = c.req.valid("param");
    const updates = c.req.valid("json");

    console.log(
      `[Guests API] Updating guest ${id} for invitation ${uid}`,
      updates,
    );

    try {
      const pool = await getDbClient(c);

      // Build dynamic update query
      const keys = Object.keys(updates);
      if (keys.length === 0) {
        return c.json({ success: false, error: "No updates provided" }, 400);
      }

      // Important: Use explicit numbering for params starting from $3
      // since $1 is uid and $2 is id
      const setClause = keys.map((key, i) => `${key} = $${i + 3}`).join(", ");
      const values = keys.map((key) => updates[key]);

      const query = `UPDATE guests
         SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE invitation_uid = $1 AND id = $2
         RETURNING *`;

      console.log("[Guests API] Executing query:", query, [uid, id, ...values]);

      const result = await pool.query(query, [uid, id, ...values]);

      if (result.rows.length === 0) {
        console.log("[Guests API] Guest not found for update");
        return c.json({ success: false, error: "Guest not found" }, 404);
      }

      console.log("[Guests API] Update successful");
      return c.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error("[Guests API] Update error:", error);
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  },
);

/**
 * DELETE /api/:uid/guests/:id
 * Delete a guest
 */
guestsRoutes.delete(
  "/:id",
  zValidator("param", guestIdParamSchema),
  async (c) => {
    const { uid, id } = c.req.valid("param");

    try {
      const pool = await getDbClient(c);
      const result = await pool.query(
        "DELETE FROM guests WHERE invitation_uid = $1 AND id = $2 RETURNING id",
        [uid, id],
      );

      if (result.rows.length === 0) {
        return c.json({ success: false, error: "Guest not found" }, 404);
      }

      return c.json({ success: true, message: "Guest deleted" });
    } catch (error) {
      console.error("Error deleting guest:", error);
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  },
);

export default guestsRoutes;
