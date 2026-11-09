import { inquiryHref, site } from '@/data/site';
import { ButtonLink } from './ButtonLink';
import { ExternalLink } from './ExternalLink';

export function Contact() {
  return (
    <footer id="contact" aria-labelledby="contact-title" className="mt-28 bg-ink text-wall sm:mt-40 [&_:focus-visible]:outline-wall">
      <div className="mx-auto max-w-[90rem] px-4 pt-20 pb-10 sm:px-6 sm:pt-28 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <h2
            id="contact-title"
            className="font-wide text-[clamp(2.25rem,1.2rem+4vw,5rem)] leading-[0.98] font-medium tracking-[-0.035em] text-balance lg:col-span-7"
          >
            Have something to build?
          </h2>
          <div className="max-w-[46ch] lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="text-lg leading-relaxed">
              Tell me what you need: a web application, a system for your team, a WordPress site or a redesign. A few
              sentences is enough to start.
            </p>
            <ButtonLink href={inquiryHref} variant="inverse" icon="mail" className="mt-6">
              Email me about a project
            </ButtonLink>
          </div>
        </div>

        <a
          href={inquiryHref}
          className="font-wide mt-16 inline-block py-2 text-[clamp(1.125rem,0.6rem+2.6vw,2.75rem)] font-medium tracking-[-0.02em] break-all underline decoration-1 underline-offset-[0.2em] decoration-[color-mix(in_srgb,currentColor_35%,transparent)] transition-colors duration-[var(--dur-micro)] hover:decoration-current sm:mt-24 sm:break-normal"
        >
          {site.email}
        </a>

        <div className="mt-16 flex flex-col gap-6 border-t border-[color-mix(in_srgb,var(--wall)_22%,transparent)] pt-6 text-[0.9375rem] sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap gap-x-6">
            <ExternalLink href={site.linkedin}>LinkedIn</ExternalLink>
            <ExternalLink href={site.github}>GitHub ({site.githubHandle})</ExternalLink>
          </p>
          <p className="text-[color-mix(in_srgb,var(--wall)_72%,transparent)]">
            © {new Date().getFullYear()} {site.name}. Screenshots are captures of the projects shown; app screens use
            demonstration data.
          </p>
        </div>
      </div>
    </footer>
  );
}
