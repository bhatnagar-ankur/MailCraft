import juice from 'juice';

/**
 * Runs juice CSS inlining as a belt-and-suspenders pass after MJML compilation.
 * MJML already inlines most styles; juice catches any remaining <style> blocks
 * that MJML leaves (e.g. responsive media queries are intentionally left).
 *
 * Media queries are preserved because they are needed for responsive behaviour
 * in clients that support them (Gmail mobile app, Apple Mail, OWA).
 */
export function inlineCss(html: string): string {
  return juice(html, {
    removeStyleTags: false,
    preserveMediaQueries: true,
    preserveFontFaces: true,
    applyStyleTags: true,
    applyAttributesTableElements: true,
  });
}
