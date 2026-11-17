import { ArrowDown, ArrowRight, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './ButtonLink.module.css';

type Icon = 'right' | 'down' | 'mail';

interface Props {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'inverse';
  size?: 'small' | 'regular';
  icon?: Icon;
  className?: string;
  /** Opens the project form instead of a mail app; a string starts the message. */
  inquiry?: string | true;
}

const icons: Record<Icon, typeof ArrowRight> = { right: ArrowRight, down: ArrowDown, mail: Mail };

/** A capsule link with a knob compartment; the icon is drawn twice so hover can hand one through. */
export function ButtonLink({ href, children, variant = 'primary', size = 'regular', icon = 'right', className, inquiry }: Props) {
  const Glyph = icons[icon];
  return (
    <a
      href={href}
      data-icon={icon}
      data-inquiry={inquiry === true ? '' : inquiry}
      className={cn(
        styles.button,
        variant === 'outline' && styles.outline,
        variant === 'inverse' && styles.inverse,
        size === 'small' && styles.small,
        className,
      )}
    >
      <span>{children}</span>
      <span className={styles.knob} aria-hidden>
        <Glyph size={size === 'small' ? 15 : 17} strokeWidth={2.25} />
        <Glyph size={size === 'small' ? 15 : 17} strokeWidth={2.25} />
      </span>
    </a>
  );
}
