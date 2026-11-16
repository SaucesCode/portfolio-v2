import Link from 'next/link';
import { inquiryHref, site } from '@/data/site';
import { ButtonLink } from './ButtonLink';

const sections = [
  { id: 'featured', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'working', label: 'Pricing' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

const linkClass =
  'inline-flex min-h-11 items-center text-[0.9375rem] font-medium text-graphite transition-colors duration-[var(--dur-micro)] hover:text-ink';

const wordmarkClass =
  'font-semiwide inline-flex min-h-11 items-center text-[0.9375rem] font-semibold tracking-[-0.01em] sm:text-[1.0625rem] lg:text-lg';

/**
 * On the homepage the links jump within the page. Elsewhere they lead back to the same sections
 * of the homepage, except Contact, which every page ends with.
 */
export function SiteHeader({ onHome = true }: { onHome?: boolean }) {
  const href = (id: string) => (onHome || id === 'contact' ? `#${id}` : `/#${id}`);

  return (
    <header className="sticky top-0 z-40 bg-wall [view-transition-name:site-header]">
      <div className="mx-auto flex min-h-16 max-w-[90rem] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-6 lg:min-h-20 lg:px-10">
        {onHome ? (
          <a href="#top" className={wordmarkClass}>
            {site.name}
          </a>
        ) : (
          <Link href="/" className={wordmarkClass}>
            {site.name}
          </Link>
        )}
        <nav aria-label="Primary" className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <ul className="hidden items-center gap-4 md:flex lg:gap-6">
            {sections.map((section) => (
              // On tablets the "Start a project" button beside the list stands in for Contact, so the row fits.
              <li key={section.id} className={section.id === 'contact' ? 'hidden lg:block' : undefined}>
                {href(section.id).startsWith('/') ? (
                  <Link href={href(section.id)} className={linkClass}>
                    {section.label}
                  </Link>
                ) : (
                  <a href={href(section.id)} className={linkClass}>
                    {section.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <ButtonLink href={inquiryHref} size="small" icon="mail">
            <span className="sm:hidden">Contact</span>
            <span className="hidden sm:inline">Start a project</span>
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
