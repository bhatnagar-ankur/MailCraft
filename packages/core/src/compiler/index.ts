// mjml default export is synchronous despite @types/mjml typing it as Promise
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mjml2html = require('mjml') as (
  input: string,
  options?: {
    validationLevel?: 'strict' | 'soft' | 'skip';
    minify?: boolean;
  }
) => {
  html: string;
  errors: Array<{
    formattedMessage: string;
    message: string;
    tagName?: string;
    line?: number;
  }>;
};

export interface CompileResult {
  html: string;
  errors: Array<{ message: string; tagName?: string; line?: number }>;
}

/**
 * Compiles an MJML source string to table-based HTML with inline styles
 * and MSO/VML conditionals for Outlook. Handlebars placeholders in the
 * MJML source pass through unchanged — they are resolved in a later step.
 */
export function compileMjml(mjmlSource: string): CompileResult {
  const result = mjml2html(mjmlSource, {
    validationLevel: 'soft',
    minify: false,
  });

  const fatalErrors = result.errors.filter((e) =>
    e.formattedMessage?.toLowerCase().includes('fatal')
  );
  if (fatalErrors.length > 0) {
    throw new Error(
      `MJML compilation failed:\n${fatalErrors.map((e) => e.formattedMessage).join('\n')}`
    );
  }

  return {
    html: result.html,
    errors: result.errors.map((e) => ({
      message: e.formattedMessage || e.message,
      tagName: e.tagName,
      line: e.line,
    })),
  };
}
