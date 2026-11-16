import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Project } from '@/data/projects';
import { cn } from '@/lib/utils';

/** "Read the case study", for the projects that have one. Renders nothing for the rest. */
export function CaseStudyLink({ project, className }: { project: Project; className?: string }) {
  if (!project.caseStudy) return null;
  return (
    <Link
      href={project.caseStudy}
      aria-label={`Read the case study: ${project.title}`}
      className={cn(
        'group inline-flex min-h-11 items-center gap-2 font-semibold text-signal transition-colors duration-[var(--dur-micro)] hover:text-signal-hover',
        className,
      )}
    >
      Read the case study
      <ArrowRight
        aria-hidden
        size={17}
        strokeWidth={2.25}
        className="transition-transform duration-[var(--dur-micro)] ease-out group-hover:translate-x-1"
      />
    </Link>
  );
}
