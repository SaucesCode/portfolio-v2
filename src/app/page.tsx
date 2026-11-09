import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { FeaturedWork } from '@/components/FeaturedWork';
import { Intro } from '@/components/Intro';
import { Services } from '@/components/Services';
import { SiteHeader } from '@/components/SiteHeader';
import { WorkGallery } from '@/components/WorkGallery';
import { categoryLabels, projects } from '@/data/projects';
import { site } from '@/data/site';
import { getBaseUrl } from '@/lib/seo';

const baseUrl = getBaseUrl();

const workListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `Software and websites by ${site.name}`,
  itemListElement: projects.map((project, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': project.category === 'software' ? 'SoftwareApplication' : 'CreativeWork',
      name: project.title,
      description: project.summary,
      genre: categoryLabels[project.category],
      url: project.links[0].href,
      image: `${baseUrl}${project.poster.src}`,
      dateCreated: String(project.year),
      creator: { '@id': `${baseUrl}/#person` },
      sameAs: project.links.map((link) => link.href),
      ...(project.category === 'software' && { applicationCategory: 'BusinessApplication' }),
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
        <FeaturedWork />
        <WorkGallery />
        <Services />
        <About />
      </main>
      <Contact />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workListJsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  );
}
