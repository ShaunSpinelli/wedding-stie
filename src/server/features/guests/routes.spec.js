/**
 * Unit tests for Guests API routes
 * Uses mocked database for isolated testing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import guestsRoutes from "./routes.js";
import {
  createMockPool,
  createMockGuest,
  getAuthHeaders,
} from "../../test-utils.js";

// Mock the db-client module
vi.mock("../../lib/db-client.js", () => ({
  getDbClient: vi.fn(),
}));

import { getDbClient } from "../../lib/db-client.js";

describe("guests routes", () => {
  let app;
  let mockPool;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create fresh app for each test
    app = new Hono();
    app.route("/:uid/guests", guestsRoutes);
  });

  describe("POST /:uid/guests", () => {
    it("should create a guest with plus N support", async () => {
      const mockGuest = createMockGuest({
        name: "John Doe",
        plus_guests_allowed: 2,
        plus_guests: ["Jane Doe", "Jimmy Doe"],
      });

      mockPool = createMockPool({
        "INSERT INTO guests": { rows: [mockGuest] },
      });

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request("/test-wedding/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: "John Doe",
          plus_guests_allowed: 2,
          plus_guests: ["Jane Doe", "Jimmy Doe"],
        }),
      });

      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.plus_guests_allowed).toBe(2);
      expect(json.data.plus_guests).toEqual(["Jane Doe", "Jimmy Doe"]);

      // Verify DB call
      const insertCall = mockPool.query.mock.calls.find((c) =>
        c[0].includes("INSERT INTO guests"),
      );
      // plus_guests_allowed is the 11th parameter ($11), which is index 10
      expect(insertCall[1][10]).toBe(2);
      // plus_guests is the 12th parameter ($12), which is index 11
      expect(insertCall[1][11]).toBe(JSON.stringify(["Jane Doe", "Jimmy Doe"]));
    });

    it("should reject more than 5 plus guests (validation)", async () => {
      const res = await app.request("/test-wedding/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          plus_guests_allowed: 6,
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /:uid/guests/:id", () => {
    it("should update plus guest names", async () => {
      const guestId = "550e8400-e29b-41d4-a716-446655440000";
      const updatedGuest = createMockGuest({
        id: guestId,
        plus_guests: ["Alice", "Bob"],
      });

      mockPool = createMockPool({
        "UPDATE guests": { rows: [updatedGuest] },
      });

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request(`/test-wedding/guests/${guestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          plus_guests: ["Alice", "Bob"],
        }),
      });

      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.plus_guests).toEqual(["Alice", "Bob"]);

      // Verify DB call - check if plus_guests was stringified
      const updateCall = mockPool.query.mock.calls.find((c) =>
        c[0].includes("UPDATE guests"),
      );
      expect(updateCall[1]).toContain(JSON.stringify(["Alice", "Bob"]));
    });
  });

  describe("GET /:uid/guests/:id", () => {
    it("should return plus N fields and lastVisitedAt", async () => {
      const guestId = "550e8400-e29b-41d4-a716-446655440000";
      const mockGuest = createMockGuest({
        id: guestId,
        plus_guests_allowed: 3,
        plus_guests: ["A", "B"],
        last_visited_at: "2026-08-22T14:00:00.000Z",
      });

      mockPool = createMockPool({
        "SELECT * FROM guests": { rows: [mockGuest] },
      });

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request(`/test-wedding/guests/${guestId}`);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.plus_guests_allowed).toBe(3);
      expect(json.data.plus_guests).toEqual(["A", "B"]);
      expect(json.data.lastVisitedAt).toBe("2026-08-22T14:00:00.000Z");
    });
  });

  describe("POST /:uid/guests/:id/visit", () => {
    it("should record guest visit timestamp and return updated date", async () => {
      const guestId = "550e8400-e29b-41d4-a716-446655440000";
      const visitDate = "2026-08-22T14:45:00.000Z";

      mockPool = createMockPool({
        "UPDATE guests": {
          rows: [
            {
              id: guestId,
              last_visited_at: visitDate,
            },
          ],
        },
      });

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request(`/test-wedding/guests/${guestId}/visit`, {
        method: "POST",
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe(guestId);
      expect(json.data.lastVisitedAt).toBe(visitDate);

      // Verify query includes last_visited_at = CURRENT_TIMESTAMP
      const updateCall = mockPool.query.mock.calls.find((c) =>
        c[0].includes("SET last_visited_at = CURRENT_TIMESTAMP"),
      );
      expect(updateCall).toBeDefined();
      expect(updateCall[1]).toEqual(["test-wedding", guestId]);
    });

    it("should return 404 when guest is not found", async () => {
      const guestId = "550e8400-e29b-41d4-a716-446655440000";

      mockPool = createMockPool({
        "UPDATE guests": { rows: [] },
      });

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request(`/test-wedding/guests/${guestId}/visit`, {
        method: "POST",
      });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Guest not found");
    });

    it("should reject invalid guest UUID format", async () => {
      const res = await app.request("/test-wedding/guests/invalid-uuid/visit", {
        method: "POST",
      });

      expect(res.status).toBe(400);
    });
  });
});
