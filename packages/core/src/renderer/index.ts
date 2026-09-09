import Handlebars from 'handlebars';

// Register 'eq' helper used by templates for conditional rendering:
// {{#if (eq alertType "critical")}} ... {{/if}}
Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

export type TemplateData = Record<string, unknown>;

/**
 * Renders a Handlebars template string with the provided data.
 * By default all variable values are HTML-escaped. Use {{{triple}}}
 * syntax in templates for intentional raw HTML output.
 */
export function renderHandlebars(template: string, data: TemplateData): string {
  const compiled = Handlebars.compile(template, { noEscape: false });
  return compiled(data);
}

/**
 * Generates a minimal plain-text fallback from rendered HTML by stripping
 * all HTML tags and normalising whitespace.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
