'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './CopyEmail.module.css';

const labels = {
  idle: 'Copy address',
  copied: 'Address copied',
  failed: 'Select the address to copy it',
};

/** Copies the address for visitors whose device has no mail app set up. The mailto link stays beside it. */
export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<keyof typeof labels>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), 2400);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState('copied');
    } catch {
      setState('failed');
    }
  };

  return (
    <button type="button" className={styles.copy} data-state={state} onClick={copy}>
      <span className={styles.knob} aria-hidden>
        <Copy size={15} strokeWidth={2.25} />
        <Check size={16} strokeWidth={2.5} />
      </span>
      <span aria-live="polite">{labels[state]}</span>
    </button>
  );
}
