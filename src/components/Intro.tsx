import { inquiryHref, site } from '@/data/site';
import { ButtonLink } from './ButtonLink';
import { HeroShowcase } from './HeroShowcase';

export function Intro() {
  return (
    <section
      aria-labelledby="intro-title"
      className="mx-auto max-w-[90rem] overflow-x-clip px-4 pt-8 pb-20 sm:px-6 sm:pt-12 sm:pb-28 lg:px-10 lg:pt-6 lg:pb-36"
    >
      <HeroShowcase>
        <p className="mt-6 max-w-[40ch] text-[1.0625rem] leading-relaxed text-pretty sm:text-lg lg:mt-0">
          I’m {site.name}, a full-stack software engineer. I design and build custom applications, business
          systems, WordPress sites and websites, from the database to the last pixel.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <ButtonLink href="#featured" icon="down">
            Explore my work
          </ButtonLink>
          <ButtonLink href={inquiryHref} variant="outline" icon="mail" inquiry>
            Start a project
          </ButtonLink>
        </div>
      </HeroShowcase>
    </section>
  );
}
