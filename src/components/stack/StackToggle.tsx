import { Layers } from 'lucide-react';
import styles from '../live/LiveControls.module.css';

/**
 * Opens the hero's app into its layers and puts it back together. The label names the action, so
 * it is the whole state; aria-pressed beside a changing name would contradict it.
 */
export function StackToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button type="button" data-open={open} className={styles.toggle} onClick={onToggle}>
      <Layers aria-hidden size={16} strokeWidth={2.25} />
      {open ? 'Put it back together' : 'See what’s underneath'}
    </button>
  );
}
