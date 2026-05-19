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
import { adminAuth, isAdmin } from "../../lib/auth.js";

const guestsRoutes = new Hono();

/**
 * Helper to map DB guest row to frontend object
 */
const mapGuestResponse = (guest) => ({
  id: guest.id,
  name: guest.name,
  email: guest.email,
  language: guest.language,
  attending: guest.attending,
  country: guest.country,
  features: guest.features || [],
  dietary_requirements: guest.dietary_requirements,
  additional_info: guest.additional_info,
  has_plus_one: guest.has_plus_one || false,
  plus_one_name: guest.plus_one_name,
  plus_guests_allowed: guest.plus_guests_allowed ?? 0,
  plus_guests: Array.isArray(guest.plus_guests)
    ? guest.plus_guests
    : typeof guest.plus_guests === "string"
      ? JSON.parse(guest.plus_guests)
      : [],
  children_count: guest.children_count ?? 0,
  createdAt: guest.created_at,
  updatedAt: guest.updated_at,
});

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

    return c.json({ success: true, data: mapGuestResponse(result.rows[0]) });
  } catch (error) {
    console.error("Error searching guest:", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/:uid/guests
 * List all guests for a specific invitation (Admin only)
 */
guestsRoutes.get(
  "/",
  adminAuth,
  zValidator("param", uidParamSchema),
  async (c) => {
    const { uid } = c.req.valid("param");

    try {
      const pool = await getDbClient(c);
      const result = await pool.query(
        "SELECT * FROM guests WHERE invitation_uid = $1 ORDER BY created_at DESC",
        [uid],
      );

      return c.json({ success: true, data: result.rows.map(mapGuestResponse) });
    } catch (error) {
      console.error("Error fetching guests:", error);
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  },
);

/**
 * POST /api/:uid/guests
 * Add a new guest (Public registration or Admin)
 */
guestsRoutes.post(
  "/",
  zValidator("param", uidParamSchema),
  zValidator("json", createGuestSchema),
  async (c) => {
    const { uid } = c.req.valid("param");
    const guestData = c.req.valid("json");
    const isRequestAdmin = isAdmin(c);

    try {
      const pool = await getDbClient(c);

      // If not admin, restricted fields are forced to defaults
      const plus_guests_allowed = isRequestAdmin
        ? guestData.plus_guests_allowed || 0
        : 0;
      const country = isRequestAdmin ? guestData.country || null : null;
      const features = isRequestAdmin ? guestData.features || [] : [];

      const result = await pool.query(
        `INSERT INTO guests (invitation_uid, name, email, language, attending, country, features, dietary_requirements, has_plus_one, plus_one_name, plus_guests_allowed, plus_guests, children_count, additional_info)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [
          uid,
          guestData.name,
          guestData.email || null,
          guestData.language || "en",
          guestData.attending,
          country,
          features,
          guestData.dietary_requirements || null,
          guestData.has_plus_one || false,
          guestData.plus_one_name || null,
          plus_guests_allowed,
          JSON.stringify(guestData.plus_guests || []),
          guestData.children_count || 0,
          guestData.additional_info || null,
        ],
      );

      const guest = result.rows[0];
      return c.json({ success: true, data: mapGuestResponse(guest) }, 201);
    } catch (error) {
      console.error("Error creating guest:", error);
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  },
);

/**
 * GET /api/:uid/guests/:id
 * Get a single guest (Admin or own record via UUID)
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

    return c.json({ success: true, data: mapGuestResponse(result.rows[0]) });
  } catch (error) {
    console.error("Error fetching guest:", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

/**
 * PATCH /api/:uid/guests/:id
 * Update a guest (Admin or own record via UUID)
 */
guestsRoutes.patch(
  "/:id",
  zValidator("param", guestIdParamSchema),
  zValidator("json", updateGuestSchema),
  async (c) => {
    const { uid, id } = c.req.valid("param");
    const incomingUpdates = c.req.valid("json");

    // Mapping frontend camelCase to backend snake_case
    const fieldMapping = {
      name: "name",
      email: "email",
      language: "language",
      attending: "attending",
      country: "country",
      features: "features",
      dietary_requirements: "dietary_requirements",
      has_plus_one: "has_plus_one",
      plus_one_name: "plus_one_name",
      plus_guests_allowed: "plus_guests_allowed",
      plus_guests: "plus_guests",
      children_count: "children_count",
      additional_info: "additional_info",
    };

    let updates = {};
    Object.keys(incomingUpdates).forEach((key) => {
      if (
        fieldMapping[key] !== undefined &&
        incomingUpdates[key] !== undefined
      ) {
        updates[fieldMapping[key]] = incomingUpdates[key];
      }
    });

    // Authorization check: Silently strip admin-only fields if not an admin
    if (!isAdmin(c)) {
      delete updates.country;
      delete updates.features;
      delete updates.plus_guests_allowed;
    }

    const keys = Object.keys(updates);
    if (keys.length === 0) {
      return c.json(
        { success: false, error: "No authorized updates provided" },
        400,
      );
    }

    try {
      const pool = await getDbClient(c);

      const setClause = keys.map((key, i) => `${key} = $${i + 3}`).join(", ");
      const values = keys.map((key) => {
        if (key === "plus_guests") return JSON.stringify(updates[key] || []);
        return updates[key];
      });

      const query = `UPDATE guests
         SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE invitation_uid = $1 AND id = $2
         RETURNING *`;

      const result = await pool.query(query, [uid, id, ...values]);

      if (result.rows.length === 0) {
        return c.json({ success: false, error: "Guest not found" }, 404);
      }

      return c.json({ success: true, data: mapGuestResponse(result.rows[0]) });
    } catch (error) {
      console.error("Update error:", error);
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  },
);

/**
 * DELETE /api/:uid/guests/:id
 * Delete a guest (Admin only)
 */
guestsRoutes.delete(
  "/:id",
  adminAuth,
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
