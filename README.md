# MailCraft

> Open-source dynamic email template builder with cross-client compatibility

[![CI](https://github.com/mailcraft/mailcraft/actions/workflows/ci.yml/badge.svg)](https://github.com/mailcraft/mailcraft/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@mailcraft/core)](https://www.npmjs.com/package/@mailcraft/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

MailCraft solves the hardest problem in frontend development: making dynamic emails look identical across every email client — from modern Gmail to Outlook 2016 on a corporate Windows machine.

It wraps **MJML** (for bulletproof table-based HTML) with **Handlebars** (for safe variable injection) and ships 10 production-ready templates you can use in minutes.

---

## Features

- **10 built-in templates** — welcome, OTP, password reset, invoice, order confirmation, and more
- **Outlook 2016/2019 compatible** — MJML generates VML fallbacks for buttons, `bgcolor` for backgrounds
- **Safe by default** — Handlebars HTML-escapes all variable values
- **TypeScript-first** — full types throughout
- **CLI included** — `npx mailcraft render --template otp --data data.json`
- **`renderRaw()`** — bring your own MJML + Handlebars template

---

## Quick start

```bash
npm install @mailcraft/core
```

```typescript
import { MailCraft } from '@mailcraft/core';

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
npx mailcraft list

# Render with a JSON data file
npx mailcraft render --template otp --data ./data.json --output ./out.html

# Render with inline variables
npx mailcraft render --template welcome \
  --var firstName="Ankur" \
  --var companyName="Acme Corp" \
  --var role="Senior Engineer" \
  --var startDate="Sept 15, 2026" \
  --output welcome.html

# Print a template's variable schema
npx mailcraft schema invoice
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

Each template ships with:
- `.mjml` source file
- `schema.json` — variable definitions with types and required flags
- `preview-data.json` — sample data for testing

---

## Rendering pipeline

```
MJML template  →  MJML compile  →  HTML (table-based, MSO/VML for Outlook)
                                       ↓
                               Handlebars render  →  Variables resolved
                                       ↓
                               juice CSS inline  →  Production-ready HTML
```

---

## API

### `new MailCraft()`

```typescript
const mc = new MailCraft();
```

### `mc.render(templateId, data, options?)`

Renders a built-in template.

```typescript
const { html, text } = await mc.render('welcome', {
  firstName: 'Ankur',
  companyName: 'Acme Corp',
  role: 'Senior Engineer',
  startDate: 'Sept 15, 2026',
});
```

### `mc.renderRaw(mjmlSource, data, options?)`

Renders an arbitrary MJML + Handlebars string.

```typescript
const { html } = await mc.renderRaw(myMjmlString, { name: 'World' });
```

### `mc.list()`

Returns metadata for all built-in templates.

```typescript
const templates = mc.list();
// [{ id, name, description, useCase, schema, previewData, mjml }, ...]
```

### Options

```typescript
interface RenderOptions {
  skipInliner?: boolean; // skip the juice CSS inlining pass (default: false)
}
```

---

## Email client compatibility

| Feature | Gmail | Apple Mail | Outlook 2016/2019 |
|---|:---:|:---:|:---:|
| MJML table layouts | ✅ | ✅ | ✅ |
| Inline styles | ✅ | ✅ | ✅ |
| VML buttons (rounded) | ✅ | ✅ | ✅ |
| `bgcolor` backgrounds | ✅ | ✅ | ✅ |
| Web fonts | ✅ | ✅ | ⚠️ Falls back to system font |
| Background images | ✅ | ✅ | ⚠️ VML (handled by MJML) |
| SVG images | ✅ | ✅ | ❌ Use PNG/JPG |
| CSS animations | ✅ | ✅ | ❌ Not supported |

---

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md) | Installation, first render, CLI usage, rendered sample links |
| [docs/USAGE.md](./docs/USAGE.md) | Full API reference, integration examples, advanced template usage |
| [docs/samples/](./docs/samples/) | Pre-rendered HTML files for all 10 templates — open in a browser to preview |
| [Live template gallery](https://claude.ai/code/artifact/ab594c49-216f-443b-a1a6-cb9fef4b7078) | Visual docs with pipeline diagram, gallery mockups, and CLI reference |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © 2026 Ankur Bhatnagar
