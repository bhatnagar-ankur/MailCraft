import { compileMjml } from './compiler/index';
import { renderHandlebars, htmlToPlainText, type TemplateData } from './renderer/index';
import { inlineCss } from './inliner/index';
import { getTemplate, listTemplates, type TemplateEntry, type TemplateId } from './templates/index';
import type { RenderOptions, RenderResult } from '@mailcraft/types';

export type { TemplateData, TemplateEntry, TemplateId, RenderOptions, RenderResult };
export { listTemplates, getTemplate };

export class MailCraft {
  /**
   * Renders a built-in template by ID with the provided data variables.
   * Pipeline: MJML compile → Handlebars render → juice CSS inline.
   */
  async render(
    templateId: string,
    data: TemplateData,
    options: RenderOptions = {}
  ): Promise<RenderResult> {
    const { skipInliner = false } = options;

    const entry = getTemplate(templateId);

    // Step 1: MJML → HTML (Handlebars placeholders pass through as text nodes)
    const { html: compiledHtml } = compileMjml(entry.mjml);

    // Step 2: Handlebars render (resolves {{variables}}, {{#if}}, {{#each}})
    const renderedHtml = renderHandlebars(compiledHtml, data);

    // Step 3: Additional CSS inlining pass (belt-and-suspenders)
    const finalHtml = skipInliner ? renderedHtml : inlineCss(renderedHtml);

    // Generate plain-text fallback
    const text = htmlToPlainText(finalHtml);

    return { html: finalHtml, text };
  }

  /**
   * Renders an arbitrary MJML + Handlebars template string directly —
   * useful for custom templates not in the built-in library.
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
