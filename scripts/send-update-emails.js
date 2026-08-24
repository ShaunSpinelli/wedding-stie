import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import csv from "csv-parser";
import dotenv from "dotenv";

// Load environment variables from .env if present
dotenv.config();

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://thespinelliwedding.love/";
const DEFAULT_SLEEP_MS = 2000;

// Default Email Subjects
const DEFAULT_SUBJECTS = {
  YES: {
    EN: "9 Months to Go... Are you ready? 🇫🇷",
    FR: "Plus que 9 mois... Êtes-vous prêts ? 🇫🇷",
  },
  NO_RSVP: {
    EN: "9 Months to Go... Have you RSVP’d yet? 🇫🇷",
    FR: "Plus que 9 mois... Avez-vous confirmé votre présence ? 🇫🇷",
  },
};

// Help message
function printUsage() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                     WEDDING UPDATE EMAIL SENDER                            ║
╚════════════════════════════════════════════════════════════════════════════╝

Usage:
  bun scripts/send-update-emails.js <csv-file-path> [options]
  node scripts/send-update-emails.js <csv-file-path> [options]

CSV Columns Supported:
  - email (or Email, EMAIL, mail, guest_email) [Required]
  - language (or Language, lang, Lang): "EN" | "FR" (Default: "EN")
  - rsvp (or status, attendance, template, rsvp_status):
      • Yes / Confirmed: "yes", "y", "attending", "confirmed", "true", "rsvp-yes"
      • Maybe / No / Unconfirmed: "no", "n", "maybe", "not_attending", "no-rsvp", ""
  - name (or Name, guest_name) [Optional]

Options:
  --dry-run                 Simulate sending, validate templates and generate links
  --template=<yes|no-rsvp>  Force template for all guests regardless of CSV value
  --lang=<EN|FR>            Force language for all guests
  --subject=<subject>       Override email subject for all emails
  --subject-yes=<subject>   Override subject for RSVP Yes template
  --subject-no=<subject>    Override subject for No RSVP / Maybe template
  --limit=<number>          Only process the first N guests
  --email=<guest@email.com> Only process a specific guest email from the CSV
  --delay=<milliseconds>    Delay between emails in ms (default: 2000)
  --help                    Show this help message

Environment Variables:
  GMAIL_USER                Your Gmail address (e.g. user@gmail.com)
  GMAIL_APP_PASSWORD        Your Gmail App Password (16 characters)

Examples:
  # Dry-run test on a guest list
  bun scripts/send-update-emails.js guests.csv --dry-run

  # Send to a specific guest only
  bun scripts/send-update-emails.js guests.csv --email=friend@example.com --dry-run

  # Send real emails with custom delay
  bun scripts/send-update-emails.js guests.csv --delay=2500
`);
}

// Base64 encode for personalized invitation links
function base64Encode(str) {
  return Buffer.from(str, "utf-8").toString("base64");
}

function generateInvitationLink(guestEmail) {
  const encodedEmail = base64Encode(guestEmail.trim());
  return `${BASE_URL}?guest=${encodedEmail}`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to determine RSVP template type from CSV value or CLI override
function determineRsvpType(row, cliTemplateOverride) {
  if (cliTemplateOverride) {
    const override = cliTemplateOverride.toLowerCase().trim();
    if (
      ["yes", "y", "rsvp-yes", "resvp-yes", "attending", "confirmed"].includes(
        override,
      )
    ) {
      return "YES";
    }
    return "NO_RSVP";
  }

  // Check possible column names
  const rawValue =
    row.rsvp ||
    row.RSVP ||
    row.status ||
    row.Status ||
    row.attendance ||
    row.Attendance ||
    row.template ||
    row.Template ||
    row.rsvp_status ||
    row.email_template ||
    "";

  const val = String(rawValue).toLowerCase().trim();

  if (
    [
      "yes",
      "y",
      "attending",
      "confirmed",
      "true",
      "1",
      "rsvp-yes",
      "resvp-yes",
      "yes-rsvp",
      "rsvp_yes",
    ].includes(val)
  ) {
    return "YES";
  }

  return "NO_RSVP";
}

// Helper to extract email from various column names
function getGuestEmail(row) {
  return (
    row.email ||
    row.Email ||
    row.EMAIL ||
    row.mail ||
    row.Mail ||
    row.guest_email ||
    ""
  ).trim();
}

// Helper to extract guest name from various column names
function getGuestName(row) {
  return (
    row.name ||
    row.Name ||
    row.guest_name ||
    row.Guest_Name ||
    ""
  ).trim();
}

// Helper to extract language from various column names
function getGuestLanguage(row, cliLangOverride) {
  if (cliLangOverride) {
    return cliLangOverride.toUpperCase().trim() === "FR" ? "FR" : "EN";
  }

  const rawLang =
    row.language || row.Language || row.lang || row.Lang || row.LANG || "EN";

  return String(rawLang).toUpperCase().trim() === "FR" ? "FR" : "EN";
}

// Resolve template file path
function resolveTemplatePath(rsvpType, lang, explicitTemplate) {
  const templatesDir = path.join(__dirname, "../templates");

  // If row has an explicit custom html file specified
  if (
    explicitTemplate &&
    typeof explicitTemplate === "string" &&
    explicitTemplate.endsWith(".html")
  ) {
    const customPath = path.isAbsolute(explicitTemplate)
      ? explicitTemplate
      : path.join(templatesDir, explicitTemplate);
    if (fs.existsSync(customPath)) {
      return customPath;
    }
  }

  const langKey = lang.toLowerCase();

  if (rsvpType === "YES") {
    const preferredPath = path.join(templatesDir, `rsvp_yes_${langKey}.html`);
    if (fs.existsSync(preferredPath)) return preferredPath;

    // Fallbacks
    const aliasPath = path.join(templatesDir, "resvp-yes.html");
    if (fs.existsSync(aliasPath)) return aliasPath;

    const fallbackEn = path.join(templatesDir, "rsvp_yes_en.html");
    if (fs.existsSync(fallbackEn)) return fallbackEn;
  } else {
    const preferredPath = path.join(templatesDir, `no_rsvp_${langKey}.html`);
    if (fs.existsSync(preferredPath)) return preferredPath;

    // Fallbacks
    const aliasPath = path.join(templatesDir, "no-rsvp.html");
    if (fs.existsSync(aliasPath)) return aliasPath;

    const fallbackEn = path.join(templatesDir, "no_rsvp_en.html");
    if (fs.existsSync(fallbackEn)) return fallbackEn;
  }

  throw new Error(`Template not found for RSVP: ${rsvpType}, Lang: ${lang}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    printUsage();
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const csvPath = args.find((arg) => !arg.startsWith("--"));
  const isDryRun = args.includes("--dry-run");

  // Parse CLI flags
  const templateArg = args
    .find((arg) => arg.startsWith("--template="))
    ?.split("=")[1];
  const langArg = args.find((arg) => arg.startsWith("--lang="))?.split("=")[1];
  const customSubject = args
    .find((arg) => arg.startsWith("--subject="))
    ?.split("=")[1];
  const customSubjectYes = args
    .find((arg) => arg.startsWith("--subject-yes="))
    ?.split("=")[1];
  const customSubjectNo = args
    .find((arg) => arg.startsWith("--subject-no="))
    ?.split("=")[1];
  const limitArg = args
    .find((arg) => arg.startsWith("--limit="))
    ?.split("=")[1];
  const emailFilterArg = args
    .find((arg) => arg.startsWith("--email="))
    ?.split("=")[1];
  const delayArg = args
    .find((arg) => arg.startsWith("--delay="))
    ?.split("=")[1];

  const sleepMs = delayArg ? parseInt(delayArg, 10) : DEFAULT_SLEEP_MS;
  const maxLimit = limitArg ? parseInt(limitArg, 10) : Infinity;

  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error(`\n❌ Error: CSV file not found: ${csvPath}`);
    printUsage();
    process.exit(1);
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    if (!isDryRun) {
      console.error(
        "\n❌ Error: GMAIL_USER and GMAIL_APP_PASSWORD environment variables are required.",
      );
      console.error(
        "Please add them to your .env file or environment, or run with --dry-run\n",
      );
      process.exit(1);
    } else {
      console.log(
        "ℹ️  Note: GMAIL credentials missing, but continuing with --dry-run mode...\n",
      );
    }
  }

  // Read CSV rows
  const rawGuests = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (data) => rawGuests.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  // Filter and limit
  let guests = rawGuests.filter((row) => getGuestEmail(row).length > 0);

  if (emailFilterArg) {
    const target = emailFilterArg.toLowerCase().trim();
    guests = guests.filter(
      (row) => getGuestEmail(row).toLowerCase() === target,
    );
    if (guests.length === 0) {
      console.error(
        `\n❌ Error: No guest found matching --email=${emailFilterArg} in ${csvPath}`,
      );
      process.exit(1);
    }
  }

  if (maxLimit < guests.length) {
    guests = guests.slice(0, maxLimit);
  }

  console.log(
    `\n=============================================================`,
  );
  console.log(`  Wedding Update Email Sender`);
  console.log(`=============================================================`);
  console.log(`CSV Source:       ${csvPath}`);
  console.log(`Total Selected:   ${guests.length} guest(s)`);
  console.log(
    `Mode:             ${isDryRun ? "🧪 DRY RUN (No emails sent)" : "🚀 LIVE SEND"}`,
  );
  console.log(`Delay Between:    ${sleepMs}ms`);
  if (templateArg) console.log(`Template Override:${templateArg}`);
  if (langArg) console.log(`Lang Override:    ${langArg}`);
  console.log(
    `=============================================================\n`,
  );

  let transporter = null;
  if (!isDryRun) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  const results = [];

  for (let i = 0; i < guests.length; i++) {
    const row = guests[i];
    const email = getGuestEmail(row);
    const name = getGuestName(row);
    const lang = getGuestLanguage(row, langArg);
    const rsvpType = determineRsvpType(row, templateArg);

    console.log(
      `[${i + 1}/${guests.length}] ${email} (${name || "No name"}) | Lang: ${lang} | RSVP: ${rsvpType}`,
    );

    try {
      const templatePath = resolveTemplatePath(rsvpType, lang, row.template);
      const templateFilename = path.basename(templatePath);
      const rawTemplate = fs.readFileSync(templatePath, "utf-8");

      // Generate personalized link
      const invitationLink = generateInvitationLink(email);

      // Inject personalized link
      let htmlBody = rawTemplate.replace(
        /{{INVITATION_LINK}}/g,
        invitationLink,
      );

      // Optional name replacement if token exists
      if (name) {
        htmlBody = htmlBody
          .replace(/{{GUEST_NAME}}/g, name)
          .replace(/{{NAME}}/g, name);
      }

      // Determine subject
      let subject = DEFAULT_SUBJECTS[rsvpType][lang];
      if (rsvpType === "YES" && customSubjectYes) {
        subject = customSubjectYes;
      } else if (rsvpType === "NO_RSVP" && customSubjectNo) {
        subject = customSubjectNo;
      } else if (customSubject) {
        subject = customSubject;
      } else if (row.subject) {
        subject = row.subject;
      }

      if (isDryRun) {
        console.log(`   📄 Template: ${templateFilename}`);
        console.log(`   ✉️  Subject:  ${subject}`);
        console.log(`   🔗 Link:     ${invitationLink}`);
        console.log(`   ✅ Status:   SKIPPED (Dry Run)\n`);

        results.push({
          email,
          name,
          lang,
          rsvpType,
          template: templateFilename,
          status: "SKIPPED",
          error: "",
        });
      } else {
        await transporter.sendMail({
          from: `"The Spinelli Wedding" <${gmailUser}>`,
          to: email,
          subject: subject,
          html: htmlBody,
        });

        console.log(`   📄 Template: ${templateFilename}`);
        console.log(`   ✉️  Subject:  ${subject}`);
        console.log(`   🚀 Status:   SENT\n`);

        results.push({
          email,
          name,
          lang,
          rsvpType,
          template: templateFilename,
          status: "SENT",
          error: "",
        });

        if (i < guests.length - 1) {
          await sleep(sleepMs);
        }
      }
    } catch (error) {
      console.error(`   ❌ Failed:   ${error.message}\n`);
      results.push({
        email,
        name,
        lang,
        rsvpType,
        template: "N/A",
        status: "FAILED",
        error: error.message,
      });
    }
  }

  // Summary Report
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const summaryFilename = `summary_update_${timestamp}.csv`;
  const summaryPath = path.join(dataDir, summaryFilename);
  const summaryHeader =
    "email,name,language,rsvp_type,template_used,status,error,timestamp\n";
  const now = new Date().toISOString();
  const summaryRows = results
    .map(
      (r) =>
        `"${r.email}","${(r.name || "").replace(/"/g, '""')}","${r.lang}","${r.rsvpType}","${r.template}","${r.status}","${(r.error || "").replace(/"/g, '""')}","${now}"`,
    )
    .join("\n");

  fs.writeFileSync(summaryPath, summaryHeader + summaryRows);

  const sentCount = results.filter((r) => r.status === "SENT").length;
  const skippedCount = results.filter((r) => r.status === "SKIPPED").length;
  const failedCount = results.filter((r) => r.status === "FAILED").length;

  console.log(`=============================================================`);
  console.log(`  Execution Summary`);
  console.log(`=============================================================`);
  console.log(`Total Processed:  ${results.length}`);
  if (isDryRun) {
    console.log(`Dry Run Ready:    ${skippedCount}`);
  } else {
    console.log(`Sent:             ${sentCount}`);
  }
  console.log(`Failed:           ${failedCount}`);
  console.log(`Summary Report:   data/${summaryFilename}`);
  console.log(
    `=============================================================\n`,
  );
}

main().catch((err) => {
  console.error("\n💥 Fatal Error:", err);
  process.exit(1);
});
