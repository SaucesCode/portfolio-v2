'use client';

import { Maximize2, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LiveDashboard } from './LiveDashboard';
import { SaleControls } from './SaleControls';
import type { RowszeinDemo } from './useRowszeinDemo';
import styles from './PhoneDemo.module.css';

/** The hero's phone breakpoint; from here up the window in the hero is large enough to use. */
const WIDE = '(min-width: 37.5rem)';

/**
 * On phones the hero's dashboard is a desktop app squeezed small. This opens it full screen in the
 * app's phone layout, sharing the hero's demo state, so a sale made here is there on closing.
 */
export function PhoneDemo({ demo, announce }: { demo: RowszeinDemo; announce: (message: string) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // The hero's status region is outside this modal, so it is inert while open; the view speaks for itself.
  const [said, setSaid] = useState('');
  const say = (message: string) => {
    setSaid(message);
    announce(message);
  };

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    // Turned sideways or resized past the phone breakpoint: the hero's own window takes over.
    const wide = window.matchMedia(WIDE);
    const onChange = () => wide.matches && dialogRef.current?.close();
    wide.addEventListener('change', onChange);
    return () => {
      root.style.overflow = '';
      wide.removeEventListener('change', onChange);
    };
  }, [open]);

  const show = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };

  return (
    <>
      <button ref={triggerRef} type="button" className={styles.trigger} onClick={show}>
        <Maximize2 aria-hidden size={16} strokeWidth={2.25} />
        Try it full screen
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Rowszein’s Delight demo"
        onClose={() => {
          setOpen(false);
          setSaid('');
          // Turned wide, the button is hidden; focus goes to the hero's own sale buttons instead.
          const trigger = triggerRef.current;
          if (trigger?.getClientRects().length) return trigger.focus();
          const hero = [...document.querySelectorAll<HTMLElement>('[role="group"][aria-label="Try Rowszein’s Delight"] button')].find(
            (button) => !dialogRef.current?.contains(button),
          );
          hero?.focus();
        }}
      >
        <div className={styles.frame}>
          <header className={styles.bar}>
            {/* Part of the picture: the real app's phone menu button. */}
            <Menu aria-hidden size={20} className={styles.menu} />
            <p className={styles.brand}>Rowszein’s Delight</p>
            <button type="button" className={styles.close} aria-label="Close the demo" onClick={() => dialogRef.current?.close()}>
              <X aria-hidden size={20} />
            </button>
          </header>
          <div className={styles.screen}>
            <LiveDashboard state={demo.state} recent={demo.recent} layout="phone" />
          </div>
          <div className={styles.dock}>
            <SaleControls demo={demo} announce={say} />
          </div>
          <p role="status" className="sr-only">
            {said}
          </p>
        </div>
      </dialog>
    </>
  );
}
