/**
 * The project form's field rules, shared by the panel (checked as the visitor types) and the
 * endpoint (checked again, since the client is never trusted).
 */

export type Need = 'system' | 'wordpress' | 'website' | 'unsure';
export type Timeline = 'asap' | 'month' | 'quarter' | 'flexible';
export type Field = 'need' | 'message' | 'timeline' | 'name' | 'email';

export const needs: { id: Need; label: string }[] = [
  { id: 'system', label: 'A business system or web app' },
  { id: 'wordpress', label: 'A WordPress site' },
  { id: 'website', label: 'A website or landing page' },
  { id: 'unsure', label: 'Not sure yet' },
];

export const timelines: { id: Timeline; label: string }[] = [
  { id: 'asap', label: 'As soon as possible' },
  { id: 'month', label: 'Within a month' },
  { id: 'quarter', label: 'In 1–3 months' },
  { id: 'flexible', label: 'Flexible' },
];

export interface Inquiry {
  need: Need;
  message: string;
  timeline?: Timeline;
  name: string;
  email: string;
}

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 2000;
export const NAME_MAX = 100;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The error copy for one field's value, or null when it is fine. */
export function checkField(field: Field, raw: string): string | null {
  const value = raw.trim();
  switch (field) {
    case 'need':
      return needs.some((need) => need.id === value) ? null : 'Choose what you need.';
    case 'message':
      if (!value) return 'Tell me a little about the project.';
      if (value.length < MESSAGE_MIN) return 'A bit more detail, please: at least 20 characters.';
      return value.length > MESSAGE_MAX ? 'Keep it under 2,000 characters.' : null;
    case 'timeline':
      return !value || timelines.some((timeline) => timeline.id === value) ? null : 'Choose one of the options.';
    case 'name':
      if (!value) return 'Add your name.';
      return value.length > NAME_MAX ? 'Keep your name under 100 characters.' : null;
    case 'email':
      if (!value) return 'Add an email address James can reply to.';
      return EMAIL.test(value) ? null : "That email address doesn't look right.";
  }
}

const fields: Field[] = ['need', 'message', 'timeline', 'name', 'email'];

export function parseInquiry(body: unknown): { ok: true; inquiry: Inquiry } | { ok: false; field: Field; message: string } {
  const source = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const values = Object.fromEntries(fields.map((field) => [field, typeof source[field] === 'string' ? (source[field] as string).trim() : ''])) as Record<
    Field,
    string
  >;
  for (const field of fields) {
    const message = checkField(field, values[field]);
    if (message) return { ok: false, field, message };
  }
  const inquiry: Inquiry = { need: values.need as Need, message: values.message, name: values.name, email: values.email };
  if (values.timeline) inquiry.timeline = values.timeline as Timeline;
  return { ok: true, inquiry };
}
