# Canva to Bulletproof Email Conversion Guide

This guide documents the two primary workflows for taking Canva designs and converting them into production-ready, cross-client compatible email templates for the Sakeenah wedding platform.

---

## Strategy Comparison

| Approach | Visual Fidelity | Client Compatibility | Setup Effort | Recommended Use |
| :--- | :--- | :--- | :--- | :--- |
| **Strategy A: PDF to High-Res Linked Image** ⭐ | **100% Exact** (all fonts, ligatures & spacing preserved) | **100% Flawless** (no font stripping or layout collapse) | Low / Fast | **Wedding announcements, invitations, save-the-dates** |
| **Strategy B: Raw Canva HTML Refactoring** | 90% (uses fallback fonts in Gmail) | High (requires manual table & button rebuilding) | High / Complex | Newsletters, dynamic data emails |

---

# Strategy A: PDF to High-Res Image Workflow (Recommended)

When exporting from Canva, choose **PDF Print / PDF Standard** instead of Canva HTML. A high-resolution rendered image wrapped in a link guarantees that 100% of recipients see the exact custom typography (*The Seasons*), spacing, and colors across every email client (Gmail, Apple Mail, Outlook, Yahoo).

### Step 1: Export & Unpack the PDF
Export the design from Canva as a PDF (e.g. inside `EMAIL-*.zip`).

```bash
mkdir -p scratch_pdf
unzip -o "/path/to/EMAIL-*.zip" -d scratch_pdf
```

---

### Step 2: Convert PDF to 2x Retina PNG (`pdftoppm`)
Use `pdftoppm` (part of Poppler, installed via `brew install poppler`) to rasterize the PDF pages at **200 DPI**:

```bash
# Convert PDF to high-res PNG
pdftoppm -png -r 200 "scratch_pdf/EMAIL/RSVP ENGLISH.pdf" scratch_pdf/rsvp_yes_en

# Move the resulting page to the public email assets directory
mv scratch_pdf/rsvp_yes_en-1.png public/images/email/update_rsvp_yes_en.png
```

#### Why 200 DPI?
* **Display Width in Email**: 600px max width.
* **Image Resolution Generated**: 1655 × 2339 px (approx 2.7x Retina pixel density).
* **Sharpness**: Razor-sharp text rendering on iPhone Retina, 4K/5K Mac displays.
* **File Size**: Optimized at **~150KB – 180KB**, ensuring rapid mailbox loading without triggering clipping.

---

### Step 3: Embed in Clickable Email Template
Create the template in [`templates/`](file:///Users/shaunspinelli/src/wedding-stie/templates) wrapping the image in `<a href="{{INVITATION_LINK}}">`:

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>The Spinelli's Wedding</title>

  <!-- Preload high-res image -->
  <link rel="preload" as="image" href="https://thespinelliwedding.love/images/email/update_rsvp_yes_en.png" />

  <style type="text/css">
    body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-text-size-adjust: 100% !important;
      -ms-text-size-adjust: 100% !important;
      background-color: #f0f1f5 !important;
    }
    table, td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
      border-collapse: collapse !important;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      display: block;
    }
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  </style>

  <!--[if mso]>
  <noscript>
    <xml>
      <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
        <w:DontUseAdvancedTypographyReadingMail/>
      </w:WordDocument>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; background-color: #f0f1f5; background-image: linear-gradient(#f0f1f5, #f0f1f5);">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f0f1f5; background-image: linear-gradient(#f0f1f5, #f0f1f5); margin: 0; padding: 0; width: 100%;">
    <tbody>
      <tr>
        <td align="center" style="padding: 24px 12px; background-color: #f0f1f5; background-image: linear-gradient(#f0f1f5, #f0f1f5);">
          <!--[if mso]>
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tbody>
              <tr>
                <td>
          <![endif]-->
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" class="email-container" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; background-image: linear-gradient(#ffffff, #ffffff); border-radius: 6px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
            <tbody>
              <tr>
                <td align="center" style="padding: 0; margin: 0;">
                  <a href="{{INVITATION_LINK}}" target="_blank" rel="noopener" style="display: block; text-decoration: none; outline: none; border: 0;">
                    <img src="https://thespinelliwedding.love/images/email/update_rsvp_yes_en.png" width="600" alt="The Spinelli's Wedding - 9 Months to Go" style="display: block; width: 100%; max-width: 600px; height: auto; margin: 0 auto; border: 0; outline: none; text-decoration: none;" />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <!--[if mso]>
                </td>
              </tr>
            </tbody>
          </table>
          <![endif]-->
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
```

---

# Strategy B: Raw Canva HTML Refactoring Workflow

If you need pure HTML text instead of images, follow these refactoring rules to resolve Canva export defects:

### 1. Typography & Webfont Fallbacks
* **Canva Issue**: Canva uses proprietary font `"The Seasons"` without bundling font files.
* **Fix**: Load a Google Font match (**Cormorant Garamond** or **Bodoni Moda**) in `<head>` and use **Georgia** as the universal screen-serif fallback:
  ```css
  font-family: 'Cormorant Garamond', 'The Seasons', Georgia, 'Times New Roman', serif;
  ```

### 2. Flatten Multi-Column Tables
* **Canva Issue**: Fragmented table columns (`width="59.57%"`, `width="11.99%"`) and `&nbsp;` spacers collapse unpredictably.
* **Fix**: Convert to a single-column container table (`max-width: 600px; width: 100%`) with consistent padding (`padding: 36px 36px`).

### 3. Bulletproof Rounded Pill Button
* **Canva Issue**: `border-radius` on `<td>` renders as a sharp rectangle in most email clients.
* **Fix**: Apply `border-radius: 50px` directly on the `<a>` tag with `display: inline-block`:
  ```html
  <a href="{{INVITATION_LINK}}" target="_blank" style="display: inline-block; background-color: #fff9f0; border: 2.5px solid #b52d3c; border-radius: 50px; color: #b52d3c; font-family: Georgia, serif; font-size: 19px; font-weight: bold; padding: 18px 36px; text-decoration: none;">
    RSVP &amp; DISCOVER THE PROGRAM
  </a>
  ```
  *(Include VML `<v:roundrect>` for Windows Outlook compatibility).*

### 4. Dark Mode Anti-Inversion Hack
* **Fix**: Add `<meta name="color-scheme" content="light only">` and apply `background-image: linear-gradient(color, color)` on every background element to prevent Gmail and Apple Mail iOS from inverting colors.

---

## 3. Template Verification & Testing

Always verify templates before sending live campaigns:

1. **Dry-Run Compilation**:
   ```bash
   bun scripts/send-update-emails.js data/test_guests.csv --dry-run
   ```
2. **URL Check**:
   Ensure `{{INVITATION_LINK}}` is replaced properly and image URLs (`https://thespinelliwedding.love/images/email/...`) remain uncorrupted.
3. **Live Test Send**:
   ```bash
   bun scripts/send-update-emails.js data/test_guests.csv --email=your-test@email.com
   ```
