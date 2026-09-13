# @bhatnagar-ankur/mailcraft-core

> Open-source dynamic email template builder with cross-client compatibility

[![npm](https://img.shields.io/npm/v/@bhatnagar-ankur/mailcraft-core)](https://www.npmjs.com/package/@bhatnagar-ankur/mailcraft-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/bhatnagar-ankur/MailCraft/blob/master/LICENSE)

MailCraft solves the hardest problem in frontend development: making dynamic emails look identical across every email client — from modern Gmail to Outlook 2016 on a corporate Windows machine.

It wraps **MJML** (for bulletproof table-based HTML) with **Handlebars** (for safe variable injection) and ships 10 production-ready templates you can use in minutes.

---

## Quick start

```bash
npm install @bhatnagar-ankur/mailcraft-core
```

```typescript
import { MailCraft } from '@bhatnagar-ankur/mailcraft-core';

const mc = new MailCraft();

const { html, text } = await mc.render('otp', {
  firstName: 'Ankur',
  otpCode: '847291',
  expiryMinutes: 10,
  requestedAt: 'Sept 9, 2026, 10:34 AM UTC',
});

// html → production-ready, inlined HTML — send it with any mailer
```

---

## CLI

```bash
# List all available templates
npx @bhatnagar-ankur/mailcraft-core list

# Render with a JSON data file
npx @bhatnagar-ankur/mailcraft-core render --template otp --data ./data.json --output ./out.html

# Print a template's variable schema
npx @bhatnagar-ankur/mailcraft-core schema invoice
```

---

## Built-in templates

| ID | Name | Use case |
|---|---|---|
| `welcome` | HR Welcome / Onboarding | New hire welcome, client onboarding |
| `otp` | OTP / Security Code | Two-factor authentication |
| `password-reset` | Password Reset | Forgot password flow |
| `email-verification` | Email Verification | Account activation |
| `invoice` | Invoice / Receipt | SaaS billing, e-commerce |
| `order-confirmation` | Order Confirmation | Post-purchase confirmation |
| `event-invitation` | Event Invitation | Webinar, team event |
| `subscription` | Subscription Confirmation | Plan activation |
| `system-alert` | System Alert | Security alert, status notification |
| `account-warning` | Account Warning | Policy violation, suspension notice |

---

## API

### `mc.render(templateId, data, options?)`

Renders a built-in template. Pipeline: Zod validation → MJML compile → Handlebars render → juice CSS inline.

```typescript
const { html, text } = await mc.render('welcome', {
  firstName: 'Ankur',
  companyName: 'Acme Corp',
  role: 'Senior Engineer',
  startDate: 'Sept 15, 2026',
});
```

### `mc.renderRaw(mjmlSource, data, options?)`

Renders an arbitrary MJML + Handlebars string. No schema validation applied.

```typescript
const { html } = await mc.renderRaw(myMjmlString, { name: 'World' });
```

### `mc.validate(templateId, data)`

Validates data against a template's schema without rendering.

```typescript
const result = mc.validate('invoice', requestBody);
if (!result.valid) console.error(result.errors);
```

### `mc.list()`

Returns metadata for all built-in templates.

```typescript
const templates = mc.list();
// [{ id, name, description, useCase, schema }, ...]
```

### Options

```typescript
interface RenderOptions {
  skipInliner?: boolean; // skip the juice CSS inlining pass (default: false)
}
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
