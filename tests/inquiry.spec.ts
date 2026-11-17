import { expect, test } from '@playwright/test';
import { composeInquiryEmail } from '../src/lib/inquiry/email';
import { checkField, parseInquiry } from '../src/lib/inquiry/rules';

const long = 'We need stock tracking for two shops.';

test.describe('Inquiry rules', () => {
  test('accepts a complete inquiry and trims it', () => {
    const result = parseInquiry({ need: 'system', message: `  ${long}  `, name: ' Ana ', email: '  Ana@Example.com ' });
    expect(result).toEqual({ ok: true, inquiry: { need: 'system', message: long, name: 'Ana', email: 'Ana@Example.com' } });
  });

  test('keeps an optional timeline when one is chosen', () => {
    const result = parseInquiry({ need: 'website', message: long, name: 'Ana', email: 'a@b.co', timeline: 'quarter' });
    expect(result).toMatchObject({ ok: true, inquiry: { timeline: 'quarter' } });
  });

  test('names the first invalid field with its message', () => {
    const base = { need: 'system', message: long, name: 'Ana', email: 'a@b.co' };
    expect(parseInquiry({ ...base, need: 'x' })).toEqual({ ok: false, field: 'need', message: 'Choose what you need.' });
    expect(parseInquiry({ ...base, message: '   ' })).toEqual({ ok: false, field: 'message', message: 'Tell me a little about the project.' });
    expect(parseInquiry({ ...base, message: 'too short' })).toEqual({
      ok: false,
      field: 'message',
      message: 'A bit more detail, please: at least 20 characters.',
    });
    expect(parseInquiry({ ...base, message: 'a'.repeat(2001) })).toEqual({ ok: false, field: 'message', message: 'Keep it under 2,000 characters.' });
    expect(parseInquiry({ ...base, timeline: 'never' })).toEqual({ ok: false, field: 'timeline', message: 'Choose one of the options.' });
    expect(parseInquiry({ ...base, name: '' })).toEqual({ ok: false, field: 'name', message: 'Add your name.' });
    expect(parseInquiry({ ...base, name: 'a'.repeat(101) })).toEqual({ ok: false, field: 'name', message: 'Keep your name under 100 characters.' });
    expect(parseInquiry({ ...base, email: '' })).toEqual({ ok: false, field: 'email', message: 'Add an email address James can reply to.' });
    expect(parseInquiry({ ...base, email: 'not-an-email' })).toEqual({ ok: false, field: 'email', message: "That email address doesn't look right." });
    expect(parseInquiry(null)).toMatchObject({ ok: false, field: 'need' });
  });

  test('checks one field at a time for the form', () => {
    expect(checkField('email', 'a@b')).toBe("That email address doesn't look right.");
    expect(checkField('email', ' a@b.co ')).toBeNull();
    expect(checkField('timeline', '')).toBeNull();
  });

  test('the email is plain text and keeps what the visitor typed literally', () => {
    const { subject, text } = composeInquiryEmail({
      need: 'wordpress',
      timeline: 'month',
      name: 'Ana',
      email: 'ana@example.com',
      message: '<b>Hi</b>\nLine two',
    });
    expect(subject).toBe('Project inquiry: A WordPress site from Ana');
    expect(text).toContain('<b>Hi</b>\nLine two');
    expect(text).toContain('When: Within a month');
    expect(text).toContain('Reply to this email to answer Ana (ana@example.com).');
    expect(composeInquiryEmail({ need: 'unsure', name: 'Bo', email: 'b@c.co', message: long }).text).toContain('When: Not given');
  });
});
