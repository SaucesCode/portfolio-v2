'use client';

import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { categoryLabels, featuredSoftware, featuredWebsite, type Shot } from '@/data/projects';
import styles from './HeroShowcase.module.css';

export type Discipline = 'software' | 'web';

interface Artifact {
  id: Discipline;
  label: string;
  title: string;
  medium: string;
  shot: Shot;
  href: string;
  action: string;
}

const artifacts: Artifact[] = [
  {
    id: 'software',
    label: categoryLabels.software,
    title: featuredSoftware.title,
    medium: featuredSoftware.medium,
    shot: featuredSoftware.walkthrough?.[0].shot ?? featuredSoftware.poster,
    href: `#${featuredSoftware.slug}`,
    action: 'Take the guided tour',
  },
  {
    id: 'web',
    label: 'Web & Experiences',
    title: featuredWebsite.title,
    medium: featuredWebsite.medium,
    shot: featuredWebsite.poster,
    href: `#${featuredWebsite.slug}`,
    action: 'Preview the full site',
  },
];

const headline: Record<Discipline, string> = {
  software: 'Software that works.',
  web: 'Experiences that stand out.',
};

/**
 * The hero's two headline lines and two real project windows are one control. Hover or focus
 * previews a discipline; selecting it (click, tap, Enter or the arrow keys) keeps it in front
 * and points the caption at that project's featured section.
 */
export function HeroShowcase({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Discipline>('software');
  const [preview, setPreview] = useState<Discipline | null>(null);
  const radios = useRef<Record<Discipline, HTMLButtonElement | null>>({ software: null, web: null });
  const active = preview ?? selected;
  const current = artifacts.find((a) => a.id === active)!;

  const hover = (id: Discipline | null) => (event: PointerEvent) => {
    if (event.pointerType === 'mouse') setPreview(id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const next: Discipline = selected === 'software' ? 'web' : 'software';
    setSelected(next);
    setPreview(null);
    radios.current[next]?.focus();
  };

  return (
    <div className={styles.hero} data-active={active}>
      <div className={styles.copy}>
        <h1 id="intro-title" className={styles.headline}>
          {(['software', 'web'] as const).map((id) => (
            <span
              key={id}
              className={id === 'software' ? styles.lineSoftware : styles.lineWeb}
              data-lit={active === id}
              onPointerEnter={hover(id)}
              onPointerLeave={hover(null)}
            >
              <span className={styles.lineInner}>{headline[id]}</span>
            </span>
          ))}
        </h1>
        {children}
      </div>

      <div className={styles.visual}>
        <div
          className={styles.stack}
          role="radiogroup"
          aria-label="Highlight a discipline"
          onKeyDown={onKeyDown}
          onPointerLeave={hover(null)}
        >
          {artifacts.map((artifact, index) => (
            <div key={artifact.id} className={styles.slot} data-slot={artifact.id}>
              <button
                ref={(node) => {
                  radios.current[artifact.id] = node;
                }}
                type="button"
                role="radio"
                aria-checked={selected === artifact.id}
                aria-label={`${artifact.label}: ${artifact.title}`}
                tabIndex={selected === artifact.id ? 0 : -1}
                className={styles.window}
                data-front={active === artifact.id}
                onClick={() => {
                  setSelected(artifact.id);
                  setPreview(null);
                }}
                onFocus={() => setPreview(null)}
                onPointerEnter={hover(artifact.id)}
              >
                <span className={styles.frame}>
                  <Image
                    src={artifact.shot.src}
                    width={artifact.shot.width}
                    height={artifact.shot.height}
                    sizes="(min-width: 1024px) 40vw, 80vw"
                    alt=""
                    loading="eager"
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    draggable={false}
                  />
                  {artifact.id === 'software' && <span className={styles.demo}>Demonstration data</span>}
                </span>
                <span className={styles.tag}>{artifact.label}</span>
              </button>
            </div>
          ))}
        </div>

        <p className={styles.caption} aria-live="polite">
          <span className={styles.captionTitle}>{current.title}</span>
          <span className={styles.captionMedium}>{current.medium}</span>
          <a href={current.href} className={styles.captionLink}>
            {current.action}
            <ArrowDown aria-hidden size={16} />
          </a>
        </p>
      </div>
    </div>
  );
}
