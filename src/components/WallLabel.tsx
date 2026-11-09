import type { Project } from '@/data/projects';
import { cn } from '@/lib/utils';
import { ExternalLink } from './ExternalLink';

interface Props {
  project: Project;
  titleId: string;
  size?: 'large' | 'regular';
  className?: string;
}

/** A gallery wall label: title, medium and date, provenance, a short description and where to see it. */
export function WallLabel({ project, titleId, size = 'regular', className }: Props) {
  return (
    <div className={className}>
      <h3
        id={titleId}
        className={cn(
          'font-semiwide font-semibold leading-[1.05] tracking-[-0.02em]',
          size === 'large' ? 'text-[clamp(1.75rem,1.45rem+0.8vw,2.125rem)]' : 'text-2xl',
        )}
      >
        {project.title}
      </h3>
      <p className="mt-2 text-[0.9375rem] leading-snug text-graphite">
        {project.medium}, {project.year}
        <br />
        {project.provenance}
      </p>
      <p className={cn('mt-4 max-w-[42ch]', size === 'large' ? 'text-[1.0625rem]' : 'text-base')}>
        {project.summary}
      </p>
      <p className="mt-3 flex flex-wrap gap-x-5">
        <ExternalLink href={project.liveUrl}>Visit the live site</ExternalLink>
        <ExternalLink href={project.repoUrl}>View the code</ExternalLink>
      </p>
    </div>
  );
}
