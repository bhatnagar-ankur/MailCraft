# @bhatnagar-ankur/mailcraft-core

> Open-source dynamic email template builder with cross-client compatibility

[![npm](https://img.shields.io/npm/v/@bhatnagar-ankur/mailcraft-core)](https://www.npmjs.com/package/@bhatnagar-ankur/mailcraft-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/bhatnagar-ankur/MailCraft/blob/master/LICENSE)

MailCraft wraps **MJML** (bulletproof table-based HTML) with **Handlebars** (safe variable injection) and ships 10 production-ready templates. Every template is Outlook 2016/2019 compatible out of the box.

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
| `probationPeriod` | string | — | Probation period, e.g. `'3 months'` |
| `ctc` | string | — | Annual CTC / salary |
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
  probationPeriod:    '3 months',
  ctc:                '₹28,00,000 per annum',
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
