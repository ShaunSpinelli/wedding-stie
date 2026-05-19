/**
 * Unit tests for Zod validation schemas
 * These are pure function tests - no mocking needed
 */

import { describe, it, expect } from "vitest";
import {
  createWishSchema,
  wishesQuerySchema,
  uidParamSchema,
  wishIdParamSchema,
  createGuestSchema,
} from "./schemas.js";

describe("schemas", () => {
  describe("createWishSchema", () => {
    it("should validate a valid wish", () => {
      const result = createWishSchema.safeParse({
        name: "Ahmad Abdullah",
        message: "Congratulations on your wedding!",
        attendance: "ATTENDING",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        name: "Ahmad Abdullah",
        message: "Congratulations on your wedding!",
        attendance: "ATTENDING",
      });
    });

    it("should trim whitespace from name and message", () => {
      const result = createWishSchema.safeParse({
        name: "  Ahmad  ",
        message: "  Best wishes!  ",
        attendance: "MAYBE",
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Ahmad");
      expect(result.data.message).toBe("Best wishes!");
    });

    it("should default attendance to MAYBE", () => {
      const result = createWishSchema.safeParse({
        name: "Guest",
        message: "Congrats!",
      });

      expect(result.success).toBe(true);
      expect(result.data.attendance).toBe("MAYBE");
    });

    it("should reject empty name", () => {
      const result = createWishSchema.safeParse({
        name: "",
        message: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Name is required");
    });

    it("should reject name exceeding 100 characters", () => {
      const result = createWishSchema.safeParse({
        name: "A".repeat(101),
        message: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        "Name must be less than 100 characters",
      );
    });

    it("should reject empty message", () => {
      const result = createWishSchema.safeParse({
        name: "Guest",
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Message is required");
    });

    it("should reject message exceeding 500 characters", () => {
      const result = createWishSchema.safeParse({
        name: "Guest",
        message: "A".repeat(501),
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        "Message must be less than 500 characters",
      );
    });

    it("should reject invalid attendance value", () => {
      const result = createWishSchema.safeParse({
        name: "Guest",
        message: "Test",
        attendance: "INVALID",
      });

      expect(result.success).toBe(false);
      // Zod v4 uses different error message format for enums
      expect(result.error.issues[0].message).toContain("ATTENDING");
    });

    it("should accept all valid attendance values", () => {
      const attendanceValues = ["ATTENDING", "NOT_ATTENDING", "MAYBE"];

      for (const attendance of attendanceValues) {
        const result = createWishSchema.safeParse({
          name: "Guest",
          message: "Test",
          attendance,
        });
        expect(result.success).toBe(true);
        expect(result.data.attendance).toBe(attendance);
      }
    });
  });

  describe("wishesQuerySchema", () => {
    it("should use default values when no params provided", () => {
      const result = wishesQuerySchema.safeParse({});

      expect(result.success).toBe(true);
      expect(result.data.limit).toBe(50);
      expect(result.data.offset).toBe(0);
    });

    it("should parse string values to numbers", () => {
      const result = wishesQuerySchema.safeParse({
        limit: "25",
        offset: "10",
      });

      expect(result.success).toBe(true);
      expect(result.data.limit).toBe(25);
      expect(result.data.offset).toBe(10);
    });

    it("should reject limit exceeding 100", () => {
      const result = wishesQuerySchema.safeParse({
        limit: "150",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Limit cannot exceed 100");
    });

    it("should reject negative offset", () => {
      const result = wishesQuerySchema.safeParse({
        offset: "-5",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Offset cannot be negative");
    });

    it("should parse decimal string to integer (parseInt behavior)", () => {
      // Note: parseInt("25.5") returns 25, which is valid
      // This is expected JavaScript behavior
      const result = wishesQuerySchema.safeParse({
        limit: "25.5",
      });

      expect(result.success).toBe(true);
      expect(result.data.limit).toBe(25);
    });
  });

  describe("uidParamSchema", () => {
    it("should validate a valid UID", () => {
      const result = uidParamSchema.safeParse({
        uid: "ahmad-fatimah-2025",
      });

      expect(result.success).toBe(true);
      expect(result.data.uid).toBe("ahmad-fatimah-2025");
    });

    it("should accept UIDs with numbers", () => {
      const result = uidParamSchema.safeParse({
        uid: "wedding-2025",
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty UID", () => {
      const result = uidParamSchema.safeParse({
        uid: "",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("UID is required");
    });

    it("should reject UID with uppercase letters", () => {
      const result = uidParamSchema.safeParse({
        uid: "Ahmad-Fatimah",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        "UID must contain only lowercase letters, numbers, and hyphens",
      );
    });

    it("should reject UID with special characters", () => {
      const result = uidParamSchema.safeParse({
        uid: "wedding@2025",
      });

      expect(result.success).toBe(false);
    });

    it("should reject UID with spaces", () => {
      const result = uidParamSchema.safeParse({
        uid: "wedding 2025",
      });

      expect(result.success).toBe(false);
    });

    it("should reject UID exceeding 100 characters", () => {
      const result = uidParamSchema.safeParse({
        uid: "a".repeat(101),
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        "UID must be less than 100 characters",
      );
    });
  });

  describe("wishIdParamSchema", () => {
    it("should validate valid wish ID params", () => {
      const result = wishIdParamSchema.safeParse({
        uid: "wedding-2025",
        id: "123",
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(123);
    });

    it("should transform string ID to number", () => {
      const result = wishIdParamSchema.safeParse({
        uid: "wedding",
        id: "456",
      });

      expect(result.success).toBe(true);
      expect(typeof result.data.id).toBe("number");
    });

    it("should reject non-numeric ID", () => {
      const result = wishIdParamSchema.safeParse({
        uid: "wedding",
        id: "abc",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        "Wish ID must be a valid number",
      );
    });

    it("should reject decimal ID", () => {
      const result = wishIdParamSchema.safeParse({
        uid: "wedding",
        id: "12.5",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("createGuestSchema", () => {
    it("should validate a valid guest with plus N", () => {
      const result = createGuestSchema.safeParse({
        name: "John Doe",
        plus_guests_allowed: 3,
        plus_guests: ["Jane Doe", "Jimmy Doe"],
      });

      expect(result.success).toBe(true);
      expect(result.data.plus_guests_allowed).toBe(3);
      expect(result.data.plus_guests).toEqual(["Jane Doe", "Jimmy Doe"]);
    });

    it("should default plus_guests_allowed to 0", () => {
      const result = createGuestSchema.safeParse({
        name: "John Doe",
      });

      expect(result.success).toBe(true);
      expect(result.data.plus_guests_allowed).toBe(0);
      expect(result.data.plus_guests).toEqual([]);
    });

    it("should reject plus_guests_allowed exceeding 5", () => {
      const result = createGuestSchema.safeParse({
        name: "John Doe",
        plus_guests_allowed: 6,
      });

      expect(result.success).toBe(false);
    });

    it("should reject plus_guests array exceeding 5 items", () => {
      const result = createGuestSchema.safeParse({
        name: "John Doe",
        plus_guests: ["1", "2", "3", "4", "5", "6"],
      });

      expect(result.success).toBe(false);
    });
  });
});
