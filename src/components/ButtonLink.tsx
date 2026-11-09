import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'inverse';
  size?: 'small' | 'regular';
  className?: string;
}

const variants = {
  primary: 'bg-signal text-signal-ink hover:bg-signal-hover',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-wall',
  inverse: 'bg-wall text-ink hover:bg-chalk',
};

export function ButtonLink({ href, children, variant = 'primary', size = 'regular', className }: Props) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-[2px] font-semibold whitespace-nowrap transition-[background-color,color,transform] duration-[var(--dur-micro)] ease-out active:translate-y-px',
        size === 'small' ? 'px-4 text-[0.9375rem]' : 'px-6 text-base sm:min-h-12',
        variants[variant],
        className,
      )}
    >
      {children}
    </a>
  );
}
