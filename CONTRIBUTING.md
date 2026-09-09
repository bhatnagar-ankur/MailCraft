# Contributing to MailCraft

Thank you for your interest in contributing! This document explains how to get started.

## Prerequisites

- Node.js >= 18
- pnpm >= 9

## Local setup

```bash
git clone https://github.com/mailcraft/mailcraft.git
cd mailcraft
pnpm install
pnpm build
pnpm test
```

## Project structure

```
packages/
  core/        — @mailcraft/core (compiler, renderer, templates, CLI)
  types/       — @mailcraft/types (shared TypeScript contracts)
```

## Making changes

1. Fork and clone the repo
2. Create a feature branch: `git checkout -b feat/my-change`
3. Make your changes and add tests
4. Run `pnpm build && pnpm test` — both must pass
5. Open a PR against `main`

## Adding a new template

1. Create `packages/core/src/templates/<id>/`:
   - `template.mjml` — MJML source with `{{variable}}` Handlebars syntax
   - `schema.json` — variable definitions (see existing templates for the shape)
   - `preview-data.json` — sample values for the renderer and tests
2. Add your template `id` to the `TEMPLATE_IDS` array in `packages/core/src/templates/index.ts`
3. Run `pnpm test` to confirm it renders without error

### Template guidelines

- Maximum email width: **600px** (MJML's default)
- Use `bgcolor` attributes on `<td>` for background colours — not CSS classes
- Buttons must use `<mj-button>` (MJML generates VML fallback for Outlook automatically)
- Avoid `<img>` with SVG sources — use PNG/JPG
- Font stacks must include a system-font fallback after any web font
- Use `{{variable}}` for text, `{{#if optional}}...{{/if}}` for optional blocks, and `{{#each array}}...{{/each}}` for lists

## Commit style

```
feat: add event-invitation template
fix: correct mso-list handling in subscription template
docs: add adapter contribution guide
```

## Versioning

This repo uses [Changesets](https://github.com/changesets/changesets). After your change, run:

```bash
pnpm changeset
```

…and follow the prompts to record the semver impact. Include the generated `.changeset/*.md` file in your PR.

## Code of Conduct

Be kind. See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
