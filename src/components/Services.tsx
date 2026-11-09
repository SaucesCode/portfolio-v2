import { getProject } from '@/data/projects';
import { services } from '@/data/services';

export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="mx-auto mt-28 grid max-w-[90rem] gap-10 px-4 sm:mt-40 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-10"
    >
      <div className="lg:col-span-4">
        <h2
          id="services-title"
          className="font-wide text-[clamp(1.75rem,1.2rem+2vw,3rem)] leading-none font-medium tracking-[-0.03em]"
        >
          What I can build for you
        </h2>
        <p className="mt-5 max-w-[40ch] text-graphite">
          From a single landing page to a custom system. You work with one person from the first sketch to launch.
        </p>
      </div>

      <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
        {services.map((service) => {
          const examples = service.examples.map(getProject);
          return (
            <li key={service.id}>
              <h3 className="font-semiwide text-xl leading-tight font-semibold tracking-[-0.01em]">{service.name}</h3>
              <p className="mt-3 max-w-[44ch]">{service.description}</p>
              <p className="mt-3 text-[0.9375rem] text-graphite">
                See{' '}
                {examples.map((project, index) => (
                  <span key={project.slug}>
                    {index > 0 && ' and '}
                    <a
                      href={`#${project.slug}`}
                      className="inline-block py-2 font-medium text-ink underline decoration-1 underline-offset-4 decoration-[color-mix(in_srgb,currentColor_35%,transparent)] hover:decoration-current"
                    >
                      {project.title}
                    </a>
                  </span>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
