/**
 * Guest Mode Test
 * Verifies that regular guests can RSVP without 403 errors
 * and that admin-only fields are correctly stripped.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../src/server/index.js";
import { getDbClient } from "../src/server/lib/db-client.js";

const TEST_UID = "guest-mode-test";

describe("E2E: Guest Mode RSVP", () => {
  let pool;
  let guestId;

  beforeAll(async () => {
    try {
      pool = await getDbClient({});
      await pool.query("DELETE FROM guests WHERE invitation_uid = $1", [
        TEST_UID,
      ]);
      await pool.query("DELETE FROM invitations WHERE uid = $1", [TEST_UID]);

      await pool.query(
        `INSERT INTO invitations (uid, title, description, groom_name, bride_name, wedding_date, time, location, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [TEST_UID, "Test", "Test", "G", "B", "2027-05-22", "10:00", "L", "A"],
      );

      // 1. Create a guest via POST (public registration)
      const res = await app.request(`/api/${TEST_UID}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Original Guest",
          plus_guests_allowed: 5, // Try to hack 5 plus ones
          plus_guests: ["Illegal 1"],
        }),
      });
      const json = await res.json();
      guestId = json.data.id;

      // Verify stripping in POST
      expect(json.data.plus_guests_allowed).toBe(0);
    } catch (e) {
      console.error("Setup failed:", e);
    }
  });

  afterAll(async () => {
    if (pool) {
      await pool.query("DELETE FROM guests WHERE invitation_uid = $1", [
        TEST_UID,
      ]);
      await pool.query("DELETE FROM invitations WHERE uid = $1", [TEST_UID]);
    }
  });

  it("should allow a regular guest to update RSVP without 403", async () => {
    const payload = {
      name: "Updated Guest Name",
      attending: "ATTENDING",
      plus_guests_allowed: 5, // Valid for schema, but restricted for guest
      plus_guests: ["Friend"],
    };

    const res = await app.request(`/api/${TEST_UID}/guests/${guestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }, // NO Authorization header
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("Updated Guest Name");

    // Restricted field should be ignored (stay 0)
    expect(json.data.plus_guests_allowed).toBe(0);

    // Verify DB directly
    const dbRes = await pool.query("SELECT * FROM guests WHERE id = $1", [
      guestId,
    ]);
    expect(dbRes.rows[0].plus_guests_allowed).toBe(0);
    expect(dbRes.rows[0].name).toBe("Updated Guest Name");
  });
});
