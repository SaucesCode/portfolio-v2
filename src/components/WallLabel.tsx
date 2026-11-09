import { categoryLabels, type Project } from '@/data/projects';
import { cn } from '@/lib/utils';
import { ExternalLink } from './ExternalLink';

interface Props {
  project: Project;
  titleId: string;
  size?: 'large' | 'regular';
  className?: string;
}

/** A gallery wall label: category, title, medium and date, provenance, a short description and links. */
export function WallLabel({ project, titleId, size = 'regular', className }: Props) {
  return (
    <div className={className}>
      <p className="text-[0.9375rem] font-medium text-signal">{categoryLabels[project.category]}</p>
      <h3
        id={titleId}
        className={cn(
          'font-semiwide mt-2 font-semibold tracking-[-0.02em]',
          size === 'large' ? 'text-[clamp(1.75rem,1.45rem+0.8vw,2.125rem)]/[1.05]' : 'text-2xl/[1.1]',
        )}
      >
        {project.title}
      </h3>
      <p className="mt-2 text-[0.9375rem] leading-snug text-graphite">
        {project.medium}, {project.year}
        <br />
        {project.provenance}
      </p>
      <p className={cn('mt-4 max-w-[42ch]', size === 'large' ? 'text-[1.0625rem]' : 'text-base')}>{project.summary}</p>
      {project.note && <p className="mt-3 max-w-[42ch] text-[0.875rem] leading-snug text-graphite">{project.note}</p>}
      <p className="mt-3 flex flex-wrap gap-x-5">
        {project.links.map((link) => (
          <ExternalLink key={link.href} href={link.href}>
            {link.label}
          </ExternalLink>
        ))}
      </p>
    </div>
  );
}
