import { describe, it, expect } from 'vitest';
import { renderHandlebars, htmlToPlainText } from '../renderer/index';

describe('renderHandlebars', () => {
  it('interpolates simple variables', () => {
    const result = renderHandlebars('Hello, {{firstName}}!', { firstName: 'Ankur' });
    expect(result).toBe('Hello, Ankur!');
  });

  it('HTML-escapes variable values by default', () => {
    const result = renderHandlebars('{{val}}', { val: '<script>alert(1)</script>' });
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('renders {{#if}} blocks correctly', () => {
    const tpl = '{{#if show}}visible{{/if}}';
    expect(renderHandlebars(tpl, { show: true })).toBe('visible');
    expect(renderHandlebars(tpl, { show: false })).toBe('');
  });

  it('renders {{#each}} loops', () => {
    const tpl = '{{#each items}}<li>{{this}}</li>{{/each}}';
    const result = renderHandlebars(tpl, { items: ['a', 'b', 'c'] });
    expect(result).toBe('<li>a</li><li>b</li><li>c</li>');
  });

  it('supports the eq helper', () => {
    const tpl = '{{#if (eq type "critical")}}red{{/if}}';
    expect(renderHandlebars(tpl, { type: 'critical' })).toBe('red');
    expect(renderHandlebars(tpl, { type: 'info' })).toBe('');
  });
});

describe('htmlToPlainText', () => {
  it('strips HTML tags', () => {
    const result = htmlToPlainText('<p>Hello <strong>world</strong></p>');
    expect(result).toContain('Hello');
    expect(result).toContain('world');
    expect(result).not.toContain('<p>');
    expect(result).not.toContain('<strong>');
  });

  it('decodes common HTML entities', () => {
    const result = htmlToPlainText('&amp; &lt; &gt; &quot; &#39;');
    expect(result).toContain('&');
    expect(result).toContain('<');
    expect(result).toContain('>');
  });
});
