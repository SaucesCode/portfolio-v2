import { inquiryHref, site } from '@/data/site';
import { ButtonLink } from './ButtonLink';

/**
 * The proposition is set in two widths of the same face: the engineering half condensed and
 * compact, the experience half wide and expressive. One typeface, two temperaments.
 */
export function Intro() {
  return (
    <section
      aria-labelledby="intro-title"
      className="mx-auto max-w-[90rem] px-4 pt-10 pb-12 sm:px-6 sm:pt-14 lg:px-10 lg:pt-14 lg:pb-16"
    >
      <h1
        id="intro-title"
        className="text-[clamp(2.25rem,0.9rem+4.3vw,4.375rem)] leading-[1.02] tracking-[-0.035em] text-balance"
      >
        <span className="font-narrow enter-settle block font-semibold">Software that works.</span>
        <span className="font-wide enter-settle-late block font-medium">Experiences that stand out.</span>
      </h1>
      <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-12 lg:items-end lg:gap-6">
        <p className="max-w-[52ch] text-[1.0625rem] leading-relaxed text-pretty sm:text-lg lg:col-span-6">
          I’m {site.name}, a full-stack software engineer in the {site.country}. I build custom web applications,
          business systems, WordPress sites and themes, and carefully crafted websites.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:col-start-8 lg:justify-end">
          <ButtonLink href={inquiryHref}>Start a project</ButtonLink>
          <a
            href="#featured"
            className="inline-flex min-h-11 items-center font-semibold underline decoration-1 underline-offset-4 decoration-[color-mix(in_srgb,currentColor_35%,transparent)] transition-colors duration-[var(--dur-micro)] hover:decoration-current"
          >
            See the work
          </a>
        </div>
      </div>
    </section>
  );
}
