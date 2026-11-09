import { featuredSoftware, featuredWebsite } from '@/data/projects';
import { ApplicationWalkthrough } from './ApplicationWalkthrough';
import { FullLengthViewer } from './FullLengthViewer';
import { WallLabel } from './WallLabel';

const websiteSizes = {
  desktop: '(min-width: 1024px) 60vw, (min-width: 768px) 76vw, 80vw',
  phone: '(min-width: 768px) 260px, 78vw',
};

/**
 * Two featured pieces, one per side of the practice, set as mirror images:
 * the software tour hangs to the right of its label, the website to the left of its label.
 */
export function FeaturedWork() {
  const steps = featuredSoftware.walkthrough;
  const captures = featuredWebsite.captures;
  if (!steps || !captures) throw new Error('Featured projects need a walkthrough and full-length captures.');

  return (
    <section id="featured" aria-labelledby="featured-title" className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
      <h2 id="featured-title" className="sr-only">
        Featured work
      </h2>

      <article
        id={featuredSoftware.slug}
        aria-labelledby={`${featuredSoftware.slug}-title`}
        className="grid scroll-mt-24 gap-8 lg:grid-cols-12 lg:gap-6"
      >
        {/* The work comes first on small screens; on large screens the label hangs to its left. */}
        <div className="enter-hang lg:col-span-9 lg:col-start-4 lg:row-start-1">
          <ApplicationWalkthrough title={featuredSoftware.title} steps={steps} priority />
        </div>
        <WallLabel
          project={featuredSoftware}
          size="large"
          titleId={`${featuredSoftware.slug}-title`}
          className="lg:col-span-3 lg:col-start-1 lg:row-start-1"
        />
      </article>

      <article
        id={featuredWebsite.slug}
        aria-labelledby={`${featuredWebsite.slug}-title`}
        className="mt-24 grid scroll-mt-24 gap-8 sm:mt-36 lg:grid-cols-12 lg:gap-6"
      >
        <div className="lg:col-span-9 lg:row-start-1">
          <FullLengthViewer title={featuredWebsite.title} captures={captures} sizes={websiteSizes} />
        </div>
        <WallLabel
          project={featuredWebsite}
          size="large"
          titleId={`${featuredWebsite.slug}-title`}
          className="lg:col-span-3 lg:col-start-10 lg:row-start-1"
        />
      </article>
    </section>
  );
}
