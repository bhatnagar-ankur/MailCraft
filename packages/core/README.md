# @bhatnagar-ankur/mailcraft-core

> Open-source dynamic email template builder with cross-client compatibility

[![npm](https://img.shields.io/npm/v/@bhatnagar-ankur/mailcraft-core)](https://www.npmjs.com/package/@bhatnagar-ankur/mailcraft-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/bhatnagar-ankur/MailCraft/blob/master/LICENSE)

MailCraft wraps **MJML** (bulletproof table-based HTML) with **Handlebars** (safe variable injection) and ships 10 production-ready templates. Every template is Outlook 2016/2019 compatible out of the box.

---

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Previewing templates](#previewing-templates)
- [Testing templates locally](#testing-templates-locally)
- [Typed data interfaces](#typed-data-interfaces)
- [API](#api)
- [Templates](#templates)
  - [welcome](#welcome--hr-welcome--onboarding-email)
  - [otp](#otp--otp--security-code)
  - [password-reset](#password-reset--password-reset)
  - [email-verification](#email-verification--email-verification--account-activation)
  - [invoice](#invoice--invoice--payment-receipt)
  - [order-confirmation](#order-confirmation--order-confirmation)
  - [event-invitation](#event-invitation--event-invitation)
  - [subscription](#subscription--subscription-confirmation)
  - [system-alert](#system-alert--system-alert)
  - [account-warning](#account-warning--account-warning)
- [Sending emails from Node.js](#sending-emails-from-nodejs)
- [Integrating with non-Node backends](#integrating-with-non-node-backends-net--java--python--ruby--php)
- [Email client compatibility](#email-client-compatibility)

---

## Installation

```bash
npm install @bhatnagar-ankur/mailcraft-core
```

---

## Quick start

```typescript
import { MailCraft } from '@bhatnagar-ankur/mailcraft-core';
import type { OtpData } from '@bhatnagar-ankur/mailcraft-core';

const mc = new MailCraft();

const data: OtpData = {
  firstName:     'Ankur',
  otpCode:       '847291',
  expiryMinutes: 10,
  requestedAt:   'Sept 14, 2026, 10:00 AM UTC',
};

const { html, text } = await mc.render('otp', data);

// html → production-ready inlined HTML, send with any mailer
// text → plain-text fallback
```

---

## Previewing templates

**CLI — open the built-in preview gallery in your browser:**

```bash
# Open the gallery (all 10 templates, tabbed viewer)
npx @bhatnagar-ankur/mailcraft-core preview

# Jump straight to a specific template
npx @bhatnagar-ankur/mailcraft-core preview otp
npx @bhatnagar-ankur/mailcraft-core preview invoice
```

**Code — render to a local file and open it:**

```typescript
import { MailCraft } from '@bhatnagar-ankur/mailcraft-core';
import { writeFileSync } from 'fs';

const mc   = new MailCraft();
const { html } = await mc.render('welcome', { /* your data */ });

writeFileSync('preview.html', html);
// open preview.html in your browser
```

**Render CLI:**

```bash
npx @bhatnagar-ankur/mailcraft-core render --template otp --data data.json --output preview.html
```

---

## Testing templates locally

Three ways to verify a template renders correctly before integrating it.

### 1 — CLI render to file (quickest)

Write a JSON file with your template data, render to HTML, open in a browser:

```bash
# 1. create your data file
echo '{"firstName":"Ankur","otpCode":"847291","expiryMinutes":10,"requestedAt":"Sept 14 2026"}' > data.json

# 2. render to an HTML file
npx @bhatnagar-ankur/mailcraft-core render --template otp --data data.json --output preview.html

# 3. open in your default browser
#    macOS
open preview.html
#    Windows
start preview.html
#    Linux
xdg-open preview.html
```

### 2 — Built-in preview gallery

Renders all 10 templates with realistic sample data in a dark-themed tabbed viewer:

```bash
# open the full gallery
npx @bhatnagar-ankur/mailcraft-core preview

# jump straight to one template
npx @bhatnagar-ankur/mailcraft-core preview welcome
npx @bhatnagar-ankur/mailcraft-core preview invoice
```

### 3 — Node.js script

Write a small script and run it with `ts-node` / `tsx`:

```typescript
// test-render.ts
import { MailCraft } from '@bhatnagar-ankur/mailcraft-core';
import { writeFileSync } from 'fs';

const mc = new MailCraft();

const { html } = await mc.render('otp', {
  firstName:     'Ankur',
  otpCode:       '847291',
  expiryMinutes: 10,
  requestedAt:   'Sept 14, 2026, 10:00 AM UTC',
});

writeFileSync('preview.html', html);
console.log('Written to preview.html');
```

```bash
npx tsx test-render.ts
open preview.html   # macOS  |  start preview.html (Windows)
```

### Validate data without rendering

Use `mc.validate()` to check required fields and types before rendering:

```typescript
const mc = new MailCraft();

const result = mc.validate('otp', { firstName: 'Ankur' }); // missing required fields
console.log(result.valid);  // false
console.log(result.errors); // [{ field: 'otpCode', message: 'Required' }, ...]
```

### Inspect a template's schema

```bash
npx @bhatnagar-ankur/mailcraft-core schema otp
```

```bash
# list all template IDs
npx @bhatnagar-ankur/mailcraft-core list
```

---

## Typed data interfaces

Import a typed interface for each template to get full autocomplete and compile-time checking:

```typescript
import type {
  WelcomeData,
  OtpData,
  PasswordResetData,
  EmailVerificationData,
  InvoiceData,
  OrderConfirmationData,
  EventInvitationData,
  SubscriptionData,
  SystemAlertData,
  AccountWarningData,
} from '@bhatnagar-ankur/mailcraft-core';
```

Use them when constructing your data objects:

```typescript
import { MailCraft } from '@bhatnagar-ankur/mailcraft-core';
import type { InvoiceData } from '@bhatnagar-ankur/mailcraft-core';

const mc = new MailCraft();

const data: InvoiceData = {
  customerName:  'Acme Corp',
  invoiceNumber: 'INV-2026-042',
  invoiceDate:   'September 14, 2026',
  currency:      'USD',
  items: [
    { description: 'Pro License', quantity: '1', unitPrice: '$99.00', total: '$99.00' },
  ],
  subtotal: '$99.00',
  total:    '$99.00',
};

const { html } = await mc.render('invoice', data);
```

---

## API

### `mc.render(templateId, data, options?)`

Renders a built-in template. Throws if a required variable is missing.

| Parameter | Type | Description |
|---|---|---|
| `templateId` | `string` | Template ID (see list below) |
| `data` | `Record<string, unknown>` | Template variables |
| `options.skipInliner` | `boolean` | Skip juice CSS-inlining pass (default: `false`) |

**Returns:** `Promise<{ html: string; text: string }>`

### `mc.validate(templateId, data)`

Validates data against the template schema without rendering. Use for API pre-checks.

```typescript
const result = mc.validate('invoice', req.body);
if (!result.valid) return res.status(400).json({ errors: result.errors });
```

### `mc.renderRaw(mjmlSource, data, options?)`

Renders an arbitrary MJML + Handlebars string. No schema validation applied.

```typescript
const { html } = await mc.renderRaw(myMjmlTemplate, { name: 'World' });
```

### `mc.list()`

Returns metadata for all built-in templates.

```typescript
mc.list().forEach(t => console.log(t.id, '—', t.name));
```

---

## Templates

### `welcome` — HR Welcome / Onboarding Email

New employee joining letter with full details in a structured 4-section table: profile, role, employment details, and first day info.

| Variable | Type | Required | Description |
|---|---|:---:|---|
| `firstName` | string | ✅ | Employee's first name |
| `lastName` | string | ✅ | Employee's last name |
| `workEmail` | string | ✅ | Corporate work email address |
| `companyName` | string | ✅ | Company name |
| `role` | string | ✅ | Job title |
| `startDate` | string | ✅ | First day date |
| `employeeId` | string | — | Employee ID / staff number |
| `personalEmail` | string | — | Personal email address |
| `department` | string | — | Department name |
| `team` | string | — | Team within the department |
| `managerName` | string | — | Reporting manager's name |
| `workLocation` | string | — | Office location or `'Remote'` |
| `previousExperience` | string | — | Prior experience summary |
| `employmentType` | string | — | `'Full-time'`, `'Contract'`, etc. |
| `workingHours` | string | — | Working hours, e.g. `'9:30 AM – 6:30 PM IST'` |
| `reportingLocation` | string | — | Where to report on day 1 |
| `reportingTime` | string | — | Time to report on day 1 |
| `hrEmail` | string | — | HR contact email |
| `itSetupLink` | url | — | IT setup guide link |
| `onboardingNote` | string | — | Custom highlighted note from HR |
| `portalLink` | url | — | Onboarding portal link |
| `logoUrl` | url | — | Company logo URL |

```typescript
import type { WelcomeData } from '@bhatnagar-ankur/mailcraft-core';

const data: WelcomeData = {
  firstName:          'Ankur',
  lastName:           'Bhatnagar',
  workEmail:          'ankur.bhatnagar@acmecorp.com',
  companyName:        'Acme Corp',
  role:               'Senior Software Engineer',
  startDate:          'September 15, 2026',
  employeeId:         'EMP-2026-0142',
  department:         'Engineering',
  team:               'Platform & Infrastructure',
  managerName:        'Jane Smith',
  workLocation:       'Bangalore HQ (Hybrid)',
  previousExperience: '6 years — Backend Engineering at Flipkart & Razorpay',
  employmentType:     'Full-time, Permanent',
  workingHours:       '9:30 AM – 6:30 PM IST',
  reportingLocation:  'Floor 5, Acme HQ — 42 MG Road, Bengaluru',
  reportingTime:      '9:30 AM',
  hrEmail:            'hr@acmecorp.com',
  itSetupLink:        'https://it.acmecorp.com/onboarding',
  onboardingNote:     'Please carry a government-issued photo ID on your first day.',
  portalLink:         'https://portal.acmecorp.com/onboarding',
};

await mc.render('welcome', data);
```

---

### `otp` — OTP / Security Code

Two-factor authentication or login verification code email.

| Variable | Type | Required | Description |
|---|---|:---:|---|
| `firstName` | string | ✅ | Recipient's first name |
| `otpCode` | string | ✅ | The one-time passcode, e.g. `'847291'` |
| `expiryMinutes` | number | ✅ | Minutes until the code expires |
| `requestedAt` | string | ✅ | Timestamp the code was requested |
| `supportLink` | url | — | Support page URL shown if recipient didn't request the code |

```typescript
await mc.render('otp', {
  firstName:     'Ankur',
  otpCode:       '847291',
  expiryMinutes: 10,
  requestedAt:   'Sept 14, 2026, 10:34 AM UTC',
});
```

---

### `password-reset` — Password Reset

Forgot password flow with secure reset link and security context.

| Variable | Type | Required | Description |
|---|---|:---:|---|
| `firstName` | string | ✅ | Recipient's first name |
| `resetLink` | url | ✅ | Secure password reset URL |
| `expiryHours` | number | ✅ | Hours until the reset link expires |
| `ipAddress` | string | — | IP address the request originated from |
| `deviceInfo` | string | — | Device/browser info, e.g. `'Chrome on macOS'` |

```typescript
await mc.render('password-reset', {
  firstName:   'Priya',
  resetLink:   'https://app.example.com/reset?token=abc123',
  expiryHours: 24,
  ipAddress:   '103.21.244.0',
  deviceInfo:  'Chrome on Windows',
});
```

---

### `email-verification` — Email Verification / Account Activation

New account signup email address confirmation.

| Variable | Type | Required | Description |
|---|---|:---:|---|
| `firstName` | string | ✅ | Recipient's first name |
| `verificationLink` | url | ✅ | Unique email verification URL |
| `expiryHours` | number | ✅ | Hours until the link expires |
| `productName` | string | ✅ | Product or app name |

```typescript
await mc.render('email-verification', {
  firstName:        'Rahul',
  verificationLink: 'https://app.example.com/verify?token=xyz',
  expiryHours:      48,
  productName:      'MyApp',
});
```

---

### `invoice` — Invoice / Payment Receipt

E-commerce or SaaS billing invoice with line items.

| Variable | Type | Required | Description |
|---|---|:---:|---|
| `customerName` | string | ✅ | Customer's full name or company |
| `invoiceNumber` | string | ✅ | Invoice number, e.g. `'INV-2026-001'` |
| `invoiceDate` | string | ✅ | Invoice issue date |
| `currency` | string | ✅ | Currency code or symbol, e.g. `'USD'` |
| `items` | array | ✅ | Array of line items (see below) |
| `subtotal` | string | ✅ | Subtotal before tax, formatted |
| `total` | string | ✅ | Grand total, formatted |
| `dueDate` | string | — | Payment due date |
| `tax` | string | — | Tax amount, formatted |
| `downloadLink` | url | — | URL to download the PDF invoice |

Each item in `items`: `{ description, quantity, unitPrice, total }`

```typescript
await mc.render('invoice', {
  customerName:  'Acme Corp',
  invoiceNumber: 'INV-2026-042',
  invoiceDate:   'September 14, 2026',
  currency:      'USD',
  items: [
    { description: 'Pro License (3 seats)', quantity: '3', unitPrice: '$49.00', total: '$147.00' },
    { description: 'Setup & Onboarding',    quantity: '1', unitPrice: '$200.00', total: '$200.00' },
  ],
  subtotal: '$347.00',
  tax:      '$34.70',
  total:    '$381.70',
});
```

---

### `order-confirmation` — Order Confirmation

E-commerce post-purchase confirmation with product list and delivery info.

| Variable | Type | Required | Description |
|---|---|:---:|---|
| `customerName` | string | ✅ | Customer's name |
| `orderNumber` | string | ✅ | Order reference number |
| `estimatedDelivery` | string | ✅ | Estimated delivery date range |
| `items` | array | ✅ | Array of ordered products (see below) |
| `subtotal` | string | ✅ | Order subtotal |
| `shipping` | string | ✅ | Shipping cost |
| `total` | string | ✅ | Order total |
| `deliveryAddress` | string | ✅ | Delivery address |
| `trackingLink` | url | — | Order tracking URL |

Each item in `items`: `{ name, quantity, price, imageUrl? }`

```typescript
await mc.render('order-confirmation', {
  customerName:      'Ankur Bhatnagar',
  orderNumber:       'ORD-2026-8821',
  estimatedDelivery: 'September 17–19, 2026',
  items: [
    { name: 'Mechanical Keyboard', quantity: '1', price: '$129.00' },
    { name: 'USB-C Hub',           quantity: '2', price: '$45.00' },
  ],
  subtotal:        '$219.00',
  shipping:        '$0.00',
  total:           '$219.00',
  deliveryAddress: '42 MG Road, Bengaluru 560001',
  trackingLink:    'https://track.example.com/ORD-2026-8821',
});
```

---

### `event-invitation` — Event Invitation

Webinar, team event, or conference invitation with RSVP CTA.

| Variable | Type | Required | Description |
|---|---|:---:|---|
| `firstName` | string | ✅ | Recipient's first name |
| `eventName` | string | ✅ | Name of the event |
| `eventDate` | string | ✅ | Event date, e.g. `'October 15, 2026'` |
| `eventTime` | string | ✅ | Start time, e.g. `'2:00 PM'` |
| `timezone` | string | ✅ | Timezone, e.g. `'IST'` |
| `location` | string | ✅ | Venue or `'Online via Zoom'` |
| `rsvpLink` | url | ✅ | RSVP confirmation URL |
| `description` | string | — | Short event description |
| `calendarLink` | url | — | Add-to-calendar URL |

```typescript
await mc.render('event-invitation', {
  firstName: 'Priya',
  eventName: 'MailCraft Launch Webinar',
  eventDate: 'October 15, 2026',
  eventTime: '3:00 PM',
  timezone:  'IST',
  location:  'Online via Zoom',
  rsvpLink:  'https://events.example.com/rsvp/mailcraft',
});
```

---

### `subscription` — Subscription / Plan Confirmation

SaaS plan activation or newsletter subscription confirmation.

| Variable | Type | Required | Description |
|---|---|:---:|---|
| `firstName` | string | ✅ | Recipient's first name |
| `planName` | string | ✅ | Plan name, e.g. `'Pro'` |
| `startDate` | string | ✅ | Subscription start date |
| `manageLink` | url | ✅ | URL to manage subscription settings |
| `nextBillingDate` | string | — | Next billing date |
| `amount` | string | — | Charged amount, formatted |
| `currency` | string | — | Currency code or symbol |
| `featuresIncluded` | string[] | — | Array of feature description strings |

```typescript
await mc.render('subscription', {
  firstName:       'Ankur',
  planName:        'Pro',
  startDate:       'September 14, 2026',
  nextBillingDate: 'October 14, 2026',
  amount:          '$49.00',
  currency:        'USD',
  featuresIncluded: [
    'Unlimited template renders',
    'Priority email support',
    'Custom MJML templates',
  ],
  manageLink: 'https://app.example.com/billing',
});
```

---

### `system-alert` — System Alert / Notification

Security alert or service status notification with colour-coded severity.

| Variable | Type | Required | Description |
|---|---|:---:|---|
| `firstName` | string | ✅ | Recipient's first name |
| `alertType` | `'info'` \| `'warning'` \| `'critical'` | ✅ | Severity level (controls header colour) |
| `alertTitle` | string | ✅ | Short alert heading |
| `alertMessage` | string | ✅ | Full alert description |
| `timestamp` | string | ✅ | Alert timestamp |
| `actionText` | string | — | CTA button label |
| `actionLink` | url | — | CTA button URL |
| `supportLink` | url | — | Support page URL |

`alertType` values: `info` (blue) · `warning` (amber) · `critical` (red)

```typescript
await mc.render('system-alert', {
  firstName:    'Ankur',
  alertType:    'critical',
  alertTitle:   'Unusual sign-in detected',
  alertMessage: 'A sign-in from a new device was detected on your account.',
  timestamp:    'September 14, 2026 at 09:45 UTC',
  actionText:   'Secure my account',
  actionLink:   'https://app.example.com/security',
});
```

---

### `account-warning` — Account Warning / Suspension Notice

Policy violation warning or account-at-risk notice with required action box.

| Variable | Type | Required | Description |
|---|---|:---:|---|
| `firstName` | string | ✅ | Recipient's first name |
| `reason` | string | ✅ | Reason for the warning |
| `actionRequired` | string | ✅ | Specific action the user must take |
| `supportLink` | url | ✅ | Support contact URL |
| `deadline` | string | — | Deadline for the required action |
| `appealLink` | url | — | Appeal submission URL |

```typescript
await mc.render('account-warning', {
  firstName:      'Rahul',
  reason:         'Repeated violations of our community guidelines',
  actionRequired: 'Review and accept the updated Terms of Service',
  supportLink:    'https://support.example.com',
  deadline:       'September 21, 2026',
  appealLink:     'https://app.example.com/appeal',
});
```

---

## Sending emails from Node.js

MailCraft renders HTML. Pair it with any mailer to send it.

### Nodemailer (any SMTP server)

```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer';
import { MailCraft } from '@bhatnagar-ankur/mailcraft-core';

const mc = new MailCraft();
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',   // or your SMTP host
  port: 587,
  auth: { user: 'you@gmail.com', pass: 'your-app-password' },
});

const { html, text } = await mc.render('otp', {
  firstName: 'Ankur', otpCode: '847291', expiryMinutes: 10,
  requestedAt: new Date().toUTCString(),
});

await transporter.sendMail({
  from: '"My App" <no-reply@myapp.com>',
  to: 'user@example.com',
  subject: 'Your one-time password',
  html,
  text,
});
```

### Resend (modern, free tier)

```bash
npm install resend
```

```typescript
import { Resend } from 'resend';
import { MailCraft } from '@bhatnagar-ankur/mailcraft-core';

const resend = new Resend('re_your_api_key');
const mc = new MailCraft();

const { html, text } = await mc.render('welcome', {
  firstName: 'Ankur', lastName: 'Bhatnagar',
  workEmail: 'ankur@acme.com', companyName: 'Acme Corp',
  role: 'Senior Engineer', startDate: 'September 15, 2026',
});

await resend.emails.send({
  from: 'hr@acme.com',
  to: 'ankur@example.com',
  subject: 'Welcome to Acme Corp!',
  html,
  text,
});
```

### SendGrid

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';
import { MailCraft } from '@bhatnagar-ankur/mailcraft-core';

sgMail.setApiKey('SG.your_api_key');
const mc = new MailCraft();

const { html, text } = await mc.render('password-reset', {
  firstName: 'Ankur', resetLink: 'https://app.com/reset?token=abc',
  expiryHours: 24,
});

await sgMail.send({
  from: 'no-reply@myapp.com',
  to: 'user@example.com',
  subject: 'Reset your password',
  html,
  text: text ?? '',
});
```

### AWS SES

```bash
npm install @aws-sdk/client-ses
```

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { MailCraft } from '@bhatnagar-ankur/mailcraft-core';

const ses = new SESClient({ region: 'ap-south-1' });
const mc  = new MailCraft();

const { html, text } = await mc.render('invoice', { /* your data */ });

await ses.send(new SendEmailCommand({
  Source: 'billing@myapp.com',
  Destination: { ToAddresses: ['customer@example.com'] },
  Message: {
    Subject: { Data: 'Your invoice' },
    Body: {
      Html: { Data: html },
      Text: { Data: text ?? '' },
    },
  },
}));
```

---

## Integrating with non-Node backends (.NET · Java · Python · Ruby · PHP)

MailCraft is a Node.js package. For other language backends use one of two patterns:

### Pattern A — HTTP microservice (recommended for production)

Start a lightweight REST server that any backend can call over HTTP:

```bash
# install once
npm install -g @bhatnagar-ankur/mailcraft-core

# start the server (keep it running as a sidecar / service)
mailcraft serve --port 3001
```

The server exposes three endpoints:

| Method | Path | Description |
|---|---|---|
| `POST` | `/render` | Render a template — body: `{ templateId, data }` |
| `GET` | `/templates` | List all templates and their schemas |
| `GET` | `/templates/:id` | Schema for one template |
| `GET` | `/health` | Health check |

You can also **mount it inside your own Express app**:

```typescript
import express from 'express';
import { createMailCraftRouter } from '@bhatnagar-ankur/mailcraft-core';

const app = express();
app.use('/email', createMailCraftRouter());  // POST /email/render, GET /email/templates
app.listen(3000);
```

#### Request / response shape

```jsonc
// POST /render
{
  "templateId": "otp",
  "data": {
    "firstName": "Ankur",
    "otpCode": "847291",
    "expiryMinutes": 10,
    "requestedAt": "Sept 14, 2026 10:00 AM UTC"
  }
}

// Response 200
{ "html": "<!doctype html>...", "text": "Your OTP is 847291..." }

// Response 404 — unknown templateId
{ "error": "Template \"xyz\" not found." }

// Response 422 — missing required field
{ "error": "Template \"otp\" data validation failed:\n  • otpCode: Required" }
```

#### C# (.NET)

```csharp
using System.Net.Http.Json;

var client = new HttpClient { BaseAddress = new Uri("http://localhost:3001") };

var response = await client.PostAsJsonAsync("/render", new {
    templateId = "otp",
    data = new {
        firstName     = "Ankur",
        otpCode       = "847291",
        expiryMinutes = 10,
        requestedAt   = "Sept 14, 2026 10:00 AM UTC"
    }
});

response.EnsureSuccessStatusCode();
var result = await response.Content.ReadFromJsonAsync<RenderResult>();

// Send result.Html with any .NET mailer (MailKit, SendGrid SDK, etc.)
record RenderResult(string Html, string? Text);
```

#### Java

```java
import java.net.http.*;
import java.net.URI;

var body = """
    {
      "templateId": "otp",
      "data": {
        "firstName": "Ankur",
        "otpCode": "847291",
        "expiryMinutes": 10,
        "requestedAt": "Sept 14, 2026 10:00 AM UTC"
      }
    }
    """;

var request = HttpRequest.newBuilder()
    .uri(URI.create("http://localhost:3001/render"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

var response = HttpClient.newHttpClient()
    .send(request, HttpResponse.BodyHandlers.ofString());

// parse response.body() as JSON to get html and text fields
```

#### Python

```python
import requests

resp = requests.post("http://localhost:3001/render", json={
    "templateId": "otp",
    "data": {
        "firstName":     "Ankur",
        "otpCode":       "847291",
        "expiryMinutes": 10,
        "requestedAt":   "Sept 14, 2026 10:00 AM UTC",
    },
})
resp.raise_for_status()
result = resp.json()

html = result["html"]   # pass to Django/Flask email, smtplib, etc.
text = result["text"]
```

#### Ruby

```ruby
require 'net/http'
require 'json'

uri  = URI('http://localhost:3001/render')
body = {
  templateId: 'otp',
  data: {
    firstName:     'Ankur',
    otpCode:       '847291',
    expiryMinutes: 10,
    requestedAt:   'Sept 14, 2026 10:00 AM UTC',
  }
}.to_json

res = Net::HTTP.post(uri, body, 'Content-Type' => 'application/json')
result = JSON.parse(res.body)

html = result['html']   # pass to ActionMailer or Mail gem
text = result['text']
```

#### PHP

```php
$payload = json_encode([
    'templateId' => 'otp',
    'data'       => [
        'firstName'     => 'Ankur',
        'otpCode'       => '847291',
        'expiryMinutes' => 10,
        'requestedAt'   => 'Sept 14, 2026 10:00 AM UTC',
    ],
]);

$ch = curl_init('http://localhost:3001/render');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
]);

$result = json_decode(curl_exec($ch), true);
curl_close($ch);

$html = $result['html'];  // pass to PHPMailer, SwiftMailer, etc.
$text = $result['text'];
```

---

### Pattern B — CLI subprocess

Any backend can shell out to the `mailcraft render` CLI. Write template data to a JSON file, run the CLI, read the output file.

```bash
# Render to a file
mailcraft render --template otp --data data.json --output email.html

# Or pipe stdout
mailcraft render --template otp --data data.json > email.html
```

#### Python subprocess example

```python
import subprocess, json, tempfile, os

data = {
    "firstName": "Ankur", "otpCode": "847291",
    "expiryMinutes": 10,  "requestedAt": "Sept 14, 2026 10:00 AM"
}

with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
    json.dump(data, f)
    data_file = f.name

result = subprocess.run(
    ['mailcraft', 'render', '--template', 'otp', '--data', data_file],
    capture_output=True, text=True, check=True
)
html = result.stdout
os.unlink(data_file)
```

> **Pattern A is preferred** for web applications — it avoids process-spawn overhead on every request. Use Pattern B for batch jobs, scripts, or one-off rendering pipelines.

---

## Email client compatibility

| Feature | Gmail | Apple Mail | Outlook 2016/2019 | Outlook on the web |
|---|:---:|:---:|:---:|:---:|
| MJML table layouts | ✅ | ✅ | ✅ | ✅ |
| Inline styles | ✅ | ✅ | ✅ | ✅ |
| VML buttons (rounded) | ✅ | ✅ | ✅ | ✅ |
| Web fonts | ✅ | ✅ | ⚠️ Falls back | ✅ |
| Dark mode | ✅ | ✅ | ⚠️ Auto-invert | ✅ |

---

## License

[MIT](https://github.com/bhatnagar-ankur/MailCraft/blob/master/LICENSE) © 2026 Ankur Bhatnagar
