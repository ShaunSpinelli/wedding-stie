/**
 * Example script to generate personalized invitation links
 *
 * Usage:
 *   bun run generate-links-example.js
 *
 * This will output personalized invitation links for each guest
 */

// Simple base64 encode function (same as in safeBase64)
function base64Encode(str) {
  return Buffer.from(str, "utf-8").toString("base64");
}

function generateInvitationLink(
  uid,
  guestEmail,
  baseUrl = "http://localhost:5173",
) {
  const encodedEmail = base64Encode(guestEmail);
  return `${baseUrl}?guest=${encodedEmail}`;
}

// ===== CONFIGURATION =====
const INVITATION_UID = "shaun-manon-2027"; // Change this to your invitation UID
const BASE_URL = "http://localhost:5173"; // Change this to your production URL

// List of guests with their emails
const guestList = [
  { name: "Ahmad Abdullah", email: "ahmad@example.com" },
  { name: "Sarah Johnson", email: "sarah@example.com" },
  { name: "Bapak Rudi", email: "rudi@example.com" },
  { name: "Ibu Siti", email: "siti@example.com" },
  { name: "Dr. Bambang", email: "bambang@example.com" },
];

// ===== GENERATE LINKS =====
console.log(
  "\n╔══════════════════════════════════════════════════════════════╗",
);
console.log("║          PERSONALIZED WEDDING INVITATION LINKS               ║");
console.log(
  "╚══════════════════════════════════════════════════════════════╝\n",
);

console.log(`Invitation UID: ${INVITATION_UID}`);
console.log(`Base URL: ${BASE_URL}\n`);
console.log("─".repeat(70) + "\n");

guestList.forEach((guest, index) => {
  const link = generateInvitationLink(INVITATION_UID, guest.email, BASE_URL);
  console.log(`${index + 1}. ${guest.name} (${guest.email})`);
  console.log(`   ${link}\n`);
});

console.log("─".repeat(70));
console.log(`\nTotal guests: ${guestList.length}`);
console.log("\nHow to use:");
console.log("1. Share each personalized link with the corresponding guest");
console.log(
  "2. When they open the link, their record will be automatically identified by email",
);
console.log("3. They can then confirm their attendance and update details\n");
