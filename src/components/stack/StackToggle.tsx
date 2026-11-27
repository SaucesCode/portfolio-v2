import { useId } from 'react';
import { Layers } from 'lucide-react';
import styles from '../live/LiveControls.module.css';

/**
 * Opens the hero's app into its layers and puts it back together. The label names the action, so
 * it is the whole state; aria-pressed beside a changing name would contradict it. The hint tells a
 * visitor who sold with the stack closed that the sale went underneath too.
 */
export function StackToggle({ open, hint, onToggle }: { open: boolean; hint: boolean; onToggle: () => void }) {
  const hintId = useId();
  return (
    <span className={styles.toggleWrap}>
      <button
        type="button"
        data-open={open}
        className={styles.toggle}
        aria-describedby={hint ? hintId : undefined}
        onClick={onToggle}
      >
        <Layers aria-hidden size={16} strokeWidth={2.25} />
        {open ? 'Put it back together' : 'See what’s underneath'}
      </button>
      {hint && (
        <span id={hintId} className={styles.hint}>
          Your sale went underneath too
        </span>
      )}
    </span>
  );
}
