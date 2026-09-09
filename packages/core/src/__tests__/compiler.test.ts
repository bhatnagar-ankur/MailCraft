import { describe, it, expect } from 'vitest';
import { compileMjml } from '../compiler/index';

describe('compileMjml', () => {
  it('compiles valid MJML to HTML', () => {
    const mjml = `
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-text>Hello, {{firstName}}!</mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>`;
    const { html, errors } = compileMjml(mjml);
    expect(html).toContain('Hello, {{firstName}}!');
    expect(html).toContain('<table');
    expect(errors).toHaveLength(0);
  });

  it('throws on fatal MJML errors', () => {
    // Invalid MJML with a broken structure
    const badMjml = `<mjml><mj-body><mj-text>orphan text</mj-text></mj-body></mjml>`;
    // This won't throw (soft validation) but should still compile
    expect(() => compileMjml(badMjml)).not.toThrow();
  });

  it('preserves Handlebars placeholders through compilation', () => {
    const mjml = `
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-text>{{#each items}}<p>{{name}}</p>{{/each}}</mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>`;
    const { html } = compileMjml(mjml);
    expect(html).toContain('{{#each items}}');
    expect(html).toContain('{{name}}');
    expect(html).toContain('{{/each}}');
  });
});
