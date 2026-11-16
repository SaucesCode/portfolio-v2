import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ButtonLink';
import { SiteHeader } from '@/components/SiteHeader';
import { SkipLink } from '@/components/SkipLink';
import { caseStudies } from '@/data/projects';

export const metadata: Metadata = {
  title: 'Page not found',
};

/** A lost visitor gets a plain explanation and a way straight back to the work. */
export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader onHome={false} />
      <main id="main-content" className="mx-auto grid max-w-[90rem] gap-14 px-4 pt-16 pb-28 sm:px-6 sm:pt-24 lg:grid-cols-12 lg:gap-6 lg:px-10">
        <div className="lg:col-span-6">
          <p className="font-wide text-[clamp(4.5rem,3rem+6vw,9rem)] leading-none font-medium tracking-[-0.05em] text-graphite" aria-hidden>
            404
          </p>
          <h1 className="font-wide mt-6 text-[clamp(1.75rem,1.2rem+2vw,3rem)] leading-tight font-medium tracking-[-0.03em]">
            This page doesn’t exist
          </h1>
          <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-graphite">
            The link may be out of date, or the address mistyped. The work is all still here.
          </p>
          <div className="mt-8">
            <ButtonLink href="/" icon="right">
              Back to the homepage
            </ButtonLink>
          </div>
        </div>

        <nav aria-labelledby="case-studies-title" className="lg:col-span-5 lg:col-start-8 lg:pt-4">
          <h2 id="case-studies-title" className="text-[0.9375rem] font-medium text-graphite">
            Case studies
          </h2>
          <ul className="mt-4 border-t border-rule">
            {caseStudies.map((project) => (
              <li key={project.slug} className="border-b border-rule">
                <Link
                  href={project.caseStudy}
                  className="group flex min-h-11 items-center justify-between gap-6 py-5 transition-colors duration-[var(--dur-micro)] hover:text-signal"
                >
                  <span>
                    <span className="font-semiwide block text-xl leading-tight font-semibold tracking-[-0.01em]">
                      {project.title}
                    </span>
                    <span className="mt-1 block text-[0.9375rem] text-graphite">{project.medium}</span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    size={20}
                    className="shrink-0 transition-transform duration-[var(--dur-micro)] ease-out group-hover:translate-x-1"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </>
  );
}
