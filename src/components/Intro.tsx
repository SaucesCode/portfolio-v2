import { inquiryHref, site } from '@/data/site';
import { ButtonLink } from './ButtonLink';

export function Intro() {
  return (
    <section
      aria-labelledby="intro-title"
      className="mx-auto grid max-w-[90rem] gap-8 px-4 pt-10 pb-12 sm:px-6 sm:pt-14 lg:grid-cols-12 lg:gap-6 lg:px-10 lg:pt-16 lg:pb-14"
    >
      <h1
        id="intro-title"
        className="font-wide enter-settle text-[clamp(2.375rem,1.2rem+4vw,4.75rem)] leading-[0.98] font-medium tracking-[-0.035em] text-balance lg:col-span-8"
      >
        Websites, built to be looked at closely.
      </h1>
      <div className="max-w-[46ch] lg:col-span-4 lg:self-end">
        <p className="text-[1.0625rem] leading-relaxed text-pretty sm:text-lg">
          I’m {site.name}, a web designer and developer in the {site.country}. I build WordPress themes, online
          stores, landing pages and the custom systems behind them.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ButtonLink href={inquiryHref}>Start a project</ButtonLink>
          <a
            href="#work"
            className="inline-flex min-h-11 items-center font-semibold underline decoration-1 underline-offset-4 decoration-[color-mix(in_srgb,currentColor_35%,transparent)] transition-colors duration-[var(--dur-micro)] hover:decoration-current"
          >
            See the work
          </a>
        </div>
      </div>
    </section>
  );
}
