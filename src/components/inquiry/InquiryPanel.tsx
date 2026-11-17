'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { site } from '@/data/site';
import { checkField, MESSAGE_MAX, needs, timelines, type Field } from '@/lib/inquiry/rules';
import { CopyEmail } from '../CopyEmail';
import { INQUIRY_OPEN_EVENT, type InquiryOpenDetail } from './open';
import styles from './InquiryPanel.module.css';

type Draft = Record<Field, string>;
type Status = { kind: 'editing' } | { kind: 'sending' } | { kind: 'sent'; email: string } | { kind: 'failed'; limited: boolean };

const DRAFT_KEY = 'inquiry:draft';
const empty: Draft = { need: '', message: '', timeline: '', name: '', email: '' };
const order: Field[] = ['need', 'message', 'timeline', 'name', 'email'];

/** Storage can be blocked by privacy settings; the draft then lives only as long as the page. */
function loadDraft(): Draft | null {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    return saved ? { ...empty, ...(JSON.parse(saved) as Partial<Draft>) } : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: Draft | null) {
  try {
    if (draft) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage blocked: the draft is kept in the page only.
  }
}

const hasText = (draft: Draft) => order.some((field) => draft[field].trim());

/**
 * "Start a project": every link marked data-inquiry opens this form instead of a mail app. The
 * links stay real mailto: links, so they still work before this script loads.
 */
export function InquiryPanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const startedAt = useRef(0);
  const key = useRef('');
  const [draft, setDraft] = useState<Draft>(empty);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'editing' });

  const focusField = (field: Field) => {
    const target = formRef.current?.querySelector<HTMLElement>(field === 'need' ? 'input[name="need"]' : `#inquiry-${field}`);
    target?.focus();
  };

  const open = useCallback((opening?: string) => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    const saved = loadDraft();
    setDraft((current) => {
      const base = saved ?? (hasText(current) ? current : empty);
      return !base.message.trim() && opening ? { ...base, message: opening } : base;
    });
    setStatus((current) => (current.kind === 'sent' ? { kind: 'editing' } : current));
    if (!startedAt.current) startedAt.current = Date.now();
    if (!key.current) key.current = crypto.randomUUID();
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    requestAnimationFrame(() => focusField('need'));
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-inquiry]');
      if (!link) return;
      event.preventDefault();
      link.focus();
      open(link.dataset.inquiry || undefined);
    };
    const onOpen = (event: Event) => open((event as CustomEvent<InquiryOpenDetail>).detail?.opening);
    document.addEventListener('click', onClick, true);
    window.addEventListener(INQUIRY_OPEN_EVENT, onOpen);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener(INQUIRY_OPEN_EVENT, onOpen);
    };
  }, [open]);

  const update = (field: Field, value: string) => {
    const next = { ...draft, [field]: value };
    setDraft(next);
    saveDraft(hasText(next) ? next : null);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: checkField(field, value) ?? undefined }));
    if (status.kind === 'failed') setStatus({ kind: 'editing' });
  };

  const blur = (field: Field, next: EventTarget | null) => {
    // Moving straight to Send: submit checks every field, and an error appearing now would shift the
    // button out from under the pointer and swallow the click.
    if (next instanceof HTMLButtonElement && next.type === 'submit') return;
    if (draft[field].trim()) setErrors((current) => ({ ...current, [field]: checkField(field, draft[field]) ?? undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status.kind === 'sending') return;
    const found = Object.fromEntries(order.map((field) => [field, checkField(field, draft[field]) ?? undefined])) as Partial<Record<Field, string>>;
    setErrors(found);
    const first = order.find((field) => found[field]);
    if (first) return focusField(first);

    setStatus({ kind: 'sending' });
    const company = (formRef.current?.elements.namedItem('company') as HTMLInputElement | null)?.value ?? '';
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, company, startedAt: startedAt.current, idempotencyKey: key.current }),
      });
      if (response.ok) {
        setStatus({ kind: 'sent', email: draft.email.trim() });
        setDraft(empty);
        saveDraft(null);
        key.current = crypto.randomUUID();
        startedAt.current = 0;
        return;
      }
      const body = (await response.json().catch(() => ({}))) as { state?: string; field?: Field; message?: string };
      if (body.state === 'invalid' && body.field) {
        setErrors({ [body.field]: body.message });
        setStatus({ kind: 'editing' });
        return focusField(body.field);
      }
      setStatus({ kind: 'failed', limited: response.status === 429 });
    } catch {
      setStatus({ kind: 'failed', limited: false });
    }
  };

  const fallbackHref = `mailto:${site.email}?subject=${encodeURIComponent('Project inquiry')}&body=${encodeURIComponent(draft.message)}`;
  const describedBy = (field: Field, extra?: string) => [errors[field] && `inquiry-${field}-error`, extra].filter(Boolean).join(' ') || undefined;
  const error = (field: Field) =>
    errors[field] && (
      <p id={`inquiry-${field}-error`} className={styles.error}>
        {errors[field]}
      </p>
    );
  const sending = status.kind === 'sending';

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="inquiry-title"
      onClose={() => openerRef.current?.focus()}
      onClick={(event) => event.target === dialogRef.current && dialogRef.current?.close()}
    >
      <div className={styles.sheet}>
        <header className={styles.head}>
          <h2 id="inquiry-title" className={styles.title}>
            Start a project
          </h2>
          <button type="button" className={styles.close} aria-label="Close" onClick={() => dialogRef.current?.close()}>
            <X aria-hidden size={20} />
          </button>
        </header>

        {status.kind === 'sent' ? (
          <div className={styles.sent} role="status">
            <p className={styles.sentTitle}>Sent. James will reply to {status.email}.</p>
            <p className={styles.note}>Replies usually arrive within one business day.</p>
            <button type="button" className={styles.submit} onClick={() => dialogRef.current?.close()}>
              Done
            </button>
          </div>
        ) : (
          <form ref={formRef} className={styles.form} onSubmit={submit} noValidate aria-busy={sending}>
            <fieldset className={styles.field} aria-describedby={describedBy('need')} aria-invalid={errors.need ? true : undefined}>
              <legend className={styles.label}>What do you need?</legend>
              <div className={styles.choices}>
                {needs.map((need) => (
                  <label key={need.id} className={styles.choice}>
                    <input type="radio" name="need" value={need.id} checked={draft.need === need.id} disabled={sending} onChange={() => update('need', need.id)} />
                    <span>{need.label}</span>
                  </label>
                ))}
              </div>
              {error('need')}
            </fieldset>

            <div className={styles.field}>
              <label htmlFor="inquiry-message" className={styles.label}>
                Tell me about it
              </label>
              <textarea
                id="inquiry-message"
                className={styles.input}
                rows={4}
                maxLength={MESSAGE_MAX + 200}
                value={draft.message}
                readOnly={sending}
                placeholder="What it’s for, who will use it, and anything you already have."
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={describedBy('message')}
                onChange={(event) => update('message', event.target.value)}
                onBlur={(event) => blur('message', event.relatedTarget)}
              />
              {draft.message.length > MESSAGE_MAX - 200 && (
                <p className={styles.count}>
                  {draft.message.trim().length.toLocaleString('en')}/{MESSAGE_MAX.toLocaleString('en')}
                </p>
              )}
              {error('message')}
            </div>

            <div className={styles.field}>
              <label htmlFor="inquiry-timeline" className={styles.label}>
                When do you need it? <span className={styles.optional}>Optional</span>
              </label>
              <select
                id="inquiry-timeline"
                className={styles.input}
                value={draft.timeline}
                disabled={sending}
                aria-describedby={describedBy('timeline')}
                onChange={(event) => update('timeline', event.target.value)}
              >
                <option value="">Choose a timeframe</option>
                {timelines.map((timeline) => (
                  <option key={timeline.id} value={timeline.id}>
                    {timeline.label}
                  </option>
                ))}
              </select>
              {error('timeline')}
            </div>

            <div className={styles.pair}>
              <div className={styles.field}>
                <label htmlFor="inquiry-name" className={styles.label}>
                  Your name
                </label>
                <input
                  id="inquiry-name"
                  className={styles.input}
                  autoComplete="name"
                  value={draft.name}
                  readOnly={sending}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={describedBy('name')}
                  onChange={(event) => update('name', event.target.value)}
                  onBlur={(event) => blur('name', event.relatedTarget)}
                />
                {error('name')}
              </div>
              <div className={styles.field}>
                <label htmlFor="inquiry-email" className={styles.label}>
                  Your email
                </label>
                <input
                  id="inquiry-email"
                  type="email"
                  className={styles.input}
                  autoComplete="email"
                  inputMode="email"
                  value={draft.email}
                  readOnly={sending}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={describedBy('email')}
                  onChange={(event) => update('email', event.target.value)}
                  onBlur={(event) => blur('email', event.relatedTarget)}
                />
                {error('email')}
              </div>
            </div>

            {/* A field people never see; simple bots fill it in. */}
            <div className={styles.trap} aria-hidden>
              <label htmlFor="inquiry-company">Company</label>
              <input id="inquiry-company" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
            </div>

            <div aria-live="polite">
              {status.kind === 'failed' && (
                <div className={styles.problem}>
                  <p>
                    {status.limited
                      ? 'You’ve sent a few already. Try again later, or email James directly.'
                      : 'That didn’t send. Your message is still here.'}
                  </p>
                  <div className={styles.fallback}>
                    <a href={fallbackHref} className={styles.mail}>
                      Email it instead
                    </a>
                    <CopyEmail email={site.email} />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.foot}>
              <button type="submit" className={styles.submit} disabled={sending} aria-disabled={sending}>
                {sending ? 'Sending…' : 'Send to James'}
              </button>
              <p className={styles.note}>
                James replies within one business day.
                <br />
                Your message is emailed to James; this site doesn’t store it.
              </p>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
