import { Collection } from '@/components/Collection';
import { Contact } from '@/components/Contact';
import { Intro } from '@/components/Intro';
import { SelectedWork } from '@/components/SelectedWork';
import { Services } from '@/components/Services';
import { SiteHeader } from '@/components/SiteHeader';
import { projects } from '@/data/projects';
import { site } from '@/data/site';
import { getBaseUrl } from '@/lib/seo';

const baseUrl = getBaseUrl();

const workListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `Websites and applications by ${site.legalName}`,
  itemListElement: projects.map((project, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'CreativeWork',
      name: project.title,
      description: project.summary,
      url: project.liveUrl,
      image: `${baseUrl}${project.poster.src}`,
      dateCreated: String(project.year),
      creator: { '@id': `${baseUrl}/#person` },
      sameAs: project.repoUrl,
    },
  })),
};

export default function HomePage() {
  return (
    <div id="top">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[2px] focus:bg-ink focus:px-4 focus:py-3 focus:font-semibold focus:text-wall"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Intro />
        <SelectedWork />
        <Collection />
        <Services />
      </main>
      <Contact />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workListJsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  );
}
