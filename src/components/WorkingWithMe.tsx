import { services } from '@/data/services';
import { inquiryHref } from '@/data/site';
import { formatUsd, terms } from '@/data/terms';
import { ButtonLink } from './ButtonLink';

const priceList = services
  .filter((service) => service.fromUsd && service.priceLabel)
  .sort((a, b) => a.fromUsd! - b.fromUsd!);

/** Prices, timelines and terms, so a client can decide before writing. */
export function WorkingWithMe() {
  return (
    <section
      id="working"
      aria-labelledby="working-title"
      className="mx-auto mt-28 grid max-w-[90rem] scroll-mt-20 gap-10 px-4 sm:mt-40 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-10"
    >
      <div className="lg:col-span-4">
        <h2
          id="working-title"
          className="font-wide text-[clamp(1.75rem,1.2rem+2vw,3rem)] leading-none font-medium tracking-[-0.03em]"
        >
          Working with me
        </h2>
        <p className="mt-5 max-w-[40ch] text-graphite">
          What a project costs, how long it takes, and how we’ll work together, before you write a word.
        </p>
      </div>

      <div className="lg:col-span-7 lg:col-start-6">
        <ul className="grid gap-y-8 border-t border-rule pt-6 sm:grid-cols-3 sm:gap-x-6">
          {priceList.map((service) => (
            <li key={service.id} className="flex flex-col [container-type:inline-size]">
              <p className="text-[0.9375rem] text-graphite">{service.priceLabel} from</p>
              {/* Sized from the column's own width, so the widest price never spills out of a narrow column. */}
              <p className="font-wide mt-auto pt-2 text-[min(2.25rem,17cqi)] leading-none font-medium tracking-[-0.03em] tabular-nums">
                {formatUsd(service.fromUsd!)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {terms.map((term) => (
            <div key={term.id}>
              <h3 className="font-semiwide text-xl leading-tight font-semibold tracking-[-0.01em]">{term.title}</h3>
              <p className="mt-3 max-w-[48ch]">{term.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <ButtonLink href={inquiryHref} icon="mail">
            Start a project
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
