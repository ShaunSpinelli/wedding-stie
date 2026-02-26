/**
 * End-to-End Tests for Sakeenah API
 * Tests actual HTTP responses using the Hono app instance
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../src/server/index.js";
import { getDbClient } from "../src/server/lib/db-client.js";
import { TEST_ADMIN_SECRET } from "../src/server/test-utils.js";

// Ensure DATABASE_URL is available for the test environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:password@localhost:5432/wedding_db";
}

const TEST_UID = "e2e-test-wedding";

describe("E2E: Sakeenah API", () => {
  let pool;

  beforeAll(async () => {
    pool = await getDbClient({});

    // Clean up and seed test data
    await pool.query("DELETE FROM wishes WHERE invitation_uid = $1", [
      TEST_UID,
    ]);
    await pool.query("DELETE FROM agenda WHERE invitation_uid = $1", [
      TEST_UID,
    ]);
    await pool.query("DELETE FROM invitations WHERE uid = $1", [TEST_UID]);

    // Create test invitation
    await pool.query(
      `INSERT INTO invitations (uid, title, description, groom_name, bride_name, wedding_date, time, location, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        TEST_UID,
        "Test Wedding",
        "Test Description",
        "Test Groom",
        "Test Bride",
        "2025-12-31",
        "10:00",
        "Test Location",
        "Test Address",
      ],
    );

    // Create test agenda
    await pool.query(
      `INSERT INTO agenda (invitation_uid, title, date, start_time, end_time, location, address, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        TEST_UID,
        "Test Ceremony",
        "2025-12-31",
        "10:00",
        "11:00",
        "Test Location",
        "Test Address",
        0,
      ],
    );
  });

  afterAll(async () => {
    // Clean up
    await pool.query("DELETE FROM wishes WHERE invitation_uid = $1", [
      TEST_UID,
    ]);
    await pool.query("DELETE FROM agenda WHERE invitation_uid = $1", [
      TEST_UID,
    ]);
    await pool.query("DELETE FROM invitations WHERE uid = $1", [TEST_UID]);
  });

  describe("Invitation Endpoints", () => {
    it("GET /api/invitation/:uid - should return invitation data", async () => {
      const res = await app.request(`/api/invitation/${TEST_UID}`);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.groomName).toBe("Test Groom");
      expect(json.data.brideName).toBe("Test Bride");
      expect(json.data.agenda).toHaveLength(1);
    });

    it("GET /api/invitation/:uid - should return 404 for non-existent wedding", async () => {
      const res = await app.request("/api/invitation/non-existent");
      expect(res.status).toBe(404);
    });

    it("GET /api/invitation/:uid - should validate UID format", async () => {
      const res = await app.request("/api/invitation/INVALID_FORMAT");
      expect(res.status).toBe(400);
    });
  });

  describe("Wishes Endpoints", () => {
    let createdWishId;

    it("GET /api/:uid/wishes - should return wishes with pagination", async () => {
      const res = await app.request(`/api/${TEST_UID}/wishes`);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.pagination).toBeDefined();
    });

    it("GET /api/:uid/wishes - should respect limit parameter", async () => {
      const res = await app.request(`/api/${TEST_UID}/wishes?limit=1`);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.pagination.limit).toBe(1);
    });

    it("POST /api/:uid/wishes - should create a new wish", async () => {
      const res = await app.request(`/api/${TEST_UID}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "E2E Guest",
          message: "Created via E2E test",
          attendance: "ATTENDING",
        }),
      });

      const json = await res.json();
      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.name).toBe("E2E Guest");
      createdWishId = json.data.id;
    });

    it("POST /api/:uid/wishes - should reject duplicate wish", async () => {
      const res = await app.request(`/api/${TEST_UID}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "E2E Guest",
          message: "Another message",
        }),
      });

      expect(res.status).toBe(409);
    });

    it("POST /api/:uid/wishes - should validate input", async () => {
      const res = await app.request(`/api/${TEST_UID}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          message: "",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("DELETE /api/:uid/wishes/:id - should delete a wish", async () => {
      const res = await app.request(
        `/api/${TEST_UID}/wishes/${createdWishId}`,
        {
          method: "DELETE",
          headers: { Authorization: TEST_ADMIN_SECRET },
        },
      );

      expect(res.status).toBe(200);
    });

    it("DELETE /api/:uid/wishes/:id - should return 404 for non-existent wish", async () => {
      const res = await app.request(`/api/${TEST_UID}/wishes/999999`, {
        method: "DELETE",
        headers: { Authorization: TEST_ADMIN_SECRET },
      });

      expect(res.status).toBe(404);
    });
  });

  describe("Stats Endpoint", () => {
    it("GET /api/:uid/stats - should return attendance statistics", async () => {
      const res = await app.request(`/api/${TEST_UID}/stats`, {
        headers: { Authorization: TEST_ADMIN_SECRET },
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveProperty("attending");
    });
  });

  describe("CORS and Headers", () => {
    it("should include CORS headers on regular requests", async () => {
      const res = await app.request(`/api/${TEST_UID}/wishes`);
      expect(res.headers.get("access-control-allow-origin")).toBeDefined();
    });
  });
});
