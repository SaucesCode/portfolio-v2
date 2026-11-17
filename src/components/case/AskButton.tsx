'use client';

import { MessageSquareText } from 'lucide-react';
import { openAsk } from '../ask/open';
import styles from './AskButton.module.css';

/** Opens the site's assistant where the visitor is reading, rather than sending them elsewhere. */
export function AskButton() {
  return (
    <button type="button" className={styles.button} onClick={openAsk}>
      <MessageSquareText aria-hidden size={18} strokeWidth={2.25} />
      Ask the assistant
    </button>
  );
}
