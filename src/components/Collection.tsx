import Image from 'next/image';
import { collection } from '@/data/projects';
import { ExternalLink } from './ExternalLink';

export function Collection() {
  return (
    <section
      aria-labelledby="more-title"
      className="mx-auto mt-28 max-w-[90rem] px-4 sm:mt-40 sm:px-6 lg:px-10"
    >
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <h2
          id="more-title"
          className="font-wide text-[clamp(1.75rem,1.2rem+2vw,3rem)] leading-none font-medium tracking-[-0.03em] lg:col-span-6"
        >
          More from the collection
        </h2>
        <p className="max-w-[52ch] text-graphite lg:col-span-5 lg:col-start-8 lg:self-end">
          Concept builds are made for fictional brands to show what I would build for a real one. Personal projects
          are my own products and tools.
        </p>
      </div>

      <ul className="mt-10 border-t border-rule sm:mt-14">
        {collection.map((project) => (
          <li
            key={project.slug}
            id={project.slug}
            className="grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-3 border-b border-rule py-6 sm:grid-cols-[11rem_1fr] sm:gap-x-6 lg:grid-cols-12 lg:items-center lg:gap-6 lg:py-8"
          >
            <div className="overflow-hidden rounded-[2px] shadow-hang lg:col-span-3">
              <Image
                src={project.poster.src}
                width={project.poster.width}
                height={project.poster.height}
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 176px, 104px"
                alt={`Homepage of ${project.title}`}
                className="block h-auto w-full"
              />
            </div>
            <div className="min-w-0 lg:col-span-5">
              <h3 className="font-semiwide text-xl leading-tight font-semibold tracking-[-0.01em] sm:text-2xl">
                {project.title}
              </h3>
              <p className="mt-2 hidden max-w-[52ch] sm:block">{project.summary}</p>
            </div>
            <p className="col-span-2 text-[0.9375rem] leading-snug text-graphite sm:col-span-1 sm:col-start-2 lg:col-span-2 lg:col-start-auto">
              {project.medium}, {project.year}
              <br />
              {project.provenance}
            </p>
            <p className="col-span-2 flex flex-wrap gap-x-5 sm:col-span-1 sm:col-start-2 lg:col-span-2 lg:col-start-auto lg:flex-col lg:items-end">
              <ExternalLink href={project.liveUrl}>Live site</ExternalLink>
              <ExternalLink href={project.repoUrl}>Code</ExternalLink>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
