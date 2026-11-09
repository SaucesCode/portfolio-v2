import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ExternalLink({ href, children, className }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex min-h-11 items-center gap-1 font-medium underline decoration-1 underline-offset-4 decoration-[color-mix(in_srgb,currentColor_35%,transparent)] transition-colors duration-[var(--dur-micro)] hover:decoration-current',
        className,
      )}
    >
      {children}
      <ArrowUpRight
        aria-hidden
        size={16}
        className="transition-transform duration-[var(--dur-micro)] ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
