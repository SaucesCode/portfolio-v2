'use client';

import Image from 'next/image';
import { MoveVertical } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { categoryLabels, galleryProjects, type Category, type Project } from '@/data/projects';
import { ExternalLink } from './ExternalLink';
import { ProjectDialog } from './ProjectDialog';
import styles from './WorkGallery.module.css';

type Filter = 'all' | Category;

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All work' },
  { id: 'software', label: categoryLabels.software },
  { id: 'web', label: categoryLabels.web },
  { id: 'experiments', label: categoryLabels.experiments },
];

/**
 * Rows of two with alternating weights (7/5, 5/7, 6/6); the second piece in each row hangs a
 * little lower, so the wall never reads as a uniform grid whichever filter is active.
 */
const slots = [
  'lg:col-span-7',
  'lg:col-span-5 md:mt-16',
  'lg:col-span-5',
  'lg:col-span-7 md:mt-16',
  'lg:col-span-6',
  'lg:col-span-6 md:mt-16',
];

const count = (filter: Filter) => (filter === 'all' ? galleryProjects.length : galleryProjects.filter((p) => p.category === filter).length);

type Kind = 'software' | 'website' | 'other';

const kindOf = (project: Project): Kind =>
  project.captures ? 'website' : project.category === 'software' ? 'software' : 'other';

/** The screenshot, matted when it is not 16:10, with an optional action chip resting on its lower edge. */
function PosterFrame({ project, chip }: { project: Project; chip?: { icon: typeof MoveVertical; label: string } }) {
  const contain = project.posterFit === 'contain';
  const Icon = chip?.icon;
  return (
    <span className={styles.frame} data-kind={kindOf(project)} data-fit={contain ? 'contain' : 'cover'} data-morph>
      <Image
        src={project.poster.src}
        width={project.poster.width}
        height={project.poster.height}
        sizes={contain ? '(min-width: 1024px) 18vw, 40vw' : '(min-width: 1024px) 56vw, (min-width: 768px) 48vw, 92vw'}
        alt={`${project.title}${contain ? ' interface' : ' homepage'}`}
      />
      {chip && Icon && (
        <span className={styles.chip}>
          {chip.label}
          <span className={styles.knob} aria-hidden>
            <Icon size={15} strokeWidth={2.25} />
            <Icon size={15} strokeWidth={2.25} />
          </span>
        </span>
      )}
    </span>
  );
}

function PosterAction({ project }: { project: Project }) {
  if (project.captures) {
    return (
      <ProjectDialog project={project}>
        <span className="group block">
          <PosterFrame project={project} chip={{ icon: MoveVertical, label: 'View the full page' }} />
        </span>
      </ProjectDialog>
    );
  }
  return <PosterFrame project={project} />;
}

export function WorkGallery() {
  const [filter, setFilter] = useState<Filter>('all');
  const visible = galleryProjects.filter((p) => filter === 'all' || p.category === filter);

  const choose = (next: Filter) => {
    if (next === filter) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // View transitions animate each piece to its new place; browsers without them just swap.
    if (!reduced && 'startViewTransition' in document) {
      document.startViewTransition(() => flushSync(() => setFilter(next)));
    } else {
      setFilter(next);
    }
  };

  const status =
    filter === 'all' ? `Showing all ${visible.length} projects` : `Showing ${visible.length} projects in ${categoryLabels[filter]}`;

  return (
    <section id="work" aria-labelledby="work-title" className="mx-auto mt-24 max-w-[90rem] scroll-mt-20 px-4 sm:mt-32 sm:px-6 lg:mt-40 lg:px-10">
      <div className="grid gap-6 border-t border-rule pt-10 sm:pt-14 lg:grid-cols-12 lg:items-end lg:gap-6">
        <div className="lg:col-span-5">
          <h2
            id="work-title"
            className="font-wide text-[clamp(1.75rem,1.2rem+2vw,3rem)] leading-none font-medium tracking-[-0.03em]"
          >
            Selected work
          </h2>
          <p className="mt-4 max-w-[52ch] text-graphite">
            Software, websites and the occasional experiment. Concept builds are made for fictional brands; personal
            projects are my own products and tools.
          </p>
        </div>
        <div
          role="group"
          aria-label="Filter work by category"
          className="flex flex-wrap gap-2 lg:col-span-7 lg:justify-end"
        >
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => choose(item.id)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rule px-4 text-[0.9375rem] font-medium text-graphite transition-[color,background-color,border-color,transform] duration-[var(--dur-micro)] hover:border-ink hover:text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-wall active:scale-[0.97]"
            >
              {item.label}
              <span className="tabular-nums opacity-70">{count(item.id)}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>

      <ul className="mt-12 grid gap-x-6 gap-y-14 sm:mt-14 md:grid-cols-2 md:gap-x-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-20">
        {visible.map((project, index) => (
          <li
            key={project.slug}
            data-category={project.category}
            className={slots[index % slots.length]}
            style={{ viewTransitionName: `work-${project.slug}` } as CSSProperties}
          >
            <article id={`work-${project.slug}`} aria-labelledby={`tile-${project.slug}`} className="scroll-mt-24">
              <PosterAction project={project} />
              <div className="mt-5 sm:mt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3
                    id={`tile-${project.slug}`}
                    className="font-semiwide text-[1.375rem] leading-tight font-semibold tracking-[-0.015em] sm:text-2xl"
                  >
                    {project.title}
                  </h3>
                  <p className="text-[0.9375rem] text-graphite">
                    {project.medium}, {project.year}
                  </p>
                </div>
                <p className="mt-2 max-w-[52ch]">{project.summary}</p>
                <div className="mt-3 flex flex-col gap-1 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                  <p className="max-w-[48ch] text-[0.875rem] leading-snug text-graphite lg:pt-2.5">
                    {project.provenance}.{project.note ? ` ${project.note}` : ''}
                  </p>
                  <p className="flex flex-wrap gap-x-5 lg:shrink-0">
                    {project.links.map((link) => (
                      <ExternalLink key={link.href} href={link.href}>
                        {link.label}
                      </ExternalLink>
                    ))}
                  </p>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
