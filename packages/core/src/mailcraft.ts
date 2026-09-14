import { compileMjml } from './compiler/index';
import { renderHandlebars, htmlToPlainText, type TemplateData } from './renderer/index';
import { inlineCss } from './inliner/index';
import { getTemplate, listTemplates, type TemplateEntry } from './templates/index';
import { validateTemplateData } from './validator/index';
import type { RenderOptions, RenderResult } from '@bhatnagar-ankur/mailcraft-types';

export class MailCraft {
  async render(
    templateId: string,
    data: TemplateData,
    options: RenderOptions = {}
  ): Promise<RenderResult> {
    const { skipInliner = false } = options;
    const entry = getTemplate(templateId);

    const validation = validateTemplateData(entry.schema, data);
    if (!validation.valid) {
      const messages = validation.errors
        .map((e) => `  • ${e.field}: ${e.message}`)
        .join('\n');
      throw new Error(`Template "${templateId}" data validation failed:\n${messages}`);
    }

    const { html: compiledHtml } = compileMjml(entry.mjml);
    const renderedHtml = renderHandlebars(compiledHtml, data);
    const finalHtml = skipInliner ? renderedHtml : inlineCss(renderedHtml);
    return { html: finalHtml, text: htmlToPlainText(finalHtml) };
  }

  validate(templateId: string, data: TemplateData) {
    return validateTemplateData(getTemplate(templateId).schema, data);
  }

  async renderRaw(
    mjmlSource: string,
    data: TemplateData,
    options: RenderOptions = {}
  ): Promise<RenderResult> {
    const { skipInliner = false } = options;
    const { html: compiledHtml } = compileMjml(mjmlSource);
    const renderedHtml = renderHandlebars(compiledHtml, data);
    const finalHtml = skipInliner ? renderedHtml : inlineCss(renderedHtml);
    return { html: finalHtml, text: htmlToPlainText(finalHtml) };
  }

  list(): TemplateEntry[] {
    return listTemplates();
  }
}

export default MailCraft;
