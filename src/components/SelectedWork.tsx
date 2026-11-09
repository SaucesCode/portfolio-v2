import Image from 'next/image';
import { MoveVertical } from 'lucide-react';
import { featured, supporting, type Project } from '@/data/projects';
import { cn } from '@/lib/utils';
import { FullLengthViewer } from './FullLengthViewer';
import { ProjectDialog } from './ProjectDialog';
import { WallLabel } from './WallLabel';

const featuredSizes = {
  desktop: '(min-width: 1024px) 60vw, (min-width: 768px) 76vw, 80vw',
  phone: '(min-width: 768px) 260px, 78vw',
};

function SupportingPiece({ project, className }: { project: Project; className?: string }) {
  return (
    <article id={project.slug} aria-labelledby={`${project.slug}-title`} className={className}>
      <ProjectDialog project={project}>
        <span className="group block">
          <span className="block overflow-hidden rounded-[2px] shadow-hang">
            <Image
              src={project.poster.src}
              width={project.poster.width}
              height={project.poster.height}
              sizes="(min-width: 1024px) 50vw, 92vw"
              alt={`Homepage of ${project.title}`}
              className="block h-auto w-full transition-transform duration-[var(--dur-page)] ease-out group-hover:scale-[1.015]"
            />
          </span>
          <span className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-[2px] border border-rule px-4 text-[0.9375rem] font-medium transition-colors duration-[var(--dur-micro)] group-hover:border-ink">
            <MoveVertical aria-hidden size={16} />
            View the full page
          </span>
        </span>
      </ProjectDialog>
      <WallLabel project={project} className="mt-6" titleId={`${project.slug}-title`} />
    </article>
  );
}

export function SelectedWork() {
  const captures = featured.captures;
  if (!captures) throw new Error('The featured project needs full-length captures.');

  return (
    <section id="work" aria-labelledby="work-title" className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
      <h2 id="work-title" className="sr-only">
        Selected work
      </h2>

      <article
        id={featured.slug}
        aria-labelledby={`${featured.slug}-title`}
        className="grid gap-8 lg:grid-cols-12 lg:gap-6"
      >
        {/* The site comes first on small screens; on large screens the label hangs to its left. */}
        <div className="enter-hang lg:col-span-9 lg:col-start-4 lg:row-start-1">
          <FullLengthViewer title={featured.title} captures={captures} sizes={featuredSizes} priority />
        </div>
        <WallLabel
          project={featured}
          size="large"
          titleId={`${featured.slug}-title`}
          className="lg:col-span-3 lg:col-start-1 lg:row-start-1"
        />
      </article>

      <div className="mt-24 grid gap-20 sm:mt-32 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0">
        {supporting.map((project, index) => (
          <SupportingPiece
            key={project.slug}
            project={project}
            className={cn(
              index === 0 ? 'lg:col-span-7' : 'lg:col-span-4 lg:col-start-9 lg:mt-56',
              index === 1 && 'sm:ml-[16%] lg:ml-0',
            )}
          />
        ))}
      </div>
    </section>
  );
}
