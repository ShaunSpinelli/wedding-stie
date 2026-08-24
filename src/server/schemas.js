/**
 * Zod validation schemas for API endpoints
 * Provides type-safe request validation with detailed error messages
 */

import { z } from "zod";

/**
 * Wish creation schema
 * Validates incoming wish submissions with attendance tracking
 */
export const createWishSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),

  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message must be less than 500 characters")
    .trim(),

  attendance: z
    .enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"], {
      errorMap: () => ({
        message: "Attendance must be ATTENDING, NOT_ATTENDING, or MAYBE",
      }),
    })
    .default("MAYBE"),
});

/**
 * Wishes query parameters schema
 * Validates pagination parameters
 */
export const wishesQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default("50")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int("Limit must be an integer")
        .positive("Limit must be positive")
        .max(100, "Limit cannot exceed 100"),
    ),

  offset: z
    .string()
    .optional()
    .default("0")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int("Offset must be an integer")
        .min(0, "Offset cannot be negative"),
    ),
});

/**
 * UID parameter schema
 * Validates wedding invitation UID format
 */
export const uidParamSchema = z.object({
  uid: z
    .string()
    .min(1, "UID is required")
    .max(100, "UID must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "UID must contain only lowercase letters, numbers, and hyphens",
    ),
});

/**
 * Guest base schema (without defaults)
 */
const guestBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).trim(),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .nullable()
    .or(z.literal("")),
  language: z.enum(["en", "fr"]),
  attending: z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"]),
  country: z.string().max(100).optional().nullable().or(z.literal("")),
  features: z.array(z.string()),
  dietary_requirements: z.string().optional().nullable().or(z.literal("")),
  has_plus_one: z.boolean(),
  plus_one_name: z.string().max(255).optional().nullable().or(z.literal("")),
  plus_guests_allowed: z.number().int().min(0).max(5),
  plus_guests: z.array(z.string().max(255)).max(5),
  children_count: z.number().int().min(0),
  additional_info: z.string().optional().nullable().or(z.literal("")),
  spotify_song_id: z.string().optional().nullable().or(z.literal("")),
  last_visited_at: z.string().optional().nullable().or(z.literal("")),
  staying_onsite: z.enum(["YES", "NO"]).optional().nullable().or(z.literal("")),
  staying_extra_night: z
    .enum(["YES", "NO"])
    .optional()
    .nullable()
    .or(z.literal("")),
});

/**
 * Guest creation schema (with defaults)
 */
export const createGuestSchema = guestBaseSchema
  .extend({
    language: guestBaseSchema.shape.language.default("en"),
    attending: guestBaseSchema.shape.attending.default("MAYBE"),
    features: guestBaseSchema.shape.features.default([]),
    has_plus_one: guestBaseSchema.shape.has_plus_one.default(false),
    plus_guests_allowed: guestBaseSchema.shape.plus_guests_allowed.default(0),
    plus_guests: guestBaseSchema.shape.plus_guests.default([]),
    children_count: guestBaseSchema.shape.children_count.default(0),
  })
  .passthrough();

/**
 * Guest update schema (partial, NO defaults)
 */
export const updateGuestSchema = guestBaseSchema.partial().passthrough();

/**
 * Guest ID parameter schema
 */
export const guestIdParamSchema = z.object({
  uid: z.string().min(1),
  id: z.string().uuid("Invalid Guest ID format"),
});

/**
 * Wish ID parameter schema
 * Validates wish ID for deletion
 */
export const wishIdParamSchema = z.object({
  uid: z.string().min(1),
  id: z
    .string()
    .regex(/^\d+$/, "Wish ID must be a valid number")
    .transform((val) => parseInt(val, 10)),
});

// Type definitions for JSDoc (no runtime impact)
/**
 * @typedef {import('zod').infer<typeof createWishSchema>} CreateWish
 * @typedef {import('zod').infer<typeof wishesQuerySchema>} WishesQuery
 * @typedef {import('zod').infer<typeof uidParamSchema>} UidParam
 * @typedef {import('zod').infer<typeof wishIdParamSchema>} WishIdParam
 */
