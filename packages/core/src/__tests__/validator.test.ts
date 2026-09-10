import { describe, it, expect } from 'vitest';
import { MailCraft } from '../index';
import { validateTemplateData } from '../validator/index';
import { getTemplate } from '../templates/index';

const mc = new MailCraft();

describe('validateTemplateData()', () => {
  it('returns valid=true when all required fields are present', () => {
    const entry = getTemplate('otp');
    const result = validateTemplateData(entry.schema, {
      firstName: 'Ankur',
      otpCode: '847291',
      expiryMinutes: 10,
      requestedAt: 'now',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors when required fields are missing', () => {
    const entry = getTemplate('otp');
    const result = validateTemplateData(entry.schema, {
      firstName: 'Ankur',
      // otpCode, expiryMinutes, requestedAt all missing
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'otpCode')).toBe(true);
  });

  it('passes through optional fields that are absent', () => {
    const entry = getTemplate('otp');
    const result = validateTemplateData(entry.schema, {
      firstName: 'Ankur',
      otpCode: '000000',
      expiryMinutes: 5,
      requestedAt: 'now',
      // supportLink is optional — omitting is fine
    });
    expect(result.valid).toBe(true);
  });
});

describe('MailCraft.validate()', () => {
  it('exposes schema validation without rendering', () => {
    const result = mc.validate('welcome', { firstName: 'A', companyName: 'B', role: 'C', startDate: 'D' });
    expect(result.valid).toBe(true);
  });
});

describe('MailCraft.render() validation guard', () => {
  it('throws a descriptive error when required fields are missing', async () => {
    await expect(
      mc.render('otp', { firstName: 'Ankur' }) // missing otpCode, expiryMinutes, requestedAt
    ).rejects.toThrow('data validation failed');
  });
});
