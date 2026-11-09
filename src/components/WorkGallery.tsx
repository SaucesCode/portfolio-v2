'use client';

import Image from 'next/image';
import { CirclePlay, MoveVertical } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { categoryLabels, projects, type Category, type Project } from '@/data/projects';
import { cn } from '@/lib/utils';
import { ExternalLink } from './ExternalLink';
import { ProjectDialog } from './ProjectDialog';

type Filter = 'all' | Category;

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All work' },
  { id: 'software', label: categoryLabels.software },
  { id: 'web', label: categoryLabels.web },
  { id: 'experiments', label: categoryLabels.experiments },
];

/**
 * Rows of two with alternating weights (7/5, 5/7, 6/6); the second piece in each row hangs
 * lower, so the wall never reads as a uniform grid whichever filter is active.
 */
const slots = [
  'lg:col-span-7',
  'lg:col-span-5 md:mt-24',
  'lg:col-span-5',
  'lg:col-span-7 md:mt-24',
  'lg:col-span-6',
  'lg:col-span-6 md:mt-24',
];

const count = (filter: Filter) => (filter === 'all' ? projects.length : projects.filter((p) => p.category === filter).length);

function PosterFrame({ project }: { project: Project }) {
  const contain = project.posterFit === 'contain';
  return (
    <span
      className={cn(
        'relative block aspect-[1440/900] overflow-hidden rounded-[2px] shadow-hang',
        contain ? 'bg-[#16181b]' : 'bg-chalk',
      )}
    >
      <Image
        src={project.poster.src}
        width={project.poster.width}
        height={project.poster.height}
        sizes={contain ? '(min-width: 1024px) 18vw, 40vw' : '(min-width: 1024px) 56vw, (min-width: 768px) 48vw, 92vw'}
        alt={`${project.title}${contain ? ' interface' : ' homepage'}`}
        className={cn(
          'transition-transform duration-[var(--dur-page)] ease-out group-hover:scale-[1.015]',
          contain ? 'absolute inset-0 m-auto h-[86%] w-auto' : 'block h-auto w-full',
        )}
      />
    </span>
  );
}

function PosterAction({ project }: { project: Project }) {
  const chip = (icon: ReactNode, text: string) => (
    <span className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-[2px] border border-rule px-4 text-[0.9375rem] font-medium transition-colors duration-[var(--dur-micro)] group-hover:border-ink">
      {icon}
      {text}
    </span>
  );

  if (project.walkthrough) {
    return (
      <a href={`#${project.slug}`} className="group block" aria-label={`Take the guided tour of ${project.title}`}>
        <PosterFrame project={project} />
        {chip(<CirclePlay aria-hidden size={16} />, 'Take the guided tour')}
      </a>
    );
  }
  if (project.captures) {
    return (
      <ProjectDialog project={project}>
        <span className="group block">
          <PosterFrame project={project} />
          {chip(<MoveVertical aria-hidden size={16} />, 'View the full page')}
        </span>
      </ProjectDialog>
    );
  }
  return <PosterFrame project={project} />;
}

export function WorkGallery() {
  const [filter, setFilter] = useState<Filter>('all');
  const visible = projects.filter((p) => filter === 'all' || p.category === filter);

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
    <section id="work" aria-labelledby="work-title" className="mx-auto mt-28 max-w-[90rem] scroll-mt-20 px-4 sm:mt-40 sm:px-6 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-6">
        <div className="lg:col-span-6">
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
          className="-mx-1 flex flex-wrap gap-1 lg:col-span-6 lg:justify-end"
        >
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => choose(item.id)}
              className="inline-flex min-h-11 items-center gap-2 rounded-[2px] px-3.5 text-[0.9375rem] font-medium text-graphite transition-colors duration-[var(--dur-micro)] hover:bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] hover:text-ink aria-pressed:bg-ink aria-pressed:text-wall active:translate-y-px"
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

      <ul className="mt-12 grid gap-x-6 gap-y-16 sm:mt-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-y-24">
        {visible.map((project, index) => (
          <li
            key={project.slug}
            data-category={project.category}
            className={slots[index % slots.length]}
            style={{ viewTransitionName: `work-${project.slug}` } as CSSProperties}
          >
            <article id={`work-${project.slug}`} aria-labelledby={`tile-${project.slug}`} className="scroll-mt-24">
              <PosterAction project={project} />
              <div className="mt-5 max-w-[46ch]">
                <p className="text-[0.9375rem] text-graphite">
                  {categoryLabels[project.category]}, {project.year}
                </p>
                <h3
                  id={`tile-${project.slug}`}
                  className="font-semiwide mt-1 text-2xl leading-tight font-semibold tracking-[-0.015em]"
                >
                  {project.title}
                </h3>
                <p className="mt-2">{project.summary}</p>
                <p className="mt-2 text-[0.875rem] leading-snug text-graphite">
                  {project.provenance}.{project.note ? ` ${project.note}` : ''}
                </p>
                <p className="mt-2 flex flex-wrap gap-x-5">
                  {project.links.map((link) => (
                    <ExternalLink key={link.href} href={link.href}>
                      {link.label}
                    </ExternalLink>
                  ))}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
