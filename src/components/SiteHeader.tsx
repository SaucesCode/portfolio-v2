import { inquiryHref, site } from '@/data/site';
import { ButtonLink } from './ButtonLink';

const links = [
  { href: '#featured', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-wall">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-10">
        <a
          href="#top"
          className="font-semiwide inline-flex min-h-11 items-center text-[0.9375rem] font-semibold tracking-[-0.01em] sm:text-[1.0625rem] lg:text-lg"
        >
          {site.name}
        </a>
        <nav aria-label="Primary" className="flex items-center gap-2 sm:gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-[0.9375rem] font-medium text-graphite transition-colors duration-[var(--dur-micro)] hover:text-ink"
                >
                  {link.label}
                </a>
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
