import { compileMjml } from './compiler/index';
import { renderHandlebars, htmlToPlainText, type TemplateData } from './renderer/index';
import { inlineCss } from './inliner/index';
import { getTemplate, listTemplates, type TemplateEntry, type TemplateId } from './templates/index';
import { validateTemplateData, type ValidationResult } from './validator/index';
import type { RenderOptions, RenderResult } from '@mailcraft/types';

export type { TemplateData, TemplateEntry, TemplateId, RenderOptions, RenderResult, ValidationResult };
export { listTemplates, getTemplate, validateTemplateData };

export class MailCraft {
  /**
   * Renders a built-in template by ID with the provided data variables.
   * Pipeline: Zod validation → MJML compile → Handlebars render → juice CSS inline.
   *
   * Throws if any required variable is missing or has the wrong type.
   */
  async render(
    templateId: string,
    data: TemplateData,
    options: RenderOptions = {}
  ): Promise<RenderResult> {
    const { skipInliner = false } = options;

    const entry = getTemplate(templateId);

    // Validate data against the template's variable schema
    const validation = validateTemplateData(entry.schema, data);
    if (!validation.valid) {
      const messages = validation.errors
        .map((e) => `  • ${e.field}: ${e.message}`)
        .join('\n');
      throw new Error(
        `Template "${templateId}" data validation failed:\n${messages}`
      );
    }

    // Step 1: MJML → HTML (Handlebars placeholders pass through as text nodes)
    const { html: compiledHtml } = compileMjml(entry.mjml);

    // Step 2: Handlebars render (resolves {{variables}}, {{#if}}, {{#each}})
    const renderedHtml = renderHandlebars(compiledHtml, data);

    // Step 3: Additional CSS inlining pass (belt-and-suspenders)
    const finalHtml = skipInliner ? renderedHtml : inlineCss(renderedHtml);

    const text = htmlToPlainText(finalHtml);

    return { html: finalHtml, text };
  }

  /**
   * Validates data against a template's schema without rendering.
   * Useful for API request pre-checks or form validation.
   */
  validate(templateId: string, data: TemplateData): ValidationResult {
    const entry = getTemplate(templateId);
    return validateTemplateData(entry.schema, data);
  }

  /**
   * Renders an arbitrary MJML + Handlebars template string directly —
   * useful for custom templates not in the built-in library.
   * No schema validation is applied.
   */
  async renderRaw(
    mjmlSource: string,
    data: TemplateData,
    options: RenderOptions = {}
  ): Promise<RenderResult> {
    const { skipInliner = false } = options;

    const { html: compiledHtml } = compileMjml(mjmlSource);
    const renderedHtml = renderHandlebars(compiledHtml, data);
    const finalHtml = skipInliner ? renderedHtml : inlineCss(renderedHtml);
    const text = htmlToPlainText(finalHtml);

    return { html: finalHtml, text };
  }

  /** Returns metadata for all built-in templates. */
  list(): TemplateEntry[] {
    return listTemplates();
  }
}

export default MailCraft;
