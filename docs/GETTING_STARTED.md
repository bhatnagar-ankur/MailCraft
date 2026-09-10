# Getting Started with MailCraft

MailCraft is an open-source email template library that produces cross-client compatible HTML emails using MJML, Handlebars, and juice.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| pnpm | ≥ 10 (workspace dev) |
| npm/yarn | any (package consumers) |

---

## Installation

### As a package dependency

```bash
npm install @mailcraft/core
# or
yarn add @mailcraft/core
# or
pnpm add @mailcraft/core
```

### Clone for local development

```bash
git clone https://github.com/bhatnagar-ankur/MailCraft.git
cd MailCraft
pnpm install          # install all workspace deps
pnpm build            # compile TypeScript + copy template assets
pnpm test             # run the full test suite (24 tests)
```

---

## Rendering your first email

```typescript
import { MailCraft } from '@mailcraft/core';

const mc = new MailCraft();

const { html, text } = await mc.render('otp', {
  firstName:      'Alice',
  otpCode:        '847291',
  expiryMinutes:  10,
  requestedAt:    'just now',
});

// html → full Outlook-safe HTML document
// text → plain-text fallback for multipart emails
```

Send `html` as the HTML part and `text` as the plain-text part of your transactional email.

---

## Using the CLI

The CLI ships with the package — no extra install needed.

```bash
# List all built-in templates
npx mailcraft list

# Render a template with inline variables
npx mailcraft render -t otp --var firstName=Alice --var otpCode=847291 \
  --var expiryMinutes=10 --var requestedAt="just now" -o out.html

# Render using a JSON data file
npx mailcraft render -t invoice -d invoice-data.json -o invoice.html

# Print a template's variable schema
npx mailcraft schema otp
```

### Example data file (`otp-data.json`)

```json
{
  "firstName":     "Alice",
  "otpCode":       "847291",
  "expiryMinutes": 10,
  "requestedAt":   "September 10, 2026 at 14:32 UTC"
}
```

---

## Available templates

| ID | Name | Required variables |
|----|------|--------------------|
| `welcome` | Welcome Email | firstName, companyName, role, startDate |
| `otp` | One-Time Password | firstName, otpCode, expiryMinutes, requestedAt |
| `password-reset` | Password Reset | firstName, resetLink, expiryHours |
| `email-verification` | Email Verification | firstName, verificationLink, expiryHours, productName |
| `invoice` | Invoice | customerName, invoiceNumber, invoiceDate, currency, items, subtotal, total |
| `order-confirmation` | Order Confirmation | customerName, orderNumber, estimatedDelivery, items, subtotal, shipping, total, deliveryAddress |
| `event-invitation` | Event Invitation | firstName, eventName, eventDate, eventTime, timezone, location, rsvpLink |
| `subscription` | Subscription Confirmation | firstName, planName, startDate, manageLink |
| `system-alert` | System Alert | firstName, alertType, alertTitle, alertMessage, timestamp |
| `account-warning` | Account Warning | firstName, reason, actionRequired, supportLink, appealLink |

Run `npx mailcraft schema <id>` for the full schema including optional variables.

---

## Rendered samples

Pre-rendered HTML samples for every template are in [`docs/samples/`](./samples/). Open any file in a browser to preview the email layout.

| Template | Sample |
|----------|--------|
| Welcome | [samples/welcome.html](./samples/welcome.html) |
| OTP | [samples/otp.html](./samples/otp.html) |
| Password Reset | [samples/password-reset.html](./samples/password-reset.html) |
| Email Verification | [samples/email-verification.html](./samples/email-verification.html) |
| Invoice | [samples/invoice.html](./samples/invoice.html) |
| Order Confirmation | [samples/order-confirmation.html](./samples/order-confirmation.html) |
| Event Invitation | [samples/event-invitation.html](./samples/event-invitation.html) |
| Subscription | [samples/subscription.html](./samples/subscription.html) |
| System Alert | [samples/system-alert.html](./samples/system-alert.html) |
| Account Warning | [samples/account-warning.html](./samples/account-warning.html) |

---

## Validating without rendering

```typescript
const result = mc.validate('invoice', data);
if (!result.valid) {
  for (const err of result.errors) {
    console.error(`${err.field}: ${err.message}`);
  }
}
```

---

## Bring your own template

```typescript
const mjmlSource = `
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>Hello, {{name}}!</mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`;

const { html } = await mc.renderRaw(mjmlSource, { name: 'World' });
```

No schema validation is applied to `renderRaw` — all variable injection errors surface as Handlebars warnings at render time.

---

## Email client compatibility

| Client | HTML | Dark mode | Notes |
|--------|------|-----------|-------|
| Gmail (web) | ✅ | ✅ | |
| Apple Mail (macOS / iOS) | ✅ | ✅ | |
| Outlook 2016 / 2019 (Windows) | ✅ | ⚠️ | Auto-invert only; no `prefers-color-scheme` |
| Classic Outlook desktop (Microsoft 365) | ✅ | ⚠️ | Word rendering engine — same limits as 2016/2019 |
| New Outlook desktop (Microsoft 365, 2024+) | ✅ | ✅ | Edge/WebView2 renderer; modern CSS support |
| Outlook on the web / OWA (office365.com) | ✅ | ✅ | Modern browser renderer |
| Yahoo Mail | ✅ | — | |
| Samsung Email | ✅ | — | |
| Thunderbird | ✅ | ✅ | |

---

## Next steps

- [USAGE.md](./USAGE.md) — detailed API reference and advanced usage patterns
- [CONTRIBUTING.md](../CONTRIBUTING.md) — how to add or modify templates
- [Template gallery (live docs)](https://claude.ai/code/artifact/ab594c49-216f-443b-a1a6-cb9fef4b7078)
