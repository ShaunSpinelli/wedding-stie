import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import csv from "csv-parser";

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://thespinelliwedding.love/";
const INVITATION_UID = "shaun-manon-2027";
const DEFAULT_SLEEP_MS = 2000;

// Email Subjects
const SUBJECTS = {
  EN: "Pack your bags… you’re going to France 🇫🇷",
  FR: "Oups… Duolingo devient obligatoire 🇿🇦🇦🇺",
};

// Help message
function printUsage() {
  console.log(`
Usage:
  bun scripts/send-emails.js <csv-file-path> [options]

Options:
  --dry-run    Parse CSV and generate links without sending emails
  --help       Show this help message

Environment Variables Required:
  GMAIL_USER           Your Gmail address
  GMAIL_APP_PASSWORD   Your Gmail App Password (not your regular password)
  `);
}

// Simple base64 encode function
function base64Encode(str) {
  return Buffer.from(str, "utf-8").toString("base64");
}

function generateInvitationLink(guestEmail) {
  const encodedEmail = base64Encode(guestEmail);
  return `${BASE_URL}?guest=${encodedEmail}`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find((arg) => !arg.startsWith("--"));
  const isDryRun = args.includes("--dry-run");

  if (!csvPath || args.includes("--help")) {
    printUsage();
    process.exit(1);
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    if (!isDryRun) {
      console.error(
        "Error: GMAIL_USER and GMAIL_APP_PASSWORD environment variables are required.",
      );
      process.exit(1);
    } else {
      console.log(
        "Note: GMAIL environment variables missing, but continuing with dry run...",
      );
    }
  }

  const results = [];
  const guests = [];

  // Read CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (data) => guests.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`\nLoaded ${guests.length} guests from ${csvPath}`);
  if (isDryRun) console.log("--- DRY RUN MODE: No emails will be sent ---\n");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  for (let i = 0; i < guests.length; i++) {
    const { email, language } = guests[i];
    const lang = language?.toUpperCase() === "FR" ? "FR" : "EN";
    const templatePath = path.join(
      __dirname,
      "../templates",
      `template_${lang.toLowerCase()}.html`,
    );

    console.log(`[${i + 1}/${guests.length}] Processing ${email} (${lang})...`);

    try {
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
      }

      const template = fs.readFileSync(templatePath, "utf-8");
      const link = generateInvitationLink(email);
      const htmlBody = template.replace(/{{INVITATION_LINK}}/g, link);
      const subject = SUBJECTS[lang];

      if (isDryRun) {
        console.log(`  Subject: ${subject}`);
        console.log(`  Link: ${link}`);
        console.log(`  Status: SKIPPED (Dry Run)`);
        results.push({ email, lang, status: "SKIPPED", error: "" });
      } else {
        await transporter.sendMail({
          from: `"The Spinelli Wedding" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: subject,
          html: htmlBody,
        });
        console.log(`  Status: SENT`);
        results.push({ email, lang, status: "SENT", error: "" });

        // Sleep between sends to avoid Gmail rate limits
        if (i < guests.length - 1) {
          await sleep(DEFAULT_SLEEP_MS);
        }
      }
    } catch (error) {
      console.error(`  Status: FAILED - ${error.message}`);
      results.push({ email, lang, status: "FAILED", error: error.message });
    }
  }

  // Generate Summary CSV
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const summaryFilename = `summary_${timestamp}.csv`;
  const summaryHeader = "email,language,status,error\n";
  const summaryRows = results
    .map(
      (r) =>
        `${r.email},${r.lang},${r.status},"${r.error.replace(/"/g, '""')}"`,
    )
    .join("\n");

  fs.writeFileSync(summaryFilename, summaryHeader + summaryRows);

  console.log(`\nSummary report generated: ${summaryFilename}`);
  console.log(
    `Successfully processed: ${results.filter((r) => r.status !== "FAILED").length}/${guests.length}`,
  );
}

main().catch(console.error);
