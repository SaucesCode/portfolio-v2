'use client';

import { X } from 'lucide-react';
import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import type { Project } from '@/data/projects';
import { FullLengthViewer } from './FullLengthViewer';
import { ExternalLink } from './ExternalLink';
import styles from './ProjectDialog.module.css';

interface Props {
  project: Project;
  /** The poster shown on the page; it becomes the button that opens the dialog. */
  children: ReactNode;
}

/**
 * Opens a project's full-length preview in a modal that wears the project's own
 * palette and display face, while the controls keep the portfolio's behaviour.
 */
export function ProjectDialog({ project, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const { brand, captures } = project;

  if (!captures) return <>{children}</>;

  const theme = brand
    ? ({
        '--wall': brand.ground,
        '--chalk': brand.surface,
        '--ink': brand.ink,
        '--graphite': brand.muted,
        '--rule': `color-mix(in srgb, ${brand.ink} 22%, transparent)`,
        '--signal': brand.accent,
        '--signal-ink': brand.ground,
        '--brand-display': brand.displayFont ? `var(${brand.displayFont})` : 'inherit',
      } as CSSProperties)
    : undefined;

  const openNow = () => {
    flushSync(() => setOpen(true));
    dialogRef.current?.showModal();
  };

  /**
   * The card's screenshot grows into the dialog sheet: the same FLIP handoff the hero uses. The
   * sheet starts on the card's rect and travels to its own; its contents fade in once it is open.
   */
  const show = () => {
    const card = triggerRef.current?.querySelector<HTMLElement>('[data-morph]');
    const from = card?.getBoundingClientRect();
    openNow();
    const sheet = sheetRef.current;
    if (!from || !sheet || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const to = sheet.getBoundingClientRect();
    sheet.animate(
      [
        {
          transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`,
        },
        { transform: 'none' },
      ],
      { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
    for (const child of Array.from(sheet.children)) {
      child.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, delay: 240, easing: 'ease-out', fill: 'backwards' });
    }
  };

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={show}
        aria-haspopup="dialog"
        aria-label={`View the full ${project.title} page`}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        style={theme}
        aria-labelledby={titleId}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div ref={sheetRef} className={styles.sheet}>
          <header className={styles.header}>
            <div>
              <h3 id={titleId} className={styles.title}>
                {project.title}
              </h3>
              <p className={styles.meta}>
                {project.medium}, {project.year}. {project.provenance}.
              </p>
            </div>
            <button type="button" className={styles.close} onClick={close}>
              <X aria-hidden size={20} />
              <span className="sr-only">Close preview</span>
            </button>
          </header>

          <div className={styles.viewer}>
            {open && (
              <FullLengthViewer
                title={project.title}
                captures={captures}
                sizes={{ desktop: '(min-width: 768px) 70vw, 90vw', phone: '(min-width: 768px) 280px, 75vw' }}
              />
            )}
          </div>

          <footer className={styles.footer}>
            {project.links.map((link) => (
              <ExternalLink key={link.href} href={link.href}>
                {link.label}
              </ExternalLink>
            ))}
          </footer>
        </div>
      </dialog>
    </>
  );
}
