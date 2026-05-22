import { safeBase64 } from "@/lib/base64";

/**
 * Generate a personalized invitation link for a guest
 * @param {string} uid - The invitation UID (e.g., 'rifqi-dina-2025')
 * @param {string} guestEmail - The guest's email address
 * @param {string} baseUrl - Optional base URL (defaults to current origin)
 * @returns {string} - The personalized invitation URL
 *
 * @example
 * generateInvitationLink('rifqi-dina-2025', 'john@example.com')
 * // Returns: http://localhost:5173/rifqi-dina-2025?guest=am9obkBleGFtcGxlLmNvbQ==
 */
export function generateInvitationLink(uid, guestEmail, baseUrl) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const base =
    baseUrl ||
    (typeof import.meta.env !== "undefined" ? import.meta.env.BASE_URL : "/");

  // Ensure base starts and ends correctly
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const url = baseUrl ? base : `${origin}${cleanBase}`;
  const encodedEmail = safeBase64.encode(guestEmail);

  return `${url}?guest=${encodedEmail}`;
}

/**
 * Generate multiple invitation links for a list of guests
 * @param {string} uid - The invitation UID
 * @param {string[]} guestEmails - Array of guest emails
 * @param {string} baseUrl - Optional base URL
 * @returns {Array<{email: string, link: string}>} - Array of objects with email and link
 */
export function generateBulkInvitationLinks(uid, guestEmails, baseUrl) {
  return guestEmails.map((email) => ({
    email,
    link: generateInvitationLink(uid, email, baseUrl),
  }));
}

/**
 * Console utility to quickly generate invitation links
 * Usage: Run this in browser console or node script
 */
export function printInvitationLinks(
  uid,
  guestEmails,
  baseUrl = "http://localhost:5173",
) {
  const links = generateBulkInvitationLinks(uid, guestEmails, baseUrl);
  console.log("\n=== Personalized Invitation Links ===\n");
  links.forEach(({ email, link }) => {
    console.log(`${email}:\n${link}\n`);
  });
  return links;
}
