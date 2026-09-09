import { describe, it, expect } from 'vitest';
import { MailCraft } from '../index';

const mc = new MailCraft();

describe('MailCraft.list()', () => {
  it('returns all 10 built-in templates', () => {
    const templates = mc.list();
    expect(templates).toHaveLength(10);
  });

  it('each template has required fields', () => {
    for (const t of mc.list()) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.mjml).toContain('<mjml>');
      expect(t.schema.variables).toBeDefined();
    }
  });
});

describe('MailCraft.render()', () => {
  it('renders the otp template', async () => {
    const { html, text } = await mc.render('otp', {
      firstName: 'Ankur',
      otpCode: '847291',
      expiryMinutes: 10,
      requestedAt: 'Sept 9, 2026, 10:34 AM UTC',
    });
    expect(html).toContain('847291');
    expect(html).toContain('Ankur');
    expect(html).toContain('<table');
    expect(text).toContain('847291');
  });

  it('renders the welcome template', async () => {
    const { html } = await mc.render('welcome', {
      firstName: 'Jane',
      companyName: 'Acme Corp',
      role: 'Engineer',
      startDate: 'Sept 15, 2026',
      managerName: 'Bob',
      portalLink: 'https://portal.acme.com',
    });
    expect(html).toContain('Jane');
    expect(html).toContain('Acme Corp');
    expect(html).toContain('Engineer');
  });

  it('renders the invoice template with line items', async () => {
    const { html } = await mc.render('invoice', {
      customerName: 'Test User',
      invoiceNumber: 'INV-001',
      invoiceDate: 'Sept 9, 2026',
      currency: '$',
      items: [
        { description: 'Pro Plan', quantity: '1', unitPrice: '$99', total: '$99' },
      ],
      subtotal: '99.00',
      total: '99.00',
    });
    expect(html).toContain('Pro Plan');
    expect(html).toContain('INV-001');
  });

  it('renders the system-alert template with alertType=critical', async () => {
    const { html } = await mc.render('system-alert', {
      firstName: 'Ankur',
      alertType: 'critical',
      alertTitle: 'Breach detected',
      alertMessage: 'Unusual activity on your account.',
      timestamp: 'Sept 9, 2026',
    });
    expect(html).toContain('Breach detected');
    // critical colour
    expect(html).toContain('#dc2626');
  });

  it('throws for an unknown template ID', async () => {
    await expect(mc.render('does-not-exist', {})).rejects.toThrow('not found');
  });

  it('HTML-escapes user-supplied data', async () => {
    const { html } = await mc.render('otp', {
      firstName: '<script>alert(1)</script>',
      otpCode: '000000',
      expiryMinutes: 5,
      requestedAt: 'now',
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('MailCraft.renderRaw()', () => {
  it('compiles and renders an arbitrary MJML+HBS string', async () => {
    const mjml = `
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-text>Hi {{name}}</mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>`;
    const { html } = await mc.renderRaw(mjml, { name: 'World' });
    expect(html).toContain('Hi World');
  });
});
