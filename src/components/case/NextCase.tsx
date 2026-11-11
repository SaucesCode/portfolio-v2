import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { caseStudies, categoryLabels } from '@/data/projects';

/** Leads from one case study to the next, and back to the rest of the work on the homepage. */
export function NextCase({ current }: { current: string }) {
  const index = caseStudies.findIndex((project) => project.slug === current);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <nav aria-labelledby="next-case-title" className="mx-auto mt-28 max-w-[90rem] px-4 sm:mt-40 sm:px-6 lg:px-10">
      <h2 id="next-case-title" className="text-[0.9375rem] font-medium text-graphite">
        Next case study
      </h2>
      <Link
        href={next.caseStudy}
        className="group mt-4 grid items-end gap-6 border-t border-rule pt-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-10"
      >
        <span>
          <span className="block text-[0.9375rem] font-medium text-signal">{categoryLabels[next.category]}</span>
          <span className="font-wide mt-2 flex items-center gap-4 text-[clamp(2rem,1.3rem+3vw,4rem)] leading-[1] font-medium tracking-[-0.035em]">
            {next.title}
            <ArrowRight
              aria-hidden
              className="size-[0.6em] shrink-0 transition-transform duration-[var(--dur-component)] ease-out group-hover:translate-x-2"
              strokeWidth={2}
            />
          </span>
          <span className="mt-3 block max-w-[52ch] text-graphite">
            {next.medium}. {next.summary}
          </span>
        </span>
        <span className="block overflow-hidden rounded-[var(--radius-frame)] shadow-hang">
          <Image
            src={next.poster.src}
            width={next.poster.width}
            height={next.poster.height}
            sizes="(min-width: 640px) 22rem, 92vw"
            alt=""
            loading="lazy"
            className="block h-auto w-full transition-transform duration-[var(--dur-page)] ease-out group-hover:scale-[1.02]"
          />
        </span>
      </Link>
      <Link
        href="/#work"
        className="mt-8 inline-flex min-h-11 items-center gap-2 font-medium text-graphite underline decoration-1 underline-offset-4 decoration-[color-mix(in_srgb,currentColor_35%,transparent)] transition-colors duration-[var(--dur-micro)] hover:text-ink hover:decoration-current"
      >
        <ArrowLeft aria-hidden size={16} />
        See all selected work
      </Link>
    </nav>
  );
}
