'use client';

import { MessageSquareText, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { inquiryHref } from '@/data/site';
import type { AskAction } from '@/lib/ask/gemini';
import { actionLabel, runAction } from './actions';
import { ASK_OPEN_EVENT } from './open';
import styles from './AskPanel.module.css';

interface Exchange {
  question: string;
  answer: string;
  actions: AskAction[];
}

type Problem = { state: 'limited'; retryAfterSeconds: number } | { state: 'busy' | 'off' | 'error' } | { state: 'invalid'; message: string };

const MAX = 300;
const suggestions = ['What can you build for my business?', 'How long does a website take?', 'Show me the live demo'];

function problemText(problem: Problem): string {
  switch (problem.state) {
    case 'limited': {
      const minutes = Math.max(1, Math.ceil(problem.retryAfterSeconds / 60));
      return `You’ve asked a lot in a short time. Try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`;
    }
    case 'busy':
      return 'The assistant is busy today. Please try again tomorrow.';
    case 'off':
      return 'The assistant is switched off for now.';
    case 'invalid':
      return problem.message;
    case 'error':
      return 'Something went wrong. Please try again in a moment.';
  }
}

/** "Ask about my work": a header button and a dialog that answers from the site and acts on the page. */
export function AskPanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [question, setQuestion] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const router = useRouter();
  const onHome = usePathname() === '/';

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    // Focus goes back to whatever opened the panel; from a keyboard shortcut with nothing focused, the header button.
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
    dialog.showModal();
    inputRef.current?.focus();
  }, []);

  // "/" (when not typing) and Ctrl/Cmd+K open the panel from anywhere on the page.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      const slash = event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey;
      // Autofill fires keydown events with no key; typing in a field keeps the browser's own shortcuts.
      const command = !typing && event.key?.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey);
      if (!slash && !command) return;
      event.preventDefault();
      open();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(ASK_OPEN_EVENT, open);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(ASK_OPEN_EVENT, open);
    };
  }, [open]);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return setProblem({ state: 'invalid', message: 'Type a question first.' });
    if (trimmed.length > MAX) return setProblem({ state: 'invalid', message: `Keep it to ${MAX} characters.` });
    setPending(true);
    setProblem(null);
    const history = exchanges.slice(-2).flatMap((e) => [
      { role: 'user', text: e.question },
      { role: 'model', text: e.answer },
    ]);
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, history }),
      });
      const body = await response.json();
      if (response.ok) {
        setExchanges((all) => [...all, { question: trimmed, answer: body.answer, actions: body.actions ?? [] }]);
        setQuestion('');
      } else {
        // Any state the panel does not know (a refused origin, say) reads as a general error.
        const known = ['limited', 'busy', 'off', 'invalid', 'error'];
        setProblem(known.includes(body?.state) ? (body as Problem) : { state: 'error' });
      }
    } catch {
      setProblem({ state: 'error' });
    } finally {
      setPending(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void ask(question);
  };

  const act = (action: AskAction) => {
    dialogRef.current?.close();
    runAction(action, onHome, router.push);
  };

  return (
    <>
      <button ref={triggerRef} type="button" className={styles.trigger} aria-label="Ask about my work" aria-keyshortcuts="/ Control+K" onClick={open}>
        <MessageSquareText aria-hidden size={18} />
        <span className={styles.triggerText}>Ask</span>
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="ask-title"
        onClose={() => (openerRef.current?.isConnected ? openerRef.current : triggerRef.current)?.focus()}
        onClick={(event) => event.target === dialogRef.current && dialogRef.current?.close()}
      >
        <div className={styles.sheet}>
          <header className={styles.head}>
            <h2 id="ask-title" className={styles.title}>
              Ask about my work
            </h2>
            <button type="button" className={styles.close} aria-label="Close" onClick={() => dialogRef.current?.close()}>
              <X aria-hidden size={20} />
            </button>
          </header>

          <div className={styles.body} aria-live="polite" aria-busy={pending}>
            {exchanges.length === 0 && !pending && (
              <ul className={styles.suggestions}>
                {suggestions.map((text) => (
                  <li key={text}>
                    <button type="button" className={styles.chip} onClick={() => void ask(text)}>
                      {text}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {exchanges.map((exchange, i) => (
              <div key={i} className={styles.exchange}>
                <p className={styles.question}>{exchange.question}</p>
                <p className={styles.answer}>{exchange.answer}</p>
                {exchange.actions.length > 0 && (
                  <div className={styles.actions}>
                    {exchange.actions.map((action) => (
                      <button key={actionLabel(action)} type="button" className={styles.action} onClick={() => act(action)}>
                        {actionLabel(action)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {pending && <p className={styles.skeleton}>Looking through the site…</p>}
            {/* Announced by the surrounding live region; role="alert" here would read it twice. */}
            {problem && (
              <p className={styles.problem}>
                {problemText(problem)}{' '}
                <a href={inquiryHref} className={styles.mail}>
                  Email James instead
                </a>
              </p>
            )}
          </div>

          <form className={styles.form} onSubmit={submit}>
            <label htmlFor="ask-question" className="sr-only">
              Your question
            </label>
            <textarea
              id="ask-question"
              ref={inputRef}
              className={styles.input}
              rows={2}
              maxLength={MAX}
              value={question}
              placeholder="Ask about projects, skills or how working together goes. Don’t include personal details."
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void ask(question);
                }
              }}
            />
            <div className={styles.formFoot}>
              <span className={styles.count} aria-hidden>
                {question.length}/{MAX}
              </span>
              <button type="submit" className={styles.submit} disabled={pending}>
                Ask
              </button>
            </div>
          </form>

          <p className={styles.note}>
            Answers come from this site’s content only. Questions are sent to Google’s Gemini to answer, and this site doesn’t
            keep them.
          </p>
        </div>
      </dialog>
    </>
  );
}
