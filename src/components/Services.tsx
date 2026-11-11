'use client';

import { useState } from 'react';
import { getProject, isHeroProject } from '@/data/projects';
import { services, stackStops } from '@/data/services';
import styles from './Services.module.css';

/** Featured projects have their own section; the rest live in the gallery. */
const anchorFor = (slug: string) => (isHeroProject(slug) ? `#${slug}` : `#work-${slug}`);

export function Services() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = services.find((service) => service.id === activeId);
  const last = stackStops.length - 1;
  const [from, to] = active?.span ?? [0, last];

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="mx-auto mt-28 grid max-w-[90rem] scroll-mt-20 gap-10 px-4 sm:mt-40 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-10"
    >
      <div className="lg:col-span-4">
        <h2
          id="services-title"
          className="font-wide text-[clamp(1.75rem,1.2rem+2vw,3rem)] leading-none font-medium tracking-[-0.03em]"
        >
          What I can build for you
        </h2>
        <p className="mt-5 max-w-[40ch] text-graphite">
          From a single landing page to a system your whole team runs on. You work with one person from the first
          conversation to launch.
        </p>

        {/* One line from data to design; pointing at a service lights the stretch it covers. */}
        <div className={styles.stack} aria-hidden>
          <div className={styles.track}>
            <span
              className={styles.fill}
              style={{ transform: `translateX(${(from / last) * 100}%) scaleX(${(to - from) / last})` }}
            />
          </div>
          <ol className={styles.stops}>
            {stackStops.map((stop, i) => (
              <li key={stop} data-on={i >= from && i <= to}>
                {stop}
              </li>
            ))}
          </ol>
          <p className={styles.note}>{active ? active.name : 'One engineer for the whole line'}</p>
        </div>
      </div>

      <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
        {services.map((service) => {
          const examples = service.examples.map(getProject);
          return (
            <li
              key={service.id}
              className={styles.service}
              data-active={activeId === service.id}
              onPointerEnter={() => setActiveId(service.id)}
              onPointerLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(service.id)}
              onBlur={() => setActiveId(null)}
            >
              <h3 className="font-semiwide text-xl leading-tight font-semibold tracking-[-0.01em]">{service.name}</h3>
              <p className="mt-3 max-w-[44ch]">{service.description}</p>
              <p className="mt-3 text-[0.9375rem] text-graphite">
                See{' '}
                {examples.map((project, index) => (
                  <span key={project.slug}>
                    {index > 0 && ' and '}
                    <a
                      href={anchorFor(project.slug)}
                      className="inline-flex min-h-11 items-center font-medium text-ink underline decoration-1 underline-offset-4 decoration-[color-mix(in_srgb,currentColor_35%,transparent)] hover:decoration-current"
                    >
                      {project.title}
                    </a>
                  </span>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
