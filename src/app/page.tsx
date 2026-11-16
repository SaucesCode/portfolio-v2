import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { FeaturedWork } from '@/components/FeaturedWork';
import { Intro } from '@/components/Intro';
import { Services } from '@/components/Services';
import { SiteHeader } from '@/components/SiteHeader';
import { SkipLink } from '@/components/SkipLink';
import { WorkGallery } from '@/components/WorkGallery';
import { WorkingWithMe } from '@/components/WorkingWithMe';
import { categoryLabels, projects } from '@/data/projects';
import { site } from '@/data/site';
import { getBaseUrl } from '@/lib/seo';

const baseUrl = getBaseUrl();

const workList = {
  '@type': 'ItemList',
  '@id': `${baseUrl}/#work`,
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

/** The homepage is the profile page of the person declared in the root layout, listing their work. */
const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfilePage',
      '@id': `${baseUrl}/#profile`,
      url: `${baseUrl}/`,
      mainEntity: { '@id': `${baseUrl}/#person` },
      isPartOf: { '@id': `${baseUrl}/#website` },
      hasPart: { '@id': `${baseUrl}/#work` },
      inLanguage: 'en',
    },
    workList,
  ],
};

export default function HomePage() {
  return (
    <div id="top">
      <SkipLink />
      <SiteHeader />
      <main id="main-content">
        <Intro />
        <FeaturedWork />
        <WorkGallery />
        <Services />
        <WorkingWithMe />
        <About />
      </main>
      <Contact />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  );
}
