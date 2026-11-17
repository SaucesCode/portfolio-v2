import { inquiryHref } from '@/data/site';
import { terms } from '@/data/terms';
import { ButtonLink } from './ButtonLink';

/** How a project runs, from the first call to after launch. Prices are agreed per project, never listed. */
export function WorkingTogether() {
  return (
    <section
      id="process"
      aria-labelledby="process-title"
      className="mx-auto mt-28 grid max-w-[90rem] scroll-mt-20 gap-10 px-4 sm:mt-40 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-10"
    >
      <div className="lg:col-span-4">
        <h2
          id="process-title"
          className="font-wide text-[clamp(1.75rem,1.2rem+2vw,3rem)] leading-none font-medium tracking-[-0.03em]"
        >
          Working together
        </h2>
        <p className="mt-5 max-w-[40ch] text-graphite">
          How a project runs, from the first call to after launch, wherever you are.
        </p>
      </div>

      <div className="lg:col-span-7 lg:col-start-6">
        <ol className="grid gap-x-10 gap-y-10 border-t border-rule pt-8 sm:grid-cols-2">
          {terms.map((term, index) => (
            <li key={term.id}>
              <p className="text-[0.9375rem] font-medium text-graphite tabular-nums" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="font-semiwide mt-1 text-xl leading-tight font-semibold tracking-[-0.01em]">{term.title}</h3>
              <p className="mt-3 max-w-[48ch]">{term.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <ButtonLink href={inquiryHref} icon="mail" inquiry>
            Start a project
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
