/**
 * Unit tests for Invitation API routes
 * Uses mocked database for isolated testing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import invitationRoutes from "./routes.js";
import {
  createMockPool,
  createMockInvitation,
  createMockAgenda,
} from "../../test-utils.js";

// Mock the db-client module
vi.mock("../../lib/db-client.js", () => ({
  getDbClient: vi.fn(),
}));

import { getDbClient } from "../../lib/db-client.js";

describe("invitation routes", () => {
  let app;
  let mockPool;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create fresh app for each test
    app = new Hono();
    app.route("/invitation", invitationRoutes);
  });

  describe("GET /invitation/:uid", () => {
    it("should return invitation with agenda", async () => {
      const mockInvitation = createMockInvitation();
      const mockAgenda = [
        createMockAgenda({ id: 1, title: "Ceremony" }),
        createMockAgenda({ id: 2, title: "Reception" }),
      ];

      mockPool = createMockPool({
        "SELECT * FROM invitations": { rows: [mockInvitation] },
        "SELECT id, title, date, start_time, end_time, location, address FROM agenda":
          { rows: mockAgenda },
      });

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request("/invitation/test-uid");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.groomName).toBe(mockInvitation.groom_name);
      expect(json.data.agenda).toHaveLength(2);
    });

    it("should format response to match frontend structure", async () => {
      const mockInvitation = createMockInvitation({
        groom_name: "Shaun",
        bride_name: "Manon",
      });

      mockPool = createMockPool({
        "SELECT * FROM invitations": { rows: [mockInvitation] },
        "SELECT id, title, date, start_time, end_time, location, address FROM agenda":
          { rows: [] },
      });

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request("/invitation/test-uid");
      const json = await res.json();

      expect(json.data.groomName).toBe("Shaun");
      expect(json.data.brideName).toBe("Manon");
      expect(json.data.date).toBeDefined();
    });

    it("should return 404 for non-existent invitation", async () => {
      mockPool = createMockPool({
        "SELECT * FROM invitations": { rows: [] },
      });

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request("/invitation/non-existent");
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Invitation not found");
    });

    it("should validate UID format", async () => {
      // UID too short or invalid characters (based on schemas.js)
      const res = await app.request("/invitation/A");
      expect(res.status).toBe(400);
    });

    it("should handle empty agenda", async () => {
      mockPool = createMockPool({
        "SELECT * FROM invitations": { rows: [createMockInvitation()] },
        "SELECT id, title, date, start_time, end_time, location, address FROM agenda":
          { rows: [] },
      });

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request("/invitation/test-uid");
      const json = await res.json();

      expect(json.data.agenda).toEqual([]);
    });

    it("should format agenda items correctly", async () => {
      const mockAgendaItem = createMockAgenda({
        start_time: "10:00",
        end_time: "11:00",
      });

      mockPool = createMockPool({
        "SELECT * FROM invitations": { rows: [createMockInvitation()] },
        "SELECT id, title, date, start_time, end_time, location, address FROM agenda":
          { rows: [mockAgendaItem] },
      });

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request("/invitation/test-uid");
      const json = await res.json();

      expect(json.data.agenda[0].startTime).toBe("10:00");
      expect(json.data.agenda[0].endTime).toBe("11:00");
    });

    it("should handle database errors gracefully", async () => {
      mockPool = {
        query: vi.fn().mockRejectedValue(new Error("Connection timeout")),
      };

      getDbClient.mockResolvedValue(mockPool);

      const res = await app.request("/invitation/test-uid");
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
    });
  });
});
