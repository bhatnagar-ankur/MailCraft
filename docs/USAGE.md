# MailCraft API Reference

## `MailCraft` class

### `render(templateId, data, options?)`

Renders a built-in template by ID.

**Pipeline:** Zod validation → MJML compile → Handlebars render → juice CSS inline

```typescript
import { MailCraft } from '@mailcraft/core';

const mc = new MailCraft();
const { html, text } = await mc.render('welcome', {
  firstName:   'Alice',
  companyName: 'Acme Corp',
  role:        'Software Engineer',
  startDate:   'September 15, 2026',
});
```

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| `templateId` | `string` | Built-in template ID (see template list) |
| `data` | `Record<string, unknown>` | Template variables |
| `options.skipInliner` | `boolean` | Skip the juice CSS-inlining pass (default: `false`) |

**Returns:** `Promise<{ html: string; text: string }>`

**Throws:** `Error` if `templateId` is unknown or any required variable is missing.

---

### `validate(templateId, data)`

Validates data against a template's schema without rendering. Use this for pre-flight checks in API request handlers.

```typescript
const result = mc.validate('invoice', requestBody);

if (!result.valid) {
  return res.status(400).json({ errors: result.errors });
}
```

**Returns:** `{ valid: boolean; errors: Array<{ field: string; message: string }> }`

---

### `renderRaw(mjmlSource, data, options?)`

Renders an arbitrary MJML + Handlebars template string. No schema validation is applied — variables that are referenced but not passed produce an empty string (standard Handlebars behaviour).

```typescript
const mjml = `
  <mjml>
    <mj-body>
      <mj-section background-color="#1e40af">
        <mj-column>
          <mj-text color="#ffffff" font-size="24px">{{title}}</mj-text>
          <mj-text color="#dbeafe">{{body}}</mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`;

const { html, text } = await mc.renderRaw(mjml, {
  title: 'Hello from MailCraft',
  body:  'Your custom email body.',
});
```

---

### `list()`

Returns metadata for all 10 built-in templates.

```typescript
const templates = mc.list();
// [{ id, name, description, schema }, ...]
```

---

## Standalone exports

```typescript
import {
  getTemplate,       // getTemplate(id: string): TemplateEntry
  listTemplates,     // listTemplates(): TemplateEntry[]
  validateTemplateData, // validateTemplateData(schema, data): ValidationResult
} from '@mailcraft/core';
```

---

## Template variable types

Template `schema.json` files declare variables with the following type values:

| Type | Zod equivalent | Notes |
|------|---------------|-------|
| `string` | `z.string()` | Default |
| `url` | `z.string()` | Same as string; signals the value should be a URL |
| `number` | `z.number()` | |
| `boolean` | `z.boolean()` | |
| `array` | `z.array(z.unknown())` | Used for invoice/order line items |

Optional variables (`required: false` in schema) use `.optional()` — they may be omitted from the data object entirely.

---

## Advanced: invoice line items

The `invoice` and `order-confirmation` templates expect `items` as an array of objects:

```typescript
await mc.render('invoice', {
  customerName:  'Acme Corp',
  invoiceNumber: 'INV-2026-0042',
  invoiceDate:   'September 10, 2026',
  currency:      'USD',
  items: [
    { description: 'MailCraft Pro License', quantity: 3, unitPrice: '$49.00', total: '$147.00' },
    { description: 'Setup & Onboarding',    quantity: 1, unitPrice: '$200.00', total: '$200.00' },
  ],
  subtotal: '$347.00',
  total:    '$381.70',
  tax:      '$34.70',       // optional
});
```

---

## Advanced: system-alert alertType

The `system-alert` template changes its header colour based on `alertType`:

| `alertType` value | Header colour | Use case |
|-------------------|--------------|---------|
| `info` | `#2563eb` (blue) | Informational notices |
| `warning` | `#d97706` (amber) | Degraded service, quota warnings |
| `critical` | `#dc2626` (red) | Outages, security events |

```typescript
await mc.render('system-alert', {
  firstName:    'Alice',
  alertType:    'critical',     // 'info' | 'warning' | 'critical'
  alertTitle:   'Database failover in progress',
  alertMessage: 'Your primary database is unreachable. A failover to the standby replica is underway.',
  timestamp:    'September 10, 2026 at 03:14 UTC',
  actionText:   'View status page',
  actionLink:   'https://status.example.com',
});
```

---

## Integration examples

### Express.js

```typescript
import express from 'express';
import { MailCraft } from '@mailcraft/core';
import nodemailer from 'nodemailer';

const app = express();
const mc  = new MailCraft();
const transporter = nodemailer.createTransport({ /* your SMTP config */ });

app.post('/send-otp', express.json(), async (req, res) => {
  const validation = mc.validate('otp', req.body);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const { html, text } = await mc.render('otp', req.body);

  await transporter.sendMail({
    from:    '"My App" <no-reply@example.com>',
    to:      req.body.email,
    subject: 'Your one-time password',
    html,
    text,
  });

  res.json({ sent: true });
});
```

### Next.js API route

```typescript
// pages/api/send-welcome.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { MailCraft } from '@mailcraft/core';

const mc = new MailCraft();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { html, text } = await mc.render('welcome', {
    firstName:   req.body.firstName,
    companyName: req.body.company,
    role:        req.body.role,
    startDate:   req.body.startDate,
  });

  // pass html/text to your email provider (SendGrid, Postmark, Resend, etc.)
  res.status(200).json({ ok: true });
}
```

---

## CLI reference

```
Usage: mailcraft [options] [command]

Commands:
  list                     List all built-in templates
  render [options]         Render a template to HTML (or plain text)
  schema <templateId>      Print a template's variable schema as JSON
  help [command]           Display help for a command

render options:
  -t, --template <id>      Template ID (required)
  -d, --data <file>        Path to JSON data file
  --var <key=value>        Inline variable (repeatable)
  -o, --output <file>      Write output to file (default: stdout)
  --text                   Output plain-text version instead of HTML
```

### CLI examples

```bash
# List all templates
npx mailcraft list

# Render with a data file
npx mailcraft render -t invoice -d invoice.json -o out.html

# Render with inline vars
npx mailcraft render -t otp \
  --var firstName=Alice \
  --var otpCode=123456 \
  --var expiryMinutes=10 \
  --var requestedAt="just now"

# Print plain-text version
npx mailcraft render -t welcome -d data.json --text

# Inspect a schema
npx mailcraft schema system-alert
```
