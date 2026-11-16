import Image from 'next/image';
import { MoveVertical } from 'lucide-react';
import { galleryCards, moreExperiments, type Project } from '@/data/projects';
import { CaseStudyLink } from './CaseStudyLink';
import { ExternalLink } from './ExternalLink';
import { ProjectDialog } from './ProjectDialog';
import styles from './WorkGallery.module.css';

/**
 * Rows of two with alternating weights (7/5, 5/7, 6/6); the second piece in each row hangs a
 * little lower, so the wall never reads as a uniform grid.
 */
const slots = [
  'lg:col-span-7',
  'lg:col-span-5 md:mt-16',
  'lg:col-span-5',
  'lg:col-span-7 md:mt-16',
  'lg:col-span-6',
  'lg:col-span-6 md:mt-16',
];

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
  return (
    <section id="work" aria-labelledby="work-title" className="mx-auto mt-24 max-w-[90rem] scroll-mt-20 overflow-x-clip px-4 sm:mt-32 sm:px-6 lg:mt-40 lg:px-10">
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
      </div>

      <ul className="mt-12 grid gap-x-6 gap-y-14 sm:mt-14 md:grid-cols-2 md:gap-x-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-20">
        {galleryCards.map((project, index) => (
          <li
            key={project.slug}
            data-category={project.category}
            className={slots[index % slots.length]}
          >
            <article
              id={`work-${project.slug}`}
              aria-labelledby={`tile-${project.slug}`}
              className="scroll-mt-24"
              data-reveal={index % 2 === 0 ? 'hang-left' : 'hang-right'}
            >
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
                <div className="mt-3 flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-6">
                  <p className="max-w-[48ch] text-[0.875rem] leading-snug text-graphite lg:pt-2.5">
                    {project.provenance}.{project.note ? ` ${project.note}` : ''}
                  </p>
                  <p className="flex flex-wrap gap-x-5">
                    <CaseStudyLink project={project} />
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

      {moreExperiments.length > 0 && (
        <div className="mt-20 border-t border-rule pt-10 sm:mt-24">
          <h3 className="font-semiwide text-[0.9375rem] font-semibold tracking-[0.01em] text-graphite">More experiments</h3>
          <ul className="mt-6 grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-10">
            {moreExperiments.map((project) => (
              <li key={project.slug} id={`work-${project.slug}`} className="scroll-mt-24">
                <h4 className="font-semiwide text-xl leading-tight font-semibold tracking-[-0.01em]">{project.title}</h4>
                <p className="mt-1 text-[0.9375rem] text-graphite">
                  {project.medium}, {project.year}
                </p>
                <p className="mt-3 max-w-[48ch]">{project.summary}</p>
                <p className="mt-2 max-w-[48ch] text-[0.875rem] leading-snug text-graphite">
                  {project.provenance}.{project.note ? ` ${project.note}` : ''}
                </p>
                <p className="mt-2 flex flex-wrap gap-x-5">
                  {project.links.map((link) => (
                    <ExternalLink key={link.href} href={link.href}>
                      {link.label}
                    </ExternalLink>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
